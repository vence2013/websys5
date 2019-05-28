/****************************************************************************** 
 * 文件名称 ： register.js
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


router.post('/:moduleid', async (ctx, next)=>{
    const RegisterCtrl = ctx.controls['chip/register'];

    var req = ctx.request.body;
    var req2= ctx.params;
    // 提取有效参数
    var moduleid   = /^\d+$/.test(req2.moduleid) ? parseInt(req2.moduleid) : 0;
    var registerid = /^\d+$/.test(req.id) ? parseInt(req.id) : 0;
    var name = req.name;
    var fullname = req.fullname;
    var address = /^0[xX]{1}[0-9a-fA-F]+$/.test(req.address) ? req.address : '';
    var desc = req.desc;

    if (!moduleid || !name || !address) {
        ctx.body = {'errorCode': -1, 'message': '无效的参数！'};
    } else {
        ret = await RegisterCtrl.edit(ctx, moduleid, registerid, name, fullname, address, desc);
        switch (ret) {
            case -1: ctx.body = {'errorCode': -2, 'message': '无效的寄存器！'}; break;
            case -2: ctx.body = {'errorCode': -3, 'message': '无效的模块！'}; break;
            case -3: ctx.body = {'errorCode': -4, 'message': '该寄存器已经存在！'}; break;
            default: ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
        }
    }
});


router.delete('/:registerid', async(ctx, next)=>{
    const RegisterCtrl = ctx.controls['chip/register'];
    
    var req2 = ctx.params;
    var registerid = req2.registerid;
    
    await RegisterCtrl.delete(ctx, registerid);
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
});


router.get('/:moduleid', async(ctx, next)=>{
    const RegisterCtrl = ctx.controls['chip/register'];
    
    var req2 = ctx.params;
    var moduleid = /^\d+$/.test(req2.moduleid) ? parseInt(req2.moduleid) : 0;

    if (moduleid) {
        var ret = await RegisterCtrl.get(ctx, moduleid);
        ctx.body = {'errorCode': 0, 'message': ret};
    } else {
        ctx.body = {'errorCode': -1, 'message': '无效的模块参数！'};
    }
});

module.exports = router;