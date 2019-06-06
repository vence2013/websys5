/****************************************************************************** 
 * 文件名称 ： index.js
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


router.post('/:chipid', async (ctx, next)=>{
    const ChipCtrl = ctx.controls['chip/chip'];

    var req = ctx.request.body;
    var req2= ctx.params;
    // 提取有效参数
    var name  = req.name;
    var width = /^\d+$/.test(req.width) ? parseInt(req.width) : 0;
    var chipid= /^\d+$/.test(req2.chipid) ? parseInt(req2.chipid) : 0;

    var ret = await ChipCtrl.edit(ctx, chipid, name, width);
    switch (ret) {
        case -1: ctx.body = {'errorCode': -1, 'message': '该芯片已经存在'}; break;
        default: ctx.body = {'errorCode':  0, 'message': 'SUCCESS'}; 
    }
});


router.delete('/:chipid', async(ctx, next)=>{
    const ChipCtrl = ctx.controls['chip/chip'];
    
    var req2 = ctx.params;
    var chipid = /^\d+$/.test(req2.chipid) ? parseInt(req2.chipid) : 0;
    
    await ChipCtrl.delete(ctx, chipid);
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
});


/* 文档搜索页面 */
router.get('/', async (ctx)=>{    
    await ctx.render('chip/view/index.html'); 
});


router.get('/chip', async(ctx, next)=>{
    const ChipCtrl = ctx.controls['chip/chip'];
    
    var ret = await ChipCtrl.get(ctx);
    ctx.body = {'errorCode': 0, 'message': ret};
});

// 获取芯片的所有寄存器和位组
router.get('/all/:chipid', async(ctx)=>{
    const ChipCtrl = ctx.controls['chip/chip'];
    
    var req2 = ctx.params;
    var chipid = /^\d+$/.test(req2.chipid) ? parseInt(req2.chipid) : 0;
    
    var ret = await ChipCtrl.all(ctx, chipid);
    ctx.body = {'errorCode':0, 'message':ret};
})

module.exports = router;