/****************************************************************************** 
 * 文件名称 ： document.js
 * 功能说明 ： chip
 * 
 * 创建日期 ： 2019/5/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/27    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();

router.get('/edit/:funcid', async (ctx)=>{    
    var req2 = ctx.params;
    var funcid= parseInt(req2.funcid);

    await ctx.render('websites/chip/view/function.html', {'id':funcid}); 
});

router.post('/:funcid', async (ctx)=>{
    const FunctionCtrl = ctx.controls['chip/function'];

    var req = ctx.request.body;
    var req2= ctx.params;
    // 提取有效参数
    var funcid  = /^\d$/.test(req2.funcid) ? parseInt(req2.funcid) : 0;
    var content = req.content;
    var moduleid = req.moduleid; 
    var bitsids  = req.bitsids;

    var ret = await FunctionCtrl.edit(ctx, funcid, content, moduleid, bitsids);
    switch (ret) {
        case -2: ctx.body = {'errorCode': -1, 'message': '添加失败'}; break;
        case -1: ctx.body = {'errorCode': -1, 'message': '无效文档'}; break;
        case  0: ctx.body = {'errorCode':  0, 'message': 'SUCCESS'}
    }
});

router.delete('/:funcid', async (ctx)=>{
    const FunctionCtrl = ctx.controls['chip/function'];

    var req2 = ctx.params;
    var funcid= /^\d$/.test(req2.funcid) ? parseInt(req2.funcid) : 0;

    await FunctionCtrl.delete(ctx, funcid);
    ctx.body = {'errorCode':0, 'message':'SUCCESS'}
})

/* 获取功能的相关信息：功能描述，位组列表， 所属模块， 所属芯片 */
router.get('/detail/:funcid', async (ctx)=>{    
    const FunctionCtrl = ctx.controls['chip/function'];

    var req2 = ctx.params;
    var funcid= /^\d$/.test(req2.funcid) ? parseInt(req2.funcid) : 0;

    var ret = await FunctionCtrl.detail(ctx, funcid);
    ctx.body = {'errorCode':0, 'message':ret}
});

router.get('/:moduleid', async (ctx)=>{
    const FunctionCtrl = ctx.controls['chip/function'];
    
    var req2 = ctx.params;
    // 提取有效参数
    var moduleid = /^\d$/.test(req2.moduleid) ? parseInt(req2.moduleid) : 0;

    var res = await FunctionCtrl.get(ctx, moduleid);
    ctx.body = {'errorCode': 0, 'message': res};
})

module.exports = router;