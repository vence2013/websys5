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


/* 文档搜索页面 */
router.get('/', async (ctx)=>{    
    await ctx.render('chip/view/index.html'); 
});

module.exports = router;