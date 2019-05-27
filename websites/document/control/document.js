/****************************************************************************** 
 * 文件名称 ： document.js
 * 功能说明 ： 文档处理
 * 
 * 创建日期 ： 2019/5/12
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/12    - 创建文件。
 *****************************************************************************/  


const fs   = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');


exports.edit = async (ctx, userid, docid, content, private, taglist, categoryids)=>{
    const Document = ctx.models['Document'];
    const Tag = ctx.models['Tag'];
    const Category = ctx.models['Category'];

    if (docid) {
        var docIns = await Document.findOne({logging: false, where: {'id':docid}});
        if (!docIns) return -1; // 无效或无权修改
        await docIns.update({'content':content, 'private':private});
    } else {
        var [docIns, created] = await Document.findOrCreate({logging: false,
            where: {'content':content, 'ownerId':userid},
            defaults: {'private':private}
        });
    }
    // 关联标签
    var tagInss = await Tag.findAll({logging:false, where:{'name':taglist}});
    await docIns.setTags(tagInss);
    // 关联目录
    var categoryInss = await Category.findAll({logging:false, where:{'id':categoryids}});
    await docIns.setCategories(categoryInss);

    return 0;
}

exports.delete = async(ctx, userid, docid)=>{
    const Document = ctx.models['Document'];

    var docObj = await Document.findOne({logging: false, raw:true, 'where': {'id': docid}});
    // 文件有效， 且创建者为当前用户
    if (docObj && (docObj.ownerId==userid)) {
        await Document.destroy({logging: false, 'where': {'id': docid}});
    }
}

/* 返回文档的详细信息：doc[*], owner, tagnames, categoryids */
exports.detail = async (ctx, userid, docid)=>{
    const Document = ctx.models['Document'];
    const User = ctx.models['User'];

    var docIns = await Document.findOne({logging:false, where:{'id':docid}});
    if (!docIns) return null;

    var docObj = docIns.get({plain:true});
    docObj['content'] = docObj['content'].toString();
    // 获取创建用户名
    var userObj = await User.findOne({logging:false, raw:true, where:{'id':docObj.ownerId}});
    docObj['owner'] = userObj.username;
    // 关联标签名称列表
    var tagObjs = await docIns.getTags({raw:true, logging:false});
    docObj['tagnames'] = tagObjs.map((x)=>{ return x.name; });
    // 如果当前的用户为创建者，则获取目录信息
    if (docObj.ownerId == userid) {
        var categoryObjs = await docIns.getCategories({raw:true, logging:false});
        docObj['categoryids'] = categoryObjs.map((x)=>{ return x.id; });
    }

    return docObj;
}

exports.search = search;

async function search(ctx, userid, query) 
{
    const User = ctx.models['User'];
    const Group = ctx.models['Group'];
    const Tag  = ctx.models['Tag']; 
    const Document  = ctx.models['Document']; 
    var sql, sqlCond = '';

    /* 搜索可读取的文件
     * 1. 允许其他用户访问的， 或
     * ( 如果是登录用户 )
     * 2. 创建者为当前用户的， 或
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
    if (query.content && query.content.length) {
        query.content.map((x)=>{ sqlCond += " AND `content` LIKE '%"+x+"%' " });
    }
    if (query.createget)  { sqlCond += " AND `createdAt`>='"+query.createget+"' "; }
    if (query.createlet)  { sqlCond += " AND `createdAt`<='"+query.createlet+"' "; }
    // 查找同时关联多个标签的文件。
    if (query.tag && query.tag.length) {
        var tagObjs = await Tag.findAll({raw: true, logging: false, where: {'name': query.tag}});
        // 只搜索有效的标签。
        if (tagObjs && tagObjs.length) {
            var idstr = '';
            tagObjs.map((x)=>{ idstr += ', '+x.id; });        
            var sql2 = "SELECT `DocumentId` FROM `DocumentTag` WHERE `TagId` IN ("+idstr.substr(1)+
                       ") GROUP BY `DocumentId` HAVING COUNT(*)>="+tagObjs.length;
            sqlCond += " AND `id` IN ("+sql2+") "; 
        }
    }

    var page     = query.page;
    var pageSize = query.pageSize;
    // 计算分页数据
    sql = "SELECT COUNT(*) AS num FROM `Documents` "+sqlCond;
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var total = res[0]['num'];
    var maxpage  = Math.ceil(total/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

    // 获取创建者的用户名称
    var userlist = await User.findAll({raw:true, logging:false, attributes:['id', 'username']});
    // 查询当前分页的列表数据
    var docids = [];
    var offset = (page - 1) * pageSize;
    sql = "SELECT * FROM `Documents` "+sqlCond+" ORDER BY "+query.order.join(' ')+" LIMIT "+offset+", "+pageSize+" ;";
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var doclist = res.map((x)=>{
        docids.push(x.id);
        // 将buffer转换为字符串
        x['content'] = x.content ? x.content.toString() : '';
        // 查找创建者的用户名
        for (var i=0; i<userlist.length; i++) {
            if (userlist[i]['id']!=x.ownerId) continue;
            x['owner'] = userlist[i]['username'];
            break;
        }
        return x;
    });

    // 查找当页文件的标签
    var tagObjs = await Tag.findAll({raw:true, logging:false,
        include: [{
            model: Document,
            where: {'id':docids}
        }]
    });
    var taglist = [];
    tagObjs.map((x)=>{ taglist.push(x.name); });

    return {'total':total, 'page':page, 'pageMaxium':maxpage, 'doclist':doclist, 'taglist':taglist};
}


exports.export2file = async (ctx, userid, query)=>{
    var ret = await search(ctx, userid, query);
    
    // 提取文档中的文件
    var filelist = [];
    var docs = ret.doclist;
    for (var i=0; i<docs.length; i++) {
        var content = docs[i]['content'].toString();
        var arr = content.match(/\[[^\]]*\]\(\/upload\/[^\)]+\)/g);
        for (var j=0; arr && j<arr.length; j++) {
            var url = arr[j].replace(/\[[^\]]*\]\(([^\)]+)\)/, "$1");
            filelist.push(url);
            // 替换content中的路径
            var url2 = 'file/'+url.substr(8);
            content = content.replace(url, url2);
        }
        docs[i]['content'] = content;
    }
    // 如果 /export/file/ 不存在，则创建
    var fileExportDir = '/export/file/';
    // 复制相关文件
    for (var i=0; i<filelist.length; i++) {
        var dst = fileExportDir+filelist[i].substr(8);
        var obj = path.parse(dst);
        if (!fs.existsSync(obj.dir)) { mkdirp.sync(obj.dir); }

        var readStream = fs.createReadStream(filelist[i]);
        var writeStream= fs.createWriteStream(dst, {mode:0777});
        readStream.pipe(writeStream);
    }

    // 将文档输出到文件
    for (var i=0; i<docs.length; i++) {
        var content = docs[i]['content'];

        var res = content.match(/^#\s*([^\n]+)/);
        var res2 = content.match(/[\S]+/);
        var title = res ? res[1] : res2[0];
        var filename = '/export/'+title+'.md';
        fs.writeFileSync(filename, content);
    }

    fs.chmodSync('/export/file', 0777);
}