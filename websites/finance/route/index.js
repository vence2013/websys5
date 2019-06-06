/****************************************************************************** 
 * 文件名称 ： index.js
 * 功能说明 ： finance
 * 
 * 创建日期 ： 2019/6/6
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/6/6    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 
const Moment = require('moment');


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


router.post('/', async (ctx)=>{
    const FinanceCtrl = ctx.controls['finance/finance'];

    var req = ctx.request.body;
    
    var money = /^\d+(\.\d+)?$/.test(req.money) ? parseFloat(req.money) : 0;
    var date  = /^\d{4}(\-)\d{1,2}\1\d{1,2}$/.test(req.date) ? req.date : '';
    var desc  = req.desc;
    var type  = (['get','pay','payFixed','property'].indexOf(req.type)!=-1) ? req.type : '';
    console.log(type, date);
    if (!money || !desc || !type || ((type!='payFixed') && !date)) {
        ctx.body = {'errorCode': -1, 'message': '参数错误'};
    } else {
        var date2 = Moment(date, "YYYYMMDD").format('YYYY-MM-DD hh:mm:ss');
        var ret = await FinanceCtrl.create(ctx, money, date2, desc, type);
        switch (ret) {
            case -1: ctx.body = {'errorCode': -2, 'message': '该记录已经存在'}; break;
            case  0: ctx.body = {'errorCode':  0, 'message': 'SUCCESS'}
        }
    }
})

/* 文档搜索页面 */
router.get('/', async (ctx)=>{    
    await ctx.render('finance/view/index.html'); 
});


module.exports = router;