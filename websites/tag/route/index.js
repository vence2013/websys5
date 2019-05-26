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

// 获取标签关联的文件和文档
router.get('/relate/:tagid', async (ctx)=>{
    const FileCtrl = ctx.controls['file/file'];
    const DocumentCtrl = ctx.controls['document/document'];    

    var req2  = ctx.params;
    var tagid = req2.tagid;

    // 允许未登录用户访问， userid可以为0
    var user = ctx.session.user;
    var userid = (user && user.id) ? user.id : 0;
    var doclist = await DocumentCtrl.searchByTag(ctx, userid, tagid);
    var filelist= await FileCtrl.searchByTag(ctx, userid, tagid);
    ctx.body = {'errorCode': 0, 'message': {'doclist':doclist, 'filelist':filelist}};
})

module.exports = router;