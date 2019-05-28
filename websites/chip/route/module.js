/****************************************************************************** 
 * 文件名称 ： module.js
 * 功能说明 ： chip
 * 
 * 创建日期 ： 2019/5/28
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/28    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


router.post('/:chipid', async (ctx, next)=>{
    const ModuleCtrl = ctx.controls['chip/module'];

    var req  = ctx.request.body;
    var req2 = ctx.params;
    // 提取有效参数
    var chipid = /^\d+$/.test(req2.chipid) ? parseInt(req2.chipid) : 0;
    var moduleid = /^\d+$/.test(req.id) ? parseInt(req.id) : 0;
    var name = req.name;
    var fullname = req.fullname;

    if (!chipid || !name) {
        ctx.body = {'errorCode': -1, 'message': '无效的参数'};
    } else {
        var ret = await ModuleCtrl.edit(ctx, chipid, moduleid, name, fullname);
        switch (ret) {
            case -1: ctx.body = {'errorCode': -2, 'message': '无效的模块！'}; break;
            case -2: ctx.body = {'errorCode': -3, 'message': '无效的芯片！'}; break;
            case -3: ctx.body = {'errorCode': -4, 'message': '该模块已经存在！'}; break;
            default: ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
        }
    }
});


router.delete('/:moduleid', async(ctx, next)=>{
    const ModuleCtrl = ctx.controls['chip/module'];
    
    var req2 = ctx.params;
    var moduleid = /^\d+$/.test(req2.moduleid) ? parseInt(req2.moduleid) : 0;
    
    await ModuleCtrl.delete(ctx, moduleid);
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
});


router.get('/:chipid', async(ctx, next)=>{
    const ModuleCtrl = ctx.controls['chip/module'];
    
    var req2 = ctx.params;
    var chipid = /^\d+$/.test(req2.chipid) ? parseInt(req2.chipid) : 0;

    if (chipid) {
        var ret = await ModuleCtrl.get(ctx, chipid);
        ctx.body = {'errorCode': 0, 'message': ret};
    } else {
        ctx.body = {'errorCode': -1, 'message': '无效的芯片参数！'};
    }
});


module.exports = router;