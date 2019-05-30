/****************************************************************************** 
 * 文件名称 ： register.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/28
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/28    - 创建文件。
 *****************************************************************************/ 


exports.edit = async (ctx, moduleid, registerid, name, fullname, address, desc)=>{
    const ChipModule   = ctx.models['ChipModule'];
    const ChipRegister = ctx.models['ChipRegister'];
    
    if (registerid) {
        var registerIns = await ChipRegister.findOne({logging:false, where:{'id':registerid}});
        if (!registerIns) return -1;

        await registerIns.update({'name':name, 'fullname':fullname, 'address':address, 'desc':desc}, {logging:false});
        return 0;
    } else {
        var moduleIns = await ChipModule.findOne({logging:false, where:{'id':moduleid}});
        if (!moduleIns) return -2;

        var [registerIns, created] = await ChipRegister.findOrCreate({logging:false, 
            where:{'name':name, 'ChipModuleId':moduleid}, 
            defaults:{'address':address, 'fullname':fullname, 'desc':desc}
        });
        return created ? 0 : -3;
    }
}


exports.delete = async (ctx, registerid)=>{
    const ChipRegister = ctx.models['ChipRegister'];

    await ChipRegister.destroy({logging: false, where: {'id': registerid}});
}


exports.get = async (ctx, moduleid)=>{
    const ChipRegister = ctx.models['ChipRegister'];

    var ret = await ChipRegister.findAll({logging: false, raw: true, where: {'ChipModuleId': moduleid}});
    var registerlist = ret.map((x)=>{
        x['desc'] = x['desc'].toString();
        return x;
    });
    return registerlist;
}

exports.map = async (ctx, moduleid)=>{
    const ChipRegister = ctx.models['ChipRegister'];
    const ChipBit = ctx.models['ChipBit'];
    var registerlist = [];
    
    var ret = await ChipRegister.findAll({logging: false, raw: true, where: {'ChipModuleId': moduleid}});
    console.log('b', ret);
    for (var i=0; i<ret.length; i++) {
        var bitid = ret[i]['id'];
        var ret2 = await ChipBit.findAll({logging: false, raw: true, where: {'ChipRegisterId': bitid}});
        var bitlist = ret2.map((y)=>{
            y['desc'] = y['desc'].toString();
            return y;
        });
        ret[i]['bitlist'] = bitlist;  
        ret[i]['desc']    = ret[i]['desc'].toString();
    }

    return ret;
}