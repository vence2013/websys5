/****************************************************************************** 
 * 文件名称 ： index.js
 * 功能说明 ： 
 *      category子网站路由
 * 
 * 创建日期 ： 2019/4/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/4/27    - 创建文件。
 *****************************************************************************/ 

const fs     = require('fs');
const Send   = require('koa-send');
const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


/* 文件上传和编辑分开进行 */
router.post('/upload', async (ctx, next)=>{
    const FileCtrl = ctx.controls['file/file'];

    /* 新版本的koa-body通过ctx.request.files获取上传的文件，旧版本的koa-body通过ctx.request.body.files获取上传的文件 
     * https://blog.csdn.net/simple__dream/article/details/80890696
     */
    var file = ctx.request.files.file;

    var user = ctx.session.user;
    var ret = await FileCtrl.create(ctx, user.id, file);
    ctx.body = ret ? {'errorCode':  0, 'message': 'SUCCESS'}
                   : {'errorCode': -1, 'message': '文件已经存在，添加失败！'};
});


router.put('/:fileid', async (ctx, next)=>{
    const FileCtrl = ctx.controls['file/file'];

    var req     = ctx.request.body;
    var req2    = ctx.params;
    // 提取有效的参数
    var fileid  = req2.fileid;
    var name    = req.name;
    var desc    = req.desc;
    var private = req.private;

    var user = ctx.session.user;
    var ret = await FileCtrl.update(ctx, user.id, fileid, name, desc, private);
    switch (ret) {
        case -1: ctx.body = {'errorCode':-1, 'message': '无效的文件，或该文件不属于当前用户，无法进行修改'}; break;
        default: ctx.body = {'errorCode': 0, 'message': 'SUCCESS'} ;
    }
})


router.delete('/:fileid', async (ctx, next)=>{
    const FileCtrl = ctx.controls['file/file'];

    var req2    = ctx.params;
    // 提取有效的参数
    var fileid  = req2.fileid;

    var user = ctx.session.user;
    await FileCtrl.delete(ctx, user.id, fileid);
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
})


/* 文件页面：首页 */
router.get('/', async (ctx)=>{
    await ctx.render('file/view/index.html'); 
});

/* 主要用于编辑文件(必须放到GET/, GET/advance后， 否则其他的将被忽略)
 * 获取文件的详细信息，包括：文件信息， 创建用户名， 标签， 所属目录。 
 */
router.get('/detail/:fileid', async (ctx, next)=>{
    const FileCtrl = ctx.controls['file/file'];

    var req2  = ctx.params;
    // 提取有效参数
    var fileid = req2.fileid;

    // 允许非登录用户访问， 所以userid可以为0
    var user = ctx.session.user;
    var userid = (user && user.id) ? user.id : 0;
    var ret = await FileCtrl.detail(ctx, userid, fileid);
    ctx.body = {'errorCode': 0, 'message': ret};
})


/* 搜索当前用户上传的文件，用于编辑文件。
 * 搜索文件名称和描述， 可以输入多个字符串，以空格分隔
 */
router.get('/last', async (ctx, next)=>{
    const FileCtrl = ctx.controls['file/file'];

    var req2  = ctx.query;
    // 提取有效参数
    var str = req2.str
              .replace(/[\s]+/, ' ') // 将多个空格替换为一个
              .replace(/(^\s*)|(\s*$)/g, "") // 删除字符串首尾的空格
              .split(' ');
    var page     = parseInt(req2.page);
    var pageSize = parseInt(req2.pageSize);

    var user = ctx.session.user;
    var res = await FileCtrl.search(ctx, user.id, str, page, pageSize);
    ctx.body = {'errorCode': 0, 'message': res};
})

// 根据以下参数搜索文件： 名称，描述，有效标签， 扩展名， 文件大小范围， 创建日期范围
router.get('/search', async (ctx, next)=>{
    const FileCtrl = ctx.controls['file/file'];
    var query = {};

    var req2  = ctx.query;
    // 提取有效参数
    var page     = parseInt(req2.page);
    var pageSize = parseInt(req2.pageSize);
    var fields = ['name', 'desc', 'tag', 'ext'];
    for (var i=0; i<fields.length; i++) {
        var key   = fields[i];
        var value = req2[key];
        // 检查是否含有效字符
        if (!value || !/^[\s]*.+[\s]*$/.test(value)) continue;
        query[key] = value.replace(/[\s]+/, ' ') // 将多个空格替换为一个
                          .replace(/(^\s*)|(\s*$)/g, "") // 删除字符串首尾的空格
                          .split(' ');
    }
    var fields2 = ['sizeget', 'sizelet'];
    for (var i=0; i<fields2.length; i++) {
        var key   = fields2[i];
        var value = req2[key];
        // 检查是否含有效字符
        if (!value || !/^[\s]*[\d\.]*[\s]*$/.test(value)) continue;
        var size = parseFloat(value) ? parseFloat(value).toFixed(4) : 0;
        query[key] = parseInt(size*1024*1024);
    }
    var dateExp = new RegExp(/^\d{4}(-)\d{1,2}\1\d{1,2}$/);
    if (req2.createget && dateExp.test(req2.createget)) { query['createget'] = req2.createget; }
    if (req2.createlet && dateExp.test(req2.createlet)) { query['createlet'] = req2.createlet; }
    switch (req2.order) {    
        case '1': query['order'] = ['size', 'ASC']; break;
        case '2': query['order'] = ['size', 'DESC']; break;
        case '3': query['order'] = ['createdAt', 'ASC']; break;
        default: query['order'] = ['createdAt', 'DESC'];
    }
    
    // 允许非登录用户访问， 所以userid可以为0
    var user = ctx.session.user;
    var userid = (user && user.id) ? user.id : 0;
    var res = await FileCtrl.search2(ctx, userid, query, page, pageSize);
    ctx.body = {'errorCode': 0, 'message': res};
})


module.exports = router;