/****************************************************************************** 
 * 文件名称 ： document.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/27    - 创建文件。
 *****************************************************************************/  

/* 添加文档，关联标签和位组
 */
exports.edit = async (ctx, docid, content, chipid, moduleids, bitsids)=>{
    const ChipModule = ctx.models['ChipModule'];
    const ChipDocument = ctx.models['ChipDocument'];
    var bitslist = bitsids.join(',');

    if (docid) {
        var docIns = await ChipDocument.findOne({logging: false, where: {'id':docid}});
        if (!docIns) return -1; // 无效或无权修改
        await docIns.update({'content':content, 'ChipId':chipid, 'bitslist':bitslist});
        // 关联模块
        var moduleInss = await ChipModule.findAll({logging:false, where:{'id':moduleids}});
        await docIns.setChipModules(moduleInss, {logging:false});
    } else {
        var [docIns, created] = await ChipDocument.findOrCreate({logging: false,
            where: {'content':content, 'ChipId':chipid}, defaults:{'bitslist':bitslist}
        });
        // 关联模块
        var moduleInss = await ChipModule.findAll({logging:false, where:{'id':moduleids}});
        await docIns.setChipModules(moduleInss, {logging:false});
    }

    return 0;
}

exports.delete = async(ctx, docid)=>{
    const ChipDocument = ctx.models['ChipDocument'];

    await ChipDocument.destroy({logging: false, 'where': {'id': docid}});
}

/* 获取文档的信息， 关联的芯片名称， 关联的模块名称， 关联的寄存器名称及位组名称 */
exports.detail = async (ctx, docid)=>{
    const Chip = ctx.models['Chip'];
    const ChipModule = ctx.models['ChipModule'];
    const ChipRegister = ctx.models['ChipRegister'];
    const ChipBit = ctx.models['ChipBit'];
    const ChipDocument = ctx.models['ChipDocument'];

    var docObj = await ChipDocument.findOne({logging: false, raw:true, where: {'id':docid}});
    if (docObj) {
        docObj['content'] = docObj['content'].toString();
        // 获取芯片名称
        var chipObj = await Chip.findOne({logging:false, raw:true, where:{'id':docObj.ChipId}});
        docObj['chip'] = chipObj['name'];

        // 根据位组列表，逆向构建'模块列表/寄存器列表/位组列表'树形结构
        /*
        // 获取模块名称
        if (docObj.ChipModuleId) {
            var moduleObj = await ChipModule.findOne({logging:false, raw:true, where:{'id':docObj.ChipModuleId}});
            if (moduleObj) docObj['module'] = moduleObj['name'];
        }
        // 获取位组及寄存器名称数据
        if (docObj.bitslist) {
            
        }*/
    }

    return docObj;
}

exports.search = async (ctx, ChipId, ModuleId, content, createget, createlet, order, page, pageSize)=>{
    var sql, sqlCond = '';

    if (ModuleId) {
        sqlCond = " WHERE `id`IN (SELECT `ChipDocumentId` FROM `ChipDocumentModule` WHERE `ChipModuleId`='"+ModuleId+"') ";
    } else {
        sqlCond = " WHERE `ChipId`='"+ChipId+"' ";
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