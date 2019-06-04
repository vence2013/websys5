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


router.post('/:docid', async (ctx)=>{
    const DocumentCtrl2 = ctx.controls['chip/document'];

    var req = ctx.request.body;
    var req2= ctx.params;
    // 提取有效参数
    var docid= /^\d$/.test(req2.docid) ? parseInt(req2.docid) : 0;
    var content = req.content;
    var chipid  = /^\d$/.test(req.chipid) ? parseInt(req.chipid) : null;
    var moduleid= /^\d$/.test(req.moduleid) ? parseInt(req.moduleid) : null;
    var bitsids = req.bitsids;

    var ret = await DocumentCtrl2.edit(ctx, docid, content, chipid, moduleid, bitsids);
    switch (ret) {
    case -1: ctx.body = {'errorCode': -1, 'message': '无效文档或无权修改'}; break;
    case  0: ctx.body = {'errorCode':  0, 'message': 'SUCCESS'}
    }
});

router.delete('/:docid', async (ctx)=>{
    const DocumentCtrl2 = ctx.controls['chip/document'];

    var req2 = ctx.params;
    var docid= /^\d$/.test(req2.docid) ? parseInt(req2.docid) : 0;

    var ret = await DocumentCtrl2.delete(ctx, docid);
    ctx.body = {'errorCode':0, 'message':'SUCCESS'}
})

/* 文档编辑页面 */
router.get('/edit/:docid', async (ctx)=>{    
    var req2 = ctx.params;
    var docid= parseInt(req2.docid);

    await ctx.render('chip/view/document.html', {'id':docid}); 
});

router.get('/detail/:docid', async (ctx)=>{    
    const DocumentCtrl2 = ctx.controls['chip/document'];

    var req2 = ctx.params;
    var docid= /^\d$/.test(req2.docid) ? parseInt(req2.docid) : 0;

    var ret = await DocumentCtrl2.getById(ctx, docid);
    ctx.body = {'errorCode':0, 'message':ret}
});

module.exports = router;