/****************************************************************************** 
 * 文件名称 ： category.js
 * 功能说明 ： file的目录相关处理
 * 
 * 创建日期 ： 2019/4/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/4/27    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 

/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();


router.post('/:categoryid', async (ctx)=>{
    const CategoryCtrl2 = ctx.controls['file/category'];

    var req  = ctx.request.body;
    var req2 = ctx.params;
    // 提取有效参数
    var categoryid = parseInt(req2.categoryid);
    var fileids    = req.fileids;

    var user = ctx.session.user;
    var ret = await CategoryCtrl2.attach(ctx, user.id, categoryid, fileids);
    switch (ret) {
        case -1: ctx.body = {'errorCode':-1, 'message':'无效的目录！'}; break;
        case -2: ctx.body = {'errorCode':-2, 'message':'无效的文件！'}; break;
        default: ctx.body = {'errorCode':0 , 'message':'SUCCESS'};
    }
})

router.delete('/:categoryid', async (ctx)=>{
    const CategoryCtrl2 = ctx.controls['file/category'];

    var req2 = ctx.params;
    var req3 = ctx.query;
    // 提取有效参数
    var categoryid = parseInt(req2.categoryid);
    var fileids    = req3.fileids;

    var user = ctx.session.user;
    var ret = await CategoryCtrl2.dettach(ctx, user.id, categoryid, fileids);
    switch (ret) {
        case -1: ctx.body = {'errorCode':-1, 'message':'无效的目录！'}; break;
        default: ctx.body = {'errorCode':0 , 'message':'SUCCESS'};
    }
})


router.get('/:categoryid', async (ctx)=>{
    const CategoryCtrl2 = ctx.controls['file/category'];

    var req  = ctx.query;
    var req2 = ctx.params;    
    // 提取有效参数
    var categoryid = /^\d+$/.test(req2.categoryid) ? parseInt(req2.categoryid) : 0;
    var str = req.str
        .replace(/[\s]+/, ' ') // 将多个空格替换为一个
        .replace(/(^\s*)|(\s*$)/g, "") // 删除字符串首尾的空格
        .split(' ');
    var page     = /^\d+$/.test(req.page) ? parseInt(req.page) : 1;
    var pageSize = /^\d+$/.test(req.pageSize) ? parseInt(req.pageSize) : 100;
    var isRelate = req.isRelate ? true : false;

    var user = ctx.session.user;
    var ret = await CategoryCtrl2.relate(ctx, user.id, categoryid, page, pageSize, str, isRelate);
    ctx.body = {'errorCode':0, 'message':ret};
})


module.exports = router;