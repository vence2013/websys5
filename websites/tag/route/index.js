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
    var tagname = req.tagname;
    var ret = await TagCtrl.create(ctx, tagname);
    ctx.body = ret ? {'errorCode': 0, 'message': 'SUCCESS'}
                   : {'errorCode': -1, 'message': '该标签已经存在！'};
});


router.delete('/:id', async (ctx)=>{
    const TagCtrl = ctx.controls['tag/tag'];

    var req2 = ctx.params;
    // 转换为有效的参数 
    var id = req2.id;
    await TagCtrl.delete(ctx, id);
    ctx.body = {'errorCode':  0, 'message': 'SUCCESS'}
})


/* 标签页面：首页 */
router.get('/', async (ctx)=>{
    await ctx.render('tag/view/index.html'); 
});

/* 搜索标签列表
 * 参数： {str, [order], page, pageSize }
 */
router.get('/search', async (ctx)=>{
    const TagCtrl = ctx.controls['tag/tag'];   

    var req2 = ctx.query;
    // 提取有效的参数， 需要的参数： 搜索字符串， 搜索的最小隐私等级， 当前页码， 每页记录数量， 排序方法
    var str = req2.str.replace(/^\s*(.*?)\s*$/, "$1"); // 搜索字符串
    var order = (req2.order && (req2.order.length==2)) ? req2.order : ['createdAt', 'DESC'];
    var page = parseInt(req2.page) ? parseInt(req2.page) : 1;
    var pageSize = parseInt(req2.pageSize) ? parseInt(req2.pageSize) : 100;
    
    var taglist = await TagCtrl.search(ctx, str, page, pageSize, order);
    ctx.body = {'errorCode': 0, 'message': taglist};
})

module.exports = router;