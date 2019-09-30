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


exports.create = async (ctx, username, password)=>{    
    const User = ctx.models['User'];
    const hash = crypto.createHash('sha256');
    
    hash.update(password);
    var cryptoPassword = hash.digest('hex');
    var [ userIns, created ] = await User.findOrCreate({logging: false,
        where: {'username': username}, defaults: {'password': cryptoPassword}
    });

    return created;
}

exports.edit = async (ctx, username, password)=>{    
    const User = ctx.models['User'];
    const hash = crypto.createHash('sha256');
    
    hash.update(password);
    var cryptoPassword = hash.digest('hex');
    var userIns = await User.findOne({logging:false, 
        where:{'username':username}
    });
    await userIns.update({'password': cryptoPassword}, {logging:false});
    return true;
}


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

exports.get = async (ctx)=>{
    const User = ctx.models['User'];

    return await User.findAll({logging: false, order: [['username', 'ASC']] });
}

exports.getByUsername = async (ctx, username)=>{
    const User = ctx.models['User'];

    return await User.findOne({logging: false, 
        where: {username: username}
    });
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


