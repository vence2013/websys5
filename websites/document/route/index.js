/****************************************************************************** 
 * 文件名称 ： index.js
 * 功能说明 ： document
 * 
 * 创建日期 ： 2019/5/12
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/12    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


router.post('/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];

    var req = ctx.request.body;
    var req2= ctx.params;
    
    var content = req.content;
    var private = req.private;
    var taglist = req.taglist;
    var categoryids = req.categoryids;
    var docid= parseInt(req2.docid);

    var user = ctx.session.user;
    var ret = await DocumentCtrl.edit(ctx, user.id, docid, content, private, taglist, categoryids);
    switch (ret) {
    case -1: ctx.body = {'errorCode': -1, 'message': '无效文档或无权修改'}; break;
    case  0: ctx.body = {'errorCode':  0, 'message': 'SUCCESS'}
    }
});

/* 删除文档， 只有登录用户可以执行 */
router.delete('/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];

    var req2 = ctx.params;
    var docid = parseInt(req2.docid);

    var user = ctx.session.user;
    await DocumentCtrl.delete(ctx, user.id, docid);

    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
});


/* 文档搜索页面 */
router.get('/', async (ctx)=>{
    await ctx.render('document/view/index.html'); 
});

/* 文档编辑页面 */
router.get('/edit/:docid', async (ctx)=>{
    var req2 = ctx.params;
    var docid= parseInt(req2.docid);

    await ctx.render('document/view/document.html', {'id':docid}); 
});

router.get('/display/:docid', async (ctx)=>{
    var req2 = ctx.params;
    var docid= parseInt(req2.docid);

    await ctx.render('document/view/display.html', {'id':docid}); 
});

/* 获取文档的详细信息：文档信息， 关联标签列表， 关联目录ID列表 
 * 该接口用于查看文件的详细信息， 不能进行修改，所以没有权限限制（查看权限的限制在列表和详细页面检查）
 */
router.get('/detail/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];

    var req2= ctx.params;
    var docid= parseInt(req2.docid);

    // 允许未登录用户访问， userid可以为0
    var user = ctx.session.user;
    var userid = (user && user.id) ? user.id : 0;
    var ret = await DocumentCtrl.detail(ctx, userid, docid);
    ctx.body = ret ? {'errorCode':  0, 'message': ret}
                   : {'errorCode': -1, 'message': '无效的文档'};
})

router.get('/search', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];
    var query = {};

    var req2  = ctx.query;
    // 提取有效参数
    var page     = parseInt(req2.page);
    var pageSize = parseInt(req2.pageSize);
    var fields = ['content', 'tag'];
    for (var i=0; i<fields.length; i++) {
        var key   = fields[i];
        var value = req2[key];
        // 检查是否含有效字符
        if (!value || !/^[\s]*.+[\s]*$/.test(value)) continue;
        query[key] = value.replace(/[\s]+/, ' ') // 将多个空格替换为一个
                          .replace(/(^\s*)|(\s*$)/g, "") // 删除字符串首尾的空格
                          .split(' ');
    }
    var dateExp = new RegExp(/^\d{4}(-)\d{1,2}\1\d{1,2}$/);
    if (req2.createget && dateExp.test(req2.createget)) { query['createget'] = req2.createget; }
    if (req2.createlet && dateExp.test(req2.createlet)) { query['createlet'] = req2.createlet; }
    switch (req2.order) {
        case '2': query['order'] = ['createdAt', 'ASC']; break;
        default: query['order'] = ['createdAt', 'DESC'];
    }

    // 允许未登录用户访问， userid可以为0
    var user = ctx.session.user;
    var userid = (user && user.id) ? user.id : 0;
    var res = await DocumentCtrl.search(ctx, userid, query, page, pageSize);
    ctx.body = {'errorCode': 0, 'message': res};
})

module.exports = router;