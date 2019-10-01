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


exports.edit = async (ctx, username, docid, content, taglist)=>{
    const Document = ctx.models['Document'];
    const Tag = ctx.models['Tag'];

    if (docid) {
        var docIns = await Document.findOne({logging: false, where: {'id':docid}});
        if (!docIns) return -1; // 无效或无权修改
        await docIns.update({'content':content});
    } else {
        var [docIns, created] = await Document.findOrCreate({logging: false,
            where: {'content':content, 'owner':username}
        });
    }
    // 关联标签
    var tagInss = await Tag.findAll({logging:false, where:{'name':taglist}});
    await docIns.setTags(tagInss);
    return 0;
}

exports.delete = async(ctx, username, docid)=>{
    const Document = ctx.models['Document'];

    var docObj = await Document.findOne({logging: false, raw:true, 'where': {'id': docid}});
    // 文件有效， 且创建者为当前用户
    if (docObj && (docObj.owner==username)) {
        await Document.destroy({logging: false, 'where': {'id': docid}});
    }
}

/* 返回文档的详细信息：doc[*], tagnames */
exports.detail = async (ctx, docid)=>{
    const Document = ctx.models['Document'];

    var docIns = await Document.findOne({logging:false, where:{'id':docid}});
    if (!docIns) return null;

    var docObj = docIns.get({plain:true});
    docObj['content'] = docObj['content'].toString();
    // 关联标签名称列表
    var tagObjs = await docIns.getTags({raw:true, logging:false});
    docObj['tagnames'] = tagObjs.map((x)=>{ return x.name; });

    return docObj;
}

exports.search = search;

async function search(ctx, query) 
{
    const Tag  = ctx.models['Tag']; 
    const Document  = ctx.models['Document']; 
    var sql, sqlCond = '';

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
    sqlCond = sqlCond ? " WHERE "+sqlCond.substr(4) : "";

    var page     = query.page;
    var pageSize = query.pageSize;
    // 计算分页数据
    sql = "SELECT COUNT(*) AS num FROM `Documents` "+sqlCond;
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var total = res[0]['num'];
    var maxpage  = Math.ceil(total/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

    // 查询当前分页的列表数据
    var docids = [];
    var offset = (page - 1) * pageSize;
    sql = "SELECT * FROM `Documents` "+sqlCond+" ORDER BY "+query.order.join(' ')+" LIMIT "+offset+", "+pageSize+" ;";
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var doclist = res.map((x)=>{
        docids.push(x.id);
        // 将buffer转换为字符串
        x['content'] = x.content ? x.content.toString() : '';
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


exports.export2file = async (ctx, query)=>{
    var ret = await search(ctx, query);
    
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
    if (!fs.existsSync(fileExportDir)) { mkdirp.sync(fileExportDir); } // 如果目录不存在，则创建该目录。
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