/****************************************************************************** 
 * 文件名称 ： document.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/27    - 创建文件。
 *****************************************************************************/  

/* 添加文档，关联标签和位组 */
exports.edit = async (ctx, funcid, content, moduleid, bitsids)=>{
    const ChipFunction = ctx.models['ChipFunction'];
    var bitslist = bitsids.join(',');

    if (funcid) {
        var docIns = await ChipFunction.findOne({logging: false, where: {'id':funcid}});
        if (!docIns) return -2; // 无效文档

        await docIns.update({'content':content, 'ChipModuleId':moduleid, 'bitslist':bitslist});
        return 0;
    } else {
        var [docIns, created] = await ChipFunction.findOrCreate({logging: false,
            where: {'content':content, 'ChipModuleId':moduleid}, defaults:{'bitslist':bitslist}
        });
        return created ? 0 : -1; // 修改失败
    }
}

exports.delete = async(ctx, funcid)=>{    
    const ChipFunction = ctx.models['ChipFunction'];

    await ChipFunction.destroy({logging: false, 'where': {'id': funcid}});
}

exports.detail = async (ctx, funcid)=>{
    const ChipModule = ctx.models['ChipModule'];
    const ChipFunction = ctx.models['ChipFunction'];

    var ret = await ChipFunction.findOne({logging: false, raw:true, 'where': {'id': funcid}});
    ret['content'] = ret['content'].toString();
    
    var moduleObj = await ChipModule.findOne({logging: false, raw:true, 'where': {'id': ret.ChipModuleId}});
    if (moduleObj) {
        ret['ChipId'] = moduleObj.ChipId;
    }
    return ret;
}






















exports.search = async (ctx, ChipId, ModuleId, content, createget, createlet, order, page, pageSize)=>{
    var sql, sqlCond = '';

    sqlCond = " WHERE `ChipId`='"+ChipId+"' ";
    if (ModuleId) {
        sqlCond += " AND `id` IN (SELECT `ChipDocumentId` FROM `ChipDocumentModule` WHERE `ChipModuleId`='"+ModuleId+"') ";
    }

    // 根据搜索条件构建SQL条件
    if (content && content.length) {
        content.map((x)=>{ sqlCond += " AND `content` LIKE '%"+x+"%' " });
    }
    if (createget)  { sqlCond += " AND `createdAt`>='"+createget+"' "; }
    if (createlet)  { sqlCond += " AND `createdAt`<='"+createlet+"' "; }

    // 计算分页数据
    sql = "SELECT COUNT(*) AS num FROM `ChipDocuments` "+sqlCond;
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false}); 
    var total = res[0]['num'];
    var maxpage  = Math.ceil(total/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

    // 查询当前分页的列表数据
    var offset = (page - 1) * pageSize;
    sql = "SELECT * FROM `ChipDocuments` "+sqlCond+" ORDER BY "+order.join(' ')+" LIMIT "+offset+", "+pageSize+" ;";
    var [res, meta] = await ctx.sequelize.query(sql, {logging: false});
    var doclist = res.map((x)=>{
        // 将buffer转换为字符串
        x['content'] = x.content ? x.content.toString() : '';
        return x;
    });

    return {'total':total, 'page':page, 'doclist':doclist};
}