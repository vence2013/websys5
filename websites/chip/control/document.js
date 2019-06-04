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
exports.edit = async (ctx, docid, content, chipid, moduleid, bitsids)=>{
    const ChipDocument = ctx.models['ChipDocument'];
    var bitslist = bitsids.join(',');

    if (docid) {
        var docIns = await ChipDocument.findOne({logging: false, where: {'id':docid}});
        if (!docIns) return -1; // 无效或无权修改
        await docIns.update({'content':content, 'ChipId':chipid, 'ChipModuleId':moduleid, 'bitslist':bitslist});
    } else {
        var [docIns, created] = await ChipDocument.findOrCreate({logging: false,
            where: {'content':content, 'ChipId':chipid, 'ChipModuleId':moduleid}, defaults:{'bitslist':bitslist}
        });
    }

    return 0;
}

exports.delete = async(ctx, docid)=>{
    const ChipDocument = ctx.models['ChipDocument'];

    await ChipDocument.destroy({logging: false, 'where': {'id': docid}});
}

exports.getById = async (ctx, docid)=>{
    const ChipDocument = ctx.models['ChipDocument'];

    var docObj = await ChipDocument.findOne({logging: false, raw:true, where: {'id':docid}});
    docObj['content'] = docObj['content'].toString();
    return docObj;
}