/****************************************************************************** 
 * 文件名称 ： interface.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/15
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/25    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router');


/******************************************************************************
 * 全局变量
 *****************************************************************************/

var router = new Router();

/* 设置用户可访问的私有接口 */
router.post('/:userid', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req  = ctx.request.body;
    var req2 = ctx.params; 
    // 提取有效参数
    var userid = req2.userid;
    var interfacestr = req.interfacestr; 

    var ret = await UserCtrl.setInterface(ctx, userid, interfacestr);
    ctx.body = {'errorCode': 0, 'message': ret};
})


/* 增加用户的可访问私有接口 */
router.post('/:userid', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req  = ctx.request.body;
    var req2 = ctx.params; 
    // 提取有效参数
    var userid    = req2.userid;
    var interface = req.interface; 

    var ret = await UserCtrl.addInterface(ctx, userid, interface);
    ctx.body = {'errorCode': 0, 'message': ret};
})


/* 删除用户的可访问私有接口 */
router.delete('/:userid', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req  = ctx.query;
    var req2 = ctx.params; 
    // 提取有效参数
    var userid    = req2.userid;
    var interface = req.interface; 

    var ret = await UserCtrl.delInterface(ctx, userid, interface);
    ctx.body = {'errorCode': 0, 'message': ret};
})

/* 获取系统的私有接口列表 */
router.get('/private', async (ctx)=>{
    ctx.body = {'errorCode': 0, 'message': sysdata.interfaces.private};
});


module.exports = router;