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

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


/* 新增用户 */
router.post('/', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    // 将参数传递给对象
    var req = ctx.request.body;
    // 转化参数类型/格式， 过滤恶意输入
    var username = req.username;

    // 调用用户创建接口
    var ret = await UserCtrl.create(ctx, username);
    ctx.body = ret ? {'errorCode': 0, 'message': 'SUCCESS'} : 
                     {'errorCode': -1, 'message': "用户已存在"};
})

/* 修改用户密码
 * 参数： {username, password}
 */
router.put('/', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req  = ctx.request.body;
    // 提取有效参数
    var username = req.username;
    var password = req.password;

    var ret = await UserCtrl.update(ctx, username, password);
    ctx.body = ret ? {'errorCode': 0, 'message': 'SUCCESS'} :
                     {'errorCode': -1, 'message': '用户不存在'}
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

/* 获取用户列表
 */
router.get('/', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];
    var userlist = [];

    var userInss = await UserCtrl.get(ctx);
    if (userInss) {
        userInss.forEach(user => {
            var obj = user.get({plain: true});
            var interfaces = obj.interfaces ? obj.interfaces.toString() : '';
            userlist.push({'id':obj.id, 'username':obj.username, 'createdAt': obj.createdAt, 'interfaces':interfaces});
        });
    }
    ctx.body = {'errorCode': 0, 'message': userlist}
})

module.exports = router;