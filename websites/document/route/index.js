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


// 刷新保留标签搜索
router.get('/', async (ctx)=>{
    var req2 = ctx.query;
    var taglist = req2.taglist;
    
    await ctx.render('websites/document/view/index.html', {'taglist':taglist}); 
});

// 添加/编辑文档
router.get('/edit/:docid', async (ctx)=>{
    var req2 = ctx.params;
    var docid= parseInt(req2.docid);

    await ctx.render('websites/document/view/edit.html', {'id':docid}); 
});

router.get('/display/:docid', async (ctx)=>{
    var req2 = ctx.params;
    var docid= parseInt(req2.docid);

    await ctx.render('websites/document/view/display.html', {'id':docid}); 
});

router.post('/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];
    var user = ctx.session.user;

    var req = ctx.request.body;
    var req2= ctx.params;
    // 有效参数
    var content = req.content;
    var taglist = req.taglist;
    var docid= parseInt(req2.docid);
    
    var ret = await DocumentCtrl.edit(ctx, user.username, docid, content, taglist);
    switch (ret) {
        case -1: ctx.body = {'errorCode': -1, 'message': '无效文档或无权修改'}; break;
        case  0: ctx.body = {'errorCode':  0, 'message': 'SUCCESS'}
    }
});

/* 删除文档， 只有登录用户可以执行 */
router.delete('/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];
    var user = ctx.session.user;

    var req2 = ctx.params;
    var docid = parseInt(req2.docid);
    
    await DocumentCtrl.delete(ctx, user.username, docid);

    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
});

/* 获取文档的详细信息：文档信息， 关联标签列表 */
router.get('/detail/:docid', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];

    var req2= ctx.params;
    var docid= parseInt(req2.docid);

    var ret = await DocumentCtrl.detail(ctx, docid);
    ctx.body = ret ? {'errorCode':  0, 'message': ret}
                   : {'errorCode': -1, 'message': '无效的文档'};
})


function reqCheck(req2) {
    var query = {};

    query['page']     = parseInt(req2.page);
    query['pageSize'] = parseInt(req2.pageSize);
    // 以空格分开的字符串
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
    // 日期格式
    var dateExp = new RegExp(/^\d{4}(-)\d{1,2}\1\d{1,2}$/);
    if (req2.createget && dateExp.test(req2.createget)) { query['createget'] = req2.createget; }
    if (req2.createlet && dateExp.test(req2.createlet)) { query['createlet'] = req2.createlet; }
    // 排序
    switch (req2.order) {
        case '2': query['order'] = ['createdAt', 'ASC']; break;
        default: query['order'] = ['createdAt', 'DESC'];
    }

    return query;
}

router.get('/search', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];
    
    var req2  = ctx.query;
    var query = reqCheck(req2); // 提取有效参数

    var res = await DocumentCtrl.search(ctx, query);
    ctx.body = {'errorCode': 0, 'message': res};
})

router.get('/export', async (ctx)=>{
    const DocumentCtrl = ctx.controls['document/document'];

    var req2  = ctx.query;
    var query = reqCheck(req2); // 提取有效参数

    await DocumentCtrl.export2file(ctx, query);
    ctx.body = {'errorCode': 0, 'message': 'Finished!'};
})


module.exports = router;