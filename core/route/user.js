/****************************************************************************** 
 * 文件名称 ： user.js
 * 功能说明 ： 
 * 
 * 注： 该文件的接口只能由root用户访问
 * 
 * 创建日期 ： 2019/04/03
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/03    - 创建文件。
 *****************************************************************************/ 

const fs     = require("fs") ;
const moment = require('moment');
const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


router.post('/login', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];
    var jsonResult = {'errorCode': 0, 'message': ''}

    // 将参数传递给对象
    var req = ctx.request.body;
    // 转化参数类型/格式， 过滤恶意输入
    var username = req.username;
    var password = req.password;
    
    // 调用登录接口
    var ret = await UserCtrl.login(ctx, username, password);
    // 登录成功，设置SESSION数据。
    if (ret) {
        ctx.session.user = {'id':ret.id, 'username': ret.username}; 
        jsonResult.message = ctx.session.user;
    } else {
        jsonResult.errorCode = -1;
        jsonResult.message   = '用户名或密码错误！';
    }

    ctx.body = jsonResult;
})


/* 新增用户 */
router.post('/', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];
    var user = ctx.session.user;

    // 将参数传递给对象
    var req = ctx.request.body;
    // 转化参数类型/格式， 过滤恶意输入
    var username = req.username;
    var password = req.password;
    
    /* 1. 如果未初始化（无install.log），
     *    a. 且请求编辑的用户为root， 则：清除用户，创建root用户，并完成初始化（创建install.log） 
     * 2. 否则，如果登陆用户为root，
     *    a. 请求编辑的用户不存在，则创建用户
     *    b. 否则， 则修改用户
     */    
    if (!fs.existsSync("./install.log")) {
        if (username == 'root') {
            var now      = moment().format("YYYY-MM-DD HH:mm:ss");

            await ctx.sequelize.query("DELETE FROM Users;", {logging: false});
            await UserCtrl.create(ctx, username, password);

            fs.writeFileSync(__dirname+'/../../install.log', 'install at:'+now);
            ctx.body = {'errorCode':  0, 'message': 'SUCCESS'};
        }
    } else if (user.username == 'root') {
        var ret = false;

        /* 管理员操作：
         * 1. 用户已存在，则修改密码。 
         * 2. 否则添加用户 
         */
        var user2 = await UserCtrl.getByUsername(ctx, username);
        if (user2) {
            ret = await UserCtrl.edit(ctx, username, password);
        } else {
            ret = await UserCtrl.create(ctx, username, password);
        }

        if (ret) {
            ctx.body = {'errorCode':  0, 'message': 'SUCCESS'};
        } else {
            ctx.body = {'errorCode': -1, 'message': "用户已存在"};
        }
    } else {
        ctx.body = {'errorCode': -1, 'message': "无权访问该接口"}
    }
})

/* 修改登录用户自己的密码
 * 参数： {username, password}
 */
router.put('/', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req  = ctx.request.body;
    // 提取有效参数
    var oldPassword = req.oldPassword;
    var password = req.password;

    var user = ctx.session.user;
    var ret = await UserCtrl.changePassword(ctx, user.id, oldPassword, password);
    ctx.body = ret ? {'errorCode': 0, 'message': 'SUCCESS'} :
                     {'errorCode': -1, 'message': '密码错误，修改失败'}
})

/* 删除用户
 * 参数 {id}
 */
router.delete('/:id', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req2 = ctx.params;
    var id = parseInt(req2.id);
    
    await UserCtrl.delete(ctx, id);
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
})

// 返回用户列表，过滤密码字段
router.get('/', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];
    var userlist = [];

    var userInss = await UserCtrl.get(ctx);
    if (userInss) {
        userInss.forEach(user => {
            var obj = user.get({plain: true});
            userlist.push({'id':obj.id, 'username':obj.username, 'createdAt': obj.createdAt});
        });
    }
    ctx.body = {'errorCode': 0, 'message': userlist}
})

module.exports = router;