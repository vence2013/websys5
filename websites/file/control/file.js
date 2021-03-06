/****************************************************************************** 
 * 文件名称 ： file.js
 * 功能说明 ： 
 *      文件处理
 * 
 * 创建日期 ： 2019/4/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/4/27    - 创建文件。
 *****************************************************************************/  

const fs = require('fs');
const crypto = require('crypto');
const moment = require('moment');
const mkdirp = require('mkdirp');


/* 
 * Function     : genPath
 * Description  : 生成文件上传后的存储路径。
 * 路径格式: dataroot/upload/{big, median, small}/yearmonth/hash.ext
 * 
 * 路径说明：
 * 1. 目录使用年月命名， 比如201809
 * 2. 文件名称使用上传时文件的名称和时间戳进行sha256加密的字符串。
 * Parameter    : 
 *      filename    - 文件名称， 用户计算存储文件名
 * Return       : 文件在服务器上的存储路径
 */

function genPath(name, ext, size) {
    const hash = crypto.createHash('sha256');
    var filepath = '/upload/';

    if (size<(100*1024*1024)) { filepath += 'small/'; }         // <100MB
    else if (size<(1024*1024*1024)) { filepath += 'median/';  } // <1GB
    else { filepath += 'big/'; }
    var datestr =  moment().format("YYYYMMDD");
    filepath += datestr+'/';
    // 如果目录不存在，则创建该目录。
    if (!fs.existsSync(filepath)) { mkdirp.sync(filepath); }

    // 添加时间戳，修正已上传文件被覆盖的问题
    hash.update(name+datestr);
    var filename = (new Date().getTime())+hash.digest('hex')+'.'+ext;
    filepath += filename;

    return filepath;
}

exports.create = async (ctx, userid, file)=>{
    const File = ctx.models['File'];

    var name = file.name.replace(/(^\s*)|(\s*$)/g, "");
    var size = file.size;
    var ext  = (name.indexOf('.')!=-1) ? name.split('.').pop().toLowerCase() : '';
    // 生成服务器的存储路径
    var location = genPath(name, ext, size);

    // 添加数据库信息， 默认权限为任何人可读    
    var [fileIns, created] = await File.findOrCreate({logging: false,
        where: {'name': name, 'size': size, 'ext': ext, 'ownerId':userid},
        defaults: {'location': location, 'desc': '', 'private': 'GR1OR1' }
    });
    if (created) { // 移动上传的文件到指定路径
        const reader = fs.createReadStream(file.path);
        const upStream = fs.createWriteStream(location);
        reader.pipe(upStream);
    }
    
    return created;
}

exports.update = async (ctx, userid, id, name, desc, private)=>{
    const File = ctx.models['File'];

    var fileIns = await File.findOne({logging:false, where: {'id':id, 'ownerId':userid}});
    if (!fileIns) return -1; // 无效的文件， 或该文件不属于当前用户
    
    await fileIns.update({'name':name, 'desc':desc, 'private':private}, {logging: false});
    return 0;
}


exports.delete = async (ctx, userid, id)=>{
    const File = ctx.models['File'];

    var fileIns = await File.findOne({logging: false, where: {'id': id, 'ownerId':userid}});
    if (!fileIns) return -1;

    var fileObj = fileIns.get({plain: true});
    // 删除文件本身
    fs.unlink(fileObj.location, (err) => {
        if (err) {
            console.log("ERROR["+__filename+"|delete()] - l1, error:%o.", err);
        } else {
            console.log("INFO["+__filename+"|delete()] - l1, file(%s/%s) was delete.", fileObj.name, fileObj.location);
        }
    });
    // 删除数据库记录
    await File.destroy({logging: false, 'where': {'id': id}});
    return 0;
}

/* 获取文件相关的所有信息，包括文件信息，关联的标签列表， 关联的目录ID列表 */
exports.detail = async (ctx, userid, fileid)=>{
    const User = ctx.models['User'];
    const File = ctx.models['File'];

    var fileIns = await File.findOne({logging: false, 
        where: {'id': fileid} 
    });
    if (!fileIns) return {}; // 无效文件

    var fileObj = fileIns.get({plain: true});
    fileObj['desc'] = fileObj['desc'].toString();
    // 获取创建用户名称
    var userObj = await User.findOne({raw:true, logging:false, where:{'id': fileObj.ownerId}});
    fileObj['owner'] = userObj.username;
    // 获取关联的标签和目录
    var tagObjs = await fileIns.getTags({raw:true, logging:false});
    fileObj['tagnames'] = tagObjs.map((x)=>{ return x.name; });
    // 如果当前的用户为文件的创建者，则获取目录信息
    if (fileObj.ownerId == userid) {
        var categoryObjs = await fileIns.getCategories({raw:true, logging:false});
        fileObj['categoryids'] = categoryObjs.map((x)=>{ return x.id; });
    }

    return fileObj;
}

/* 该函数只用于编辑页面的文件列表搜索， 所以只获取创建者为当前用户的文件 */
exports.search = async (ctx, userid, str, page, pageSize)=>{
    var sql, sqlCond="";

    // 构建查询条件
    sqlCond = " WHERE `ownerId`="+userid+" ";
    if (str && str.length) {
        str.map((x)=>{
            if (x) sqlCond += " AND (`name` LIKE '%"+x+"%' OR `desc` LIKE '%"+x+"%') ";
        });
    }

    // 计算分页数据
    sql = "SELECT COUNT(*) AS num FROM `Files` "+sqlCond;
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var total = res[0]['num'];
    var maxpage  = Math.ceil(total/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

    // 查询当前分页的列表数据
    var offset = (page - 1) * pageSize;
    sql = "SELECT * FROM `Files` "+sqlCond+" ORDER BY `createdAt` DESC LIMIT "+offset+", "+pageSize+" ;";
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var filelist = res.map((x)=>{
        x['desc'] = x.desc ? x.desc.toString() : '';
        return x;
    });

    return {'total':total, 'page': page, 'pageMaxium':maxpage, 'filelist':filelist};
}


// 高级搜索
exports.search2 = async (ctx, userid, query, page, pageSize)=>{
    const User = ctx.models['User'];
    const Group = ctx.models['Group'];
    const Tag  = ctx.models['Tag']; 
    var sql, sqlCond = '';

    /* 搜索可读取的文件
     * 1. 允许其他用户访问的文件
     * ( 如果是登录用户 )
     * 2. 创建者为当前用户的文件
     * 3. 创建者为当前用户所属组对应用户的，且允许组用户访问的，
     */    
    sqlCond = " WHERE (`private` LIKE '%OR1%' "; // 其他用户可访问
    if (userid) {        
        var res = await User.findAll({logging:false, raw:true, 
            where: {'id':userid}, 
            include: [{ model: Group }]
        });
        var names = res.map((x)=>{ return x['Groups.name']; })
        var res2 = await User.findAll({logging: false, raw:true, 
            where: {'username': names}
        });
        var ids = res2.map((x)=>{ return x['id']; });
        sqlCond += " OR `ownerId`="+userid+" ";
        if (ids.length) { sqlCond += " OR (`ownerId` IN ("+ids.join(',')+") AND `private` LIKE '%GR1%') "; }
    }
    sqlCond += " ) ";

    // 根据搜索条件构建SQL条件
    if (query.name && query.name.length) {
        query.name.map((x)=>{ sqlCond += " AND `name` LIKE '%"+x+"%' " });
    }
    if (query.desc && query.desc.length) {
        query.desc.map((x)=>{ sqlCond += " AND `desc` LIKE '%"+x+"%' " });
    }
    if (query.ext && query.ext.length) {
        var extstr = '';
        query.ext.map((x)=>{ extstr += ", '"+x+"' "; });
        sqlCond += " AND `ext` IN ("+extstr.substr(1)+") ";
    }
    if (query.sizeget)    { sqlCond += " AND `size`>="+query.sizeget+" "; }
    if (query.sizelet)    { sqlCond += " AND `size`<="+query.sizelet+" "; }
    if (query.createget)  { sqlCond += " AND `createdAt`>='"+query.createget+"' "; }
    if (query.createlet)  { sqlCond += " AND `createdAt`<='"+query.createlet+"' "; }
    // 查找同时关联多个标签的文件。
    if (query.tag && query.tag.length) {
        var tagObjs = await Tag.findAll({raw: true, logging: false, where: {'name': query.tag}});
        // 只搜索有效的标签。
        if (tagObjs && tagObjs.length) {
            var idstr = '';
            tagObjs.map((x)=>{ idstr += ', '+x.id; });        
            var sql2 = "SELECT `FileId` FROM `FileTag` WHERE `TagId` IN ("+idstr.substr(1)+
                       ") GROUP BY `FileId` HAVING COUNT(*)>="+tagObjs.length;
            sqlCond += " AND `id` IN ("+sql2+") "; 
        }
    }

    // 计算分页数据
    sql = "SELECT COUNT(*) AS num FROM `Files` "+sqlCond;
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var total = res[0]['num'];
    var maxpage  = Math.ceil(total/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

    // 查询当前分页的列表数据
    var offset = (page - 1) * pageSize;
    sql = "SELECT * FROM `Files` "+sqlCond+" ORDER BY "+query.order.join(' ')+" LIMIT "+offset+", "+pageSize+" ;";
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var filelist = res.map((x)=>{
        x['desc'] = x.desc ? x.desc.toString() : '';
        return x;
    });

    return {'total':total, 'page':page, 'pageMaxium':maxpage, 'filelist':filelist};
}

exports.getById = async (ctx, id)=>{
    const File = ctx.models['File'];

    return await File.findOne({logging: false, where: {'id': id}});
}