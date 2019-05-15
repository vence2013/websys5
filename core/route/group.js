/****************************************************************************** 
 * 文件名称 ： group.js
 * 功能说明 ： 
 * 
 * 注： 该文件的接口只能由root用户访问
 * 
 * 创建日期 ： 2019/5/15
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/15    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router(); 

/* 添加用户所属的组 */
router.post('/:userid', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req  = ctx.request.body;
    var req2 = ctx.params;
    // 提取有效参数
    var group  = req.group;
    var userid = parseInt(req2.userid);

    var ret = await UserCtrl.addGroup(ctx, userid, group);
    var grouplist = ret ? (await UserCtrl.getGroupByUser(ctx, userid)) : [];
    ctx.body = ret ? {'errorCode': 0, 'message': grouplist} :
                     {'errorCode': -1, 'message': '无效的用户'};
})

/* 将用户移除某个分组 */
router.delete('/:userid', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req  = ctx.query;
    var req2 = ctx.params;
    // 提取有效参数
    var group  = req.group;
    var userid = parseInt(req2.userid);

    await UserCtrl.delGroup(ctx, userid, group);
    var grouplist = await UserCtrl.getGroupByUser(ctx, userid);
    ctx.body = {'errorCode': 0, 'message': grouplist};
})

/* 获取用户所属的组列表 */
router.get('/:userid', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];

    var req2 = ctx.params;
    // 提取有效参数
    var userid = parseInt(req2.userid);

    var grouplist = await UserCtrl.getGroupByUser(ctx, userid);
    ctx.body = {'errorCode': 0, 'message': grouplist}
})

module.exports = router;