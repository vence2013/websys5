/****************************************************************************** 
 * 文件名称 ： user.js
 * 功能说明 ： 
 *      用户的控制文件， 处理数据。
 * 
 * 创建日期 ： 2019/2/3
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/3    - 创建文件。
 *****************************************************************************/ 

const crypto = require('crypto');


/******************************************************************************
 * 全局变量
 *****************************************************************************/

var newPassword = '123456'; // 新创建用户的密码


/* 
 * Function     : create
 * Description  : 
 *      创建用户。
 * 
 * Parameter    : 
 * Return       : 已创建的用户实例。
 */

exports.create = async (ctx, username)=>{    
    const User = ctx.models['User'];
    const Group= ctx.models['Group'];
    const hash = crypto.createHash('sha256');

    hash.update(newPassword);
    var cryptoPassword = hash.digest('hex');
    var [ userIns, created ] = await User.findOrCreate({logging: false,
        where: {'username': username}, defaults: {'password': cryptoPassword, 'interfaces': ''}
    });
    // 同时添加同名组
    if (created) { await Group.findOrCreate({logging: false, where: {'name': username} }); }

    return created;
}


/* 
 * Function     : update
 * Description  : 
 *      更新用户数据，包括用户名和密码。
 * 
 * Parameter    : 
 * Return       : 修改后的用户实例。
 */

exports.update = async (ctx, username, password)=>{
    const User = ctx.models['User'];
    const hash = crypto.createHash('sha256');

    // 生成新密码
    hash.update(password);
    var cryptoPassword = hash.digest('hex');
    // 更新数据库
    var userIns = await User.findOne({logging: false, where: {'username': username}});
    if (userIns) await res.update({'password': cryptoPassword});

    return userIns ? true : false;
}


/* 
 * Function     : delete
 * Description  : 
 *      删除指定的用户。
 * 
 * Parameter    : 
 * Return       : none.
 */

exports.delete = async (ctx, id)=>{
    const User = ctx.models['User'];
    const Group= ctx.models['Group'];

    // 查找该用户的名称， 然后删除同名的组
    var ret = await User.findOne({logging: false, raw: true, where: {'id': id}});
    if (ret) { await Group.destroy({ logging: false, where: {'name': ret.username} }); }
    // 最后删除用户
    await User.destroy({logging: false, where: {'id': id} });
}


/* 
 * Function     : get
 * Description  : 获取用户实例。 
 * 说明： 如果指定了账户，则查询单个用户，否则查询所有用户。
 * Parameter    : 
 *   name  - 账户
 * Return       : 用户实例或实例数组。
 */

exports.get = async (ctx, username)=>{
    const User = ctx.models['User'];

    if (username) {
        return await User.findOne({logging: false, 
            where: {username: username}
        });
    } else {
        return await User.findAll({logging: false, order: [['username', 'ASC']] });
    }
}


/* 
 * Function     : getGroupByUser
 * Description  : 获取某个用户所属的组列表 
 * Parameter    : 
 * Return       : 组实例
 */

exports.getGroupByUser = async (ctx, userid)=>{
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


/* 
 * Function     : addGroup
 * Description  : 添加用户到某个组
 * Parameter    : 
 * Return       : 该用户的关联组对象数组
 */

exports.addGroup = async (ctx, userid, groupname)=>{
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


/* 
 * Function     : delGroup
 * Description  : 将用户移除组
 * Parameter    : 
 * Return       : 是否成功(true, false)
 */

exports.delGroup = async (ctx, userid, groupname)=>{
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


/* 设置用户可访问的私有接口 */
exports.setInterface = async (ctx, userid, interfacestr)=>{
    const User = ctx.models['User'];
    var interfacelist = [];

    var userIns = await User.findOne({logging: false, where: {'id': userid}});
    await userIns.update({'interfaces': interfacestr}, {logging: false});
    return interfacestr;
}


/* 
 * Function     : addInterface
 * Description  : 添加接口
 * 将接口列表从字符串解析为数组， 新增接口后，重组为字符串
 * Parameter    : 
 * Return       : 
 */

exports.addInterface = async (ctx, userid, interface)=>{
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


/* 
 * Function     : delInterface
 * Description  : 删除接口
 * 将接口列表从字符串解析为数组， 新增接口后，重组为字符串
 * Parameter    : 
 * Return       : 
 */

exports.delInterface = async (ctx, userid, interface)=>{
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


/* 
 * Function     : login
 * Description  : 用户登录接口。
 *      通过user查询用户密码，
 *      1. 如果有账户信息，密码正确则登录成功
 *      2. 如果无账户信息， 如果帐号是root，则密码为系统默认密码，则登录成功。
 * 
 * Parameter    : 
 *      username- 账户
 *      password- 密码
 * Return       : 
 *      是否成功(true/false)
 */

exports.login = async (ctx, username, password)=>{    
    const User = ctx.models['User'];
    const hash = crypto.createHash('sha256');

    // 获取密码的sha256结果    
    hash.update(password);
    var cryptoPassword = hash.digest('hex');
    // 获取当前用户的数据库记录
    var res =  await User.findOne({logging: false, raw: true, 
        where: {'username': username}
    });

    return (res && (cryptoPassword == res.password)) ? res : null;
}


