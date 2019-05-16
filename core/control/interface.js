/****************************************************************************** 
 * 文件名称 ： interface.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/2/3
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/3    - 创建文件。
 *****************************************************************************/ 

/* 设置用户可访问的私有接口 */
exports.set = async (ctx, userid, interfacestr)=>{
    const User = ctx.models['User'];

    var userIns = await User.findOne({logging: false, where: {'id': userid}});
    await userIns.update({'interfaces': interfacestr}, {logging: false});
    return interfacestr;
}

/* 为用户添加可访问的接口
 * 将接口列表从字符串解析为数组， 新增接口后，重组为字符串
 */
exports.add = async (ctx, userid, interface)=>{
    const User = ctx.models['User'];
    var interfacelist = [];

    var userIns = await User.findOne({logging: false, where: {'id': userid}});
    var res = userIns.get({plain: true}).interfaces;
    if (res) {
        interfacelist = res.toString()
                        .replace(/[\s]+/, ' ')  // 删除多余的空格
                        .replace(/^\s+|\s+$/g,'') // 删除首尾的空格
                        .split(' ');
    }

    if (interfacelist.indexOf(interface)==-1) { interfacelist.push(interface); }
    var res2 = interfacelist.join(' ');
    await userIns.update({'interfaces': res2}, {logging: false});
    return res2;
}

/* 从用户可访问的接口中移除指定接口 */
exports.del = async (ctx, userid, interface)=>{
    const User = ctx.models['User'];
    var interfacelist = [];

    var userIns = await User.findOne({logging: false, where: {'id': userid}});
    var res = userIns.get({plain: true}).interfaces;
    if (res) {
        interfacelist = res.toString()
                        .replace(/[\s]+/, ' ')  // 删除多余的空格
                        .replace(/^\s+|\s+$/g,'') // 删除首尾的空格
                        .split(' ');
    }
    var idx = interfacelist.indexOf(interface);
    if (idx!=-1) { interfacelist.splice(idx, 1); }
    var res2 = interfacelist.join(' ');
    await userIns.update({'interfaces': res2}, {logging: false});
    return res2;
}