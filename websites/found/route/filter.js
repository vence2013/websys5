/****************************************************************************** 
 * 文件名称 ： filter.js
 * 功能说明 ： 基金筛选
 * 
 * 创建日期 ： 2019/05/13
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/05/13 - 创建文件。
 *****************************************************************************/ 
const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


/* 更新指定名称的过滤器 */
router.post('/', async (ctx, next)=>{
    const FilterCtrl = ctx.controls['found/filter'];

    // 获取参数
    var req = ctx.request.body;
    var name   = req.name;
    var filter = req.filter;

    await FilterCtrl.update(ctx, name, filter);
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
})

router.delete('/:id', async (ctx, next)=>{
    const FilterCtrl = ctx.controls['found/filter'];

    var req2 = ctx.params;
    var id = req2.id;

    await FilterCtrl.delete(ctx, id);

    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
})

/* 获取已存储的过滤器列表 */
router.get('/', async (ctx, next)=>{
    const FilterCtrl = ctx.controls['found/filter'];

    var fileters = await FilterCtrl.get(ctx);
    ctx.body = {'errorCode': 0, 'message': fileters};
})

/* 获取已存储的某个过滤器 */
router.get('/detail/:id', async (ctx, next)=>{
    const FilterCtrl = ctx.controls['found/filter'];

    var req2 = ctx.params;
    var id = req2.id;

    var fileter = await FilterCtrl.getById(ctx, id);
    ctx.body = {'errorCode': 0, 'message': fileter};
})

/* 应用过滤器 
 * 返回符合条件的公司列表(代码，名称)和基金列表(代码，名称)
 */
router.get('/apply', async (ctx)=>{
    const FilterCtrl = ctx.controls['found/filter'];

    // 获取参数
    var req2 = ctx.query;
    var query = {};
    if (/^\d{4}$/.test(req2.companyCreate)) query['companyCreate'] = req2.companyCreate;
    if (/^\d{4}$/.test(req2.foundCreate)) query['foundCreate'] = req2.foundCreate;
    var fields1 = ['companyManager', 'valueMinGT', 'valueMinLT', 'valueMaxGT', 'valueMaxLT'];
    for (var i=0; i<fields1.length; i++) {
        var key = fields1[i];
        if (/^\d+$/.test(req2[key])) query[key] = parseInt(req2[key]);
    }
    var fields2 = ['companyMoney', 'foundMoney', 'foundShare', 'statisticWeek', 'statisticMonth', 'statisticQuarter', 'statisitcHalfyear', 
        'statistic1year', 'statistic2year', 'statistic3year', 'statisticThisyear', 'statisticCreate', 'valueMin', 'valueMax'];
    for (var i=0; i<fields2.length; i++) {
        var key = fields2[i];
        if (/^(\-|\+)?\d+(\.\d+)?$/.test(req2[key])) query[key] = parseFloat(req2[key]);
    }
    
    var res = await FilterCtrl.apply(ctx, query);
    ctx.body = {'errorCode': 0, 'message': res};
})

module.exports = router;