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


/* 创建用户 */
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

/* 修改密码 */
exports.changePassword = async (ctx, userid, oldPassword, password)=>{
    const User = ctx.models['User'];
    const hash1 = crypto.createHash('sha256');
    const hash2 = crypto.createHash('sha256');

    hash1.update(oldPassword);
    var oldhex = hash1.digest('hex');
    var userIns = await User.findOne({logging:false, where: {'id': userid}});
    var userObj = userIns.get({plain:true});
    if (userObj.password!==oldhex) return false;

    // 生成新密码
    hash2.update(password);
    var newhex = hash2.digest('hex');
    // 更新数据库    
    await userIns.update({'password': newhex}, {logging:false});
    return true;
}

/* 删除指定的用户 */
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


