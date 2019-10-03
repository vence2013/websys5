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











/* 文档显示页面 */
router.get('/display/:docid', async (ctx)=>{
    var req2 = ctx.params;
    var docid= parseInt(req2.docid);

    await ctx.render('chip/view/display.html', {'id':docid}); 
});

router.get('/search', async (ctx)=>{
    const DocumentCtrl2 = ctx.controls['chip/document'];
    
    var req2  = ctx.query;
    // 提取有效参数
    var ChipId   = /^\d$/.test(req2.ChipId) ? parseInt(req2.ChipId) : 0;
    var ModuleId = /^\d$/.test(req2.ModuleId) ? parseInt(req2.ModuleId) : 0;
    var content  = req2.content ? req2.content.replace(/[\s]+/, ' ').replace(/(^\s*)|(\s*$)/g, "").split(' ') : [];    
    var page     = parseInt(req2.page);
    var pageSize = parseInt(req2.pageSize);
    // 日期格式
    var createget='', createlet='';
    var dateExp = new RegExp(/^\d{4}(-)\d{1,2}\1\d{1,2}$/);
    if (req2.createget && dateExp.test(req2.createget)) { createget = req2.createget; }
    if (req2.createlet && dateExp.test(req2.createlet)) { createlet = req2.createlet; }
    // 排序
    var order;
    switch (req2.order) {
        case '2': order = ['createdAt', 'ASC']; break;
        default:  order = ['createdAt', 'DESC'];
    }

    var res = await DocumentCtrl2.search(ctx, ChipId, ModuleId, content, createget, createlet, order, page, pageSize);
    ctx.body = {'errorCode': 0, 'message': res};
})

module.exports = router;