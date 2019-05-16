/****************************************************************************** 
 * 文件名称 ： group.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/2/3
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/3    - 创建文件。
 *****************************************************************************/ 


/* 将用户加入组 */
exports.join = async (ctx, userid, groupname)=>{
    const User = ctx.models['User'];
    const Group= ctx.models['Group'];

    // 获取当前用户实例
    var userIns = await User.findOne({logging: false, where: {'id': userid}});
    if (!userIns) return false;

    // 获取该名称的组实例
    await Group
    .findOne({logging: false, where: {'name': groupname}})
    .then(async (groupIns)=>{
        await userIns.addGroup(groupIns, {logging: false});
    });

    return true;
}

/* 将用户移出组 */
exports.leave = async (ctx, userid, groupname)=>{
    const User = ctx.models['User'];
    const Group= ctx.models['Group'];

    // 获取当前用户实例
    var userIns = await User.findOne({logging: false, where: {'id': userid}});
    if (!userIns) return false;

    // 获取该名称的组实例
    await Group
    .findOne({logging: false, where: {'name': groupname}})
    .then((groupIns)=>{
        userIns.removeGroup(groupIns, {logging: false});
    });
    return true;
}

/* 获取某个用户所属的组列表 */
exports.get = async (ctx, userid)=>{
    const User = ctx.models['User'];
    const Group= ctx.models['Group'];

    // 获取该用户属于的组
    var ret = await User.findAll({logging: false, raw: true, 
        attributes: [],
        where: {'id': userid},
        include: [{ model: Group }]
    });

    var grouplist = [];
    for (var i=0; i<ret.length; i++) {
        grouplist.push({'id': ret[i]['Groups.id'], 'name': ret[i]['Groups.name']});
    }

    return grouplist;
}