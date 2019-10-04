/****************************************************************************** 
 * 文件名称 ： index.js
 * 功能说明 ： 
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


/* 基金页面：首页 */
router.get('/', async (ctx)=>{
    await ctx.render('websites/found/view/index.html'); 
});

/* 获取基金公司信息 */
router.get('/company/:code', async (ctx, next)=>{
    const FoundCtrl = ctx.controls['found/found'];

    var req2 = ctx.params;
    var code = req2.code;

    var companyObj = await FoundCtrl.getCompany(ctx, code);
    ctx.body = {'errorCode': 0, 'message': companyObj};
})

/* 获取基金信息 */
router.get('/found/:code', async (ctx, next)=>{
    const FoundCtrl = ctx.controls['found/found'];

    var req2 = ctx.params;
    var code = req2.code;

    var foundObj = await FoundCtrl.getFound(ctx, code);
    if (foundObj) {
        var statisticObj = await FoundCtrl.getStatistics(ctx, code);
        for (x in statisticObj) {
            if (['code', 'createdAt', 'updatedAt', 'id'].indexOf(x)!=-1) continue;
            foundObj[x] = statisticObj[x];
        }
    }   

    ctx.body = {'errorCode': 0, 'message': foundObj};
})

module.exports = router;