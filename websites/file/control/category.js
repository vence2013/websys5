/****************************************************************************** 
 * 文件名称 ： category.js
 * 功能说明 ： 文件的目录相关处理
 * 
 * 创建日期 ： 2019/4/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/4/27    - 创建文件。
 *****************************************************************************/  

exports.attach = async (ctx, userid, categoryid, fileids)=>{
    const File  = ctx.models['File'];
    const Category = ctx.models['Category'];

    var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid , 'ownerId':userid}});
    if (!categoryIns) reutrn -1; // 无效的目录

    // 获取有效的文件
    var fileInss = await File.findAll({logging:false, where:{'id':fileids}});
    if (!fileInss) return -2; // 无效的文件

    await categoryIns.addFiles(fileInss, {logging:false});
    return 0;
}

exports.dettach = async (ctx, userid, categoryid, fileids)=>{
    const File  = ctx.models['File'];
    const Category = ctx.models['Category'];

    var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid , 'ownerId':userid}});
    if (!categoryIns) reutrn -1; // 无效的目录

    // 获取有效的文件
    var fileInss = await File.findAll({logging:false, where:{'id':fileids}});
    if (fileInss) await categoryIns.removeFiles(fileInss, {logging:false});
    return 0;
}

/* isRelate - true表示获取目录关联文档， false表示获取非关联的文档
 */
exports.relate = async (ctx, userid, categoryid, page, pageSize, str, isRelate)=>{
    const User = ctx.models['User'];
    const Group = ctx.models['Group'];
    const Category = ctx.models['Category'];    
    var total=0, filelist=[];


    // 获取目录关联的文件
    var categoryIns = await Category.findOne({logging:false, where:{'id':categoryid , 'ownerId':userid}});
    if (categoryIns) {
        var sql, sqlCond="";

        var fileInss = await categoryIns.getFiles({logging:false});        
        var ids = fileInss.map((x)=>{ return x.get({plain:true})['id']; });
        // 如果该目录没有关联文件，则返回空数据
        if (!ids.length && isRelate) return {'total':total, 'page':page, 'filelist':filelist};

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
                if (x) sqlCond += " AND (`name` LIKE '%"+x+"%' OR `desc` LIKE '%"+x+"%') ";
            });
        }
        // 在关联文件中查找
        if (ids.length) { sqlCond += " AND `id` "+(isRelate ? "" : " NOT ")+" IN("+ids.join(',')+") "; }

        // 计算分页数据
        sql = "SELECT COUNT(*) AS num FROM `Files` "+sqlCond;
        var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
        total = res[0]['num'];
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
    }

    return {'total':total, 'page':page, 'filelist':filelist};
}