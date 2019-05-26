/****************************************************************************** 
 * 文件名称 ： tag.js
 * 功能说明 ： file
 * 
 * 创建日期 ： 2019/5/26
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/26    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();

/* 获取标签关联的文档 */
router.get('/:tagid', async (ctx)=>{
    const TagCtrl2 = ctx.controls['file/tag'];

    var req  = ctx.query;
    var req2 = ctx.params;
    var str  = req.str
        .replace(/[\s]+/, ' ') // 将多个空格替换为一个
        .replace(/(^\s*)|(\s*$)/g, "") // 删除字符串首尾的空格
        .split(' ');
    var page     = /^\d+$/.test(req.page) ? parseInt(req.page) : 0;
    var pageSize = /^\d+$/.test(req.pageSize) ? parseInt(req.pageSize) : 0;
    var tagid = /^\d+$/.test(req2.tagid) ? parseInt(req2.tagid) : 0;

    // 允许未登录用户访问， userid可以为0
    var user = ctx.session.user;
    var userid = (user && user.id) ? user.id : 0;
    var ret = await TagCtrl2.relate(ctx, userid, tagid, str, page, pageSize);
    ctx.body = {'errorCode': 0, 'message': ret};
})

module.exports = router;