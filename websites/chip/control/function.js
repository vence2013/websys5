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

exports.get = async (ctx, moduleid)=>{
    const ChipFunction = ctx.models['ChipFunction'];

    var list = await ChipFunction.findAll({/*logging: false, */raw: true, 
        where: {'ChipModuleId': moduleid}
    });
    
    return list.map((x)=>{
        x['content'] = x['content'].toString();
        return x;
    });
}
