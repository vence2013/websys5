/****************************************************************************** 
 * 文件名称 ： category.js
 * 功能说明 ： 文档的目录相关处理
 * 
 * 创建日期 ： 2019/5/22
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/22    - 创建文件。
 *****************************************************************************/  

exports.attach = async (ctx, categoryid, docid)=>{
    const Document = ctx.models['Document'];
    const Category = ctx.models['Category'];

    var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid}});
    if (!categoryIns) reutrn -1; // 无效的目录

    // 获取有效的文档
    var docIns = await Document.findOne({logging:false, where:{'id':docid}});
    if (!docIns) return -2; // 无效的文件

    await categoryIns.addDocuments(docIns, {logging:false});
    return 0;
}

exports.dettach = async (ctx, categoryid, docid)=>{
    const Document = ctx.models['Document'];
    const Category = ctx.models['Category'];

    var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid}});
    if (!categoryIns) reutrn -1; // 无效的目录

    // 获取有效的文档
    var docIns = await Document.findAll({logging:false, where:{'id':docid}});
    if (docIns) await categoryIns.removeDocuments(docIns, {logging:false});
    return 0;
}

// 搜索不在目录下的文件
exports.searchNotInCategory = async (ctx, categoryid, page, pageSize, str)=>{
    const Document = ctx.models['Document'];
    const Category = ctx.models['Category'];  
    var total=0, list, rellist=[], doclist=[];
    var sql, sqlCond="";

    if (categoryid) {
        // 查找目录关联的文档
        var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid}});
        var docInss = await categoryIns.getDocuments({logging:false}); 
        var ids = docInss.map((x)=>{ return x.get({plain:true})['id']; });
        if (ids.length) { 
            sqlCond += " AND `id` NOT IN("+ids.join(',')+") "; 

            list = await Document.findAll({logging:false, raw:true, where:{'id':ids}});
            rellist = list.map((x)=>{
                x['content'] = x.content ? x.content.toString() : '';
                return x;
            });
        }
    }

    // 搜索文件的名称或描述
    if (str && str.length) {
        str.map((x)=>{
            if (x) sqlCond += " AND `content` LIKE '%"+x+"%' ";
        });
    }
    sqlCond = sqlCond ? ' WHERE '+sqlCond.substr(4) : '';

    // 计算分页数据
    sql = "SELECT COUNT(*) AS num FROM `Documents` "+sqlCond;
    
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    total = res[0]['num'];
    var maxpage  = Math.ceil(total/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

    // 查询当前分页的列表数据
    var offset = (page - 1) * pageSize;
    sql = "SELECT * FROM `Documents` "+sqlCond+" ORDER BY `createdAt` DESC LIMIT "+offset+", "+pageSize+" ;";
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    doclist = res.map((x)=>{
        x['content'] = x.content ? x.content.toString() : '';
        return x;
    });

    return {'total':total, 'page':page, 'rellist':rellist, 'doclist':doclist};
}