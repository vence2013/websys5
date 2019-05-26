/****************************************************************************** 
 * 文件名称 ： index.js
 * 功能说明 ： tag
 * 
 * 创建日期 ： 2019/04/03
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/03 - 创建文件。
 *****************************************************************************/ 
const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


router.post('/', async (ctx)=>{
    const TagCtrl = ctx.controls['tag/tag'];

    var req = ctx.request.body;
    // 转换为有效的参数
    var name = req.name;
    var ret = await TagCtrl.create(ctx, name);
    ctx.body = ret ? {'errorCode': 0, 'message': 'SUCCESS'}
                   : {'errorCode': -1, 'message': '该标签已经存在！'};
});


router.delete('/:tagid', async (ctx)=>{
    const TagCtrl = ctx.controls['tag/tag'];

    var req2 = ctx.params;
    // 转换为有效的参数 
    var tagid = req2.tagid;

    await TagCtrl.delete(ctx, tagid);
    ctx.body = {'errorCode':  0, 'message': 'SUCCESS'}
})


/* 标签页面：首页 */
router.get('/', async (ctx)=>{
    await ctx.render('tag/view/index.html'); 
});

/* 搜索标签列表
 * 参数： {str, page, pageSize }
 * str - 单个字符串
 */
router.get('/search', async (ctx)=>{
    const TagCtrl = ctx.controls['tag/tag'];   

    var req = ctx.query;
    // 提取有效的参数
    var str = req.str.replace(/^\s*(.*?)\s*$/, "$1"); // 去除首尾空格
    var page = /^\d+$/.test(req.page) ? parseInt(req.page) : 1;  // 当前的页面
    var pageSize = /^\d+$/.test(req.pageSize) ? parseInt(req.pageSize) : 100; // 每页的记录条数

    var ret = await TagCtrl.search(ctx, str, page, pageSize);
    ctx.body = {'errorCode': 0, 'message': ret};
})

module.exports = router;