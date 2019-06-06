/****************************************************************************** 
 * 文件名称 ： bits.js
 * 功能说明 ： chip
 * 
 * 创建日期 ： 2019/5/29
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/29    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


router.post('/:registerid', async (ctx, next)=>{
    const BitsCtrl = ctx.controls['chip/bits'];

    var req = ctx.request.body;
    var req2= ctx.params;
    // 提取有效参数
    var registerid   = /^\d+$/.test(req2.registerid) ? parseInt(req2.registerid) : 0;
    var bitsid = /^\d+$/.test(req.id) ? parseInt(req.id) : 0;
    var name = req.name;
    var fullname = req.fullname;
    var rw = req.rw;
    var desc = req.desc;
    var bitlist = req.bitlist;
    var valuelist = req.valuelist;

    if (!registerid || !name || !rw || !bitlist || !valuelist) {
        ctx.body = {'errorCode': -1, 'message': '无效的参数！'};
    } else {
        ret = await BitsCtrl.edit(ctx, registerid, bitsid, name, fullname, rw, desc, bitlist, valuelist);
        switch (ret) {
            case -1: ctx.body = {'errorCode': -2, 'message': '无效的位组！'}; break;
            case -2: ctx.body = {'errorCode': -3, 'message': '无效的寄存器！'}; break;
            case -3: ctx.body = {'errorCode': -4, 'message': '该位组已经存在！'}; break;
            default: ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
        }
    }
});


router.delete('/:bitsid', async(ctx, next)=>{
    const BitsCtrl = ctx.controls['chip/bits'];
    
    var req2 = ctx.params;
    var bitsid = req2.bitsid;
    
    await BitsCtrl.delete(ctx, bitsid);
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
});


router.get('/register/:registerid', async(ctx, next)=>{
    const BitsCtrl = ctx.controls['chip/bits'];
    
    var req2 = ctx.params;
    var registerid = /^\d+$/.test(req2.registerid) ? parseInt(req2.registerid) : 0;

    if (registerid) {
        var ret = await BitsCtrl.list(ctx, registerid);
        ctx.body = {'errorCode': 0, 'message': ret};
    } else {
        ctx.body = {'errorCode': -1, 'message': '无效的模块参数！'};
    }
});

router.get('/:bitsid', async(ctx, next)=>{
    const BitsCtrl = ctx.controls['chip/bits'];
    
    var req2 = ctx.params;
    var bitsid = /^\d+$/.test(req2.bitsid) ? parseInt(req2.bitsid) : 0;

    if (bitsid) {
        var ret = await BitsCtrl.get(ctx, bitsid);
        ctx.body = {'errorCode': 0, 'message': ret};
    } else {
        ctx.body = {'errorCode': -1, 'message': '无效的模块参数！'};
    }
});


module.exports = router;