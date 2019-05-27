/****************************************************************************** 
 * 文件名称 ： document.js
 * 功能说明 ： 文档处理
 * 
 * 创建日期 ： 2019/5/26
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/26    - 创建文件。
 *****************************************************************************/  


exports.relate = async (ctx, userid, tagid, str, page, pageSize)=>{
    const User = ctx.models['User'];
    const Group = ctx.models['Group'];
    const Tag  = ctx.models['Tag']; 
    var sql, sqlCond = '';
    var total=0, maxpage=1, doclist = [];

    var tagObj = await Tag.findOne({raw: true, logging: false, where: {'id': tagid}});
    if (tagObj) {
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

        if (str && str.length) { str.map((x)=>{ sqlCond += " AND `content` LIKE '%"+x+"%' " }); }
        // 标签关联文档的搜索
        sqlCond += " AND `id` IN (SELECT `DocumentId` FROM `DocumentTag` WHERE `TagId` IN ("+tagid+")) "; 

        // 计算分页数据
        sql = "SELECT COUNT(*) AS num FROM `Documents` "+sqlCond;
        var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
        total = res[0]['num'];
        maxpage  = Math.ceil(total/pageSize);
        maxpage = (maxpage<1) ? 1 : maxpage;
        page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

        // 获取创建者的用户名称
        var userlist = await User.findAll({raw:true, logging:false, attributes:['id', 'username']});
        // 查询当前分页的列表数据
        var offset = (page - 1) * pageSize;
        sql = "SELECT * FROM `Documents` "+sqlCond+" ORDER BY `createdAt` DESC LIMIT "+offset+", "+pageSize+" ;";
        var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
        doclist = res.map((x)=>{
            x['content'] = x.content ? x.content.toString() : '';
            // 查找创建者的用户名
            for (var i=0; i<userlist.length; i++) {
                if (userlist[i]['id']!=x.ownerId) continue;
                x['owner'] = userlist[i]['username'];
                break;
            }
            return x;
        });
    }

    return {'total':total, 'page':page, 'doclist':doclist};
}