/****************************************************************************** 
 * 文件名称 ： category.js
 * 功能说明 ： 文档的目录相关处理
 * 
 * 创建日期 ： 2019/5/22
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/22    - 创建文件。
 *****************************************************************************/  

exports.attach = async (ctx, userid, categoryid, ids)=>{
    const Document = ctx.models['Document'];
    const Category = ctx.models['Category'];

    var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid , 'ownerId':userid}});
    if (!categoryIns) reutrn -1; // 无效的目录

    // 获取有效的文档
    var docInss = await Document.findAll({logging:false, where:{'id':ids}});
    if (!docInss) return -2; // 无效的文件

    await categoryIns.addDocuments(docInss, {logging:false});
    return 0;
}

exports.dettach = async (ctx, userid, categoryid, fileids)=>{
    const Document = ctx.models['Document'];
    const Category = ctx.models['Category'];

    var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid , 'ownerId':userid}});
    if (!categoryIns) reutrn -1; // 无效的目录

    // 获取有效的文档
    var docInss = await Document.findAll({logging:false, where:{'id':fileids}});
    if (docInss) await categoryIns.removeDocuments(docInss, {logging:false});
    return 0;
}

// 获取目录关联的文件，以及未关联文件的分页列表
exports.get = async (ctx, userid, categoryid, page, pageSize, str)=>{
    const User = ctx.models['User'];
    const Group = ctx.models['Group'];
    const Document = ctx.models['Document'];
    const Category = ctx.models['Category'];    

    // 获取目录关联的文件
    var ids = [];
    var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid , 'ownerId':userid}});
    if (categoryIns) {
        var docInss = await categoryIns.getDocuments({logging:false});        
        ids = docInss.map((x)=>{ return x.get({plain:true})['id']; });
    }

    // 获取未关联文件的分页列表
    var sql, sqlCond="";
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
        var ids2 = res2.map((x)=>{ return x['id']; });
        sqlCond += " OR `ownerId`="+userid+" ";
        if (ids2.length) { sqlCond += " OR (`ownerId` IN ("+ids2.join(',')+") AND `private` LIKE '%GR1%') "; }
    }
    sqlCond += " ) ";
    // 搜索文件的名称或描述
    if (str && str.length) {
        str.map((x)=>{
            if (x) sqlCond += " AND `content` LIKE '%"+x+"%' ";
        });
    }
    // 排除已属于该目录的文件
    if (ids.length) {
        sqlCond += " AND `id` NOT IN("+ids.join(',')+") ";
    }

    // 计算分页数据
    sql = "SELECT COUNT(*) AS num FROM `Documents` "+sqlCond;
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var total = res[0]['num'];
    var maxpage  = Math.ceil(total/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

    // 查询当前分页的列表数据
    var offset = (page - 1) * pageSize;
    sql = "SELECT * FROM `Documents` "+sqlCond+" ORDER BY `createdAt` DESC LIMIT "+offset+", "+pageSize+" ;";
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var doclist = res.map((x)=>{
        x['content'] = x.content ? x.content.toString() : '';
        return x;
    });

    var docrel = await Document.findAll({logging:false, where:{'id':ids}});
    for (var i=0; i<docrel.length; i++) { docrel[i]['content'] = docrel[i]['content'].toString(); }

    return {'total':total, 'page': page, 'pageMaxium':maxpage, 'docres':doclist, 'docrel':docrel}
}