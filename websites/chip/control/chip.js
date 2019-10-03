/****************************************************************************** 
 * 文件名称 ： chip.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/27    - 创建文件。
 *****************************************************************************/  


exports.edit = async (ctx, chipid, name, width)=>{
    const Chip = ctx.models['Chip'];
    
    if (!chipid) {
        var [chipIns, created] = await Chip.findOrCreate({logging:false, 
            where: {'name':name, 'width':width}
        });
        return created ? 0 : -1;
    } else {
        var chipIns = await Chip.findOne({logging:false, where:{'id':chipid}});
        if (!chipIns) return -1;

        await chipIns.update({'name':name, 'width':width}, {logging:false});
    }
    return 0;
}

exports.delete = async (ctx, chipid)=>{
    const Chip = ctx.models['Chip'];

    await Chip.destroy({logging: false, where: {'id': chipid}});
}

exports.get = async (ctx)=>{
    const Chip = ctx.models['Chip'];

    return await Chip.findAll({logging: false, raw: true});
}

// 获取芯片相关的所有寄存器，位组
exports.all = async (ctx, chipid)=>{
    const ChipModule = ctx.models['ChipModule'];
    const ChipRegister = ctx.models['ChipRegister'];
    const ChipBit = ctx.models['ChipBit'];
    var ret = {'registerlist':[], 'bitslist':[]};

    var moduleObjs = await ChipModule.findAll({logging:false, raw:true, where:{'ChipId':chipid}});
    if (moduleObjs.length) {
        var moduleids = moduleObjs.map((x)=>{ return x.id; });        
        var registerObjs = await ChipRegister.findAll({logging:false, raw:true, where:{'ChipModuleId':moduleids}});
        ret['registerlist'] = registerObjs;

        var registerids = registerObjs.map((x)=>{ return x.id; });
        if (registerids.length) {
            var bitsObjs = await ChipBit.findAll({logging:false, raw:true, where:{'ChipRegisterId':registerids}});
            ret['bitslist'] = bitsObjs;
        }
    }
    return ret;
}