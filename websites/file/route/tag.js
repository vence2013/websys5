/****************************************************************************** 
 * 文件名称 ： tag.js
 * 功能说明 ： file
 * 
 * 创建日期 ： 2019/03/02
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/03/02    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/

var router = new Router();


/* 添加文件关联的标签 
 * 返回数据： 文件关联的标签， 搜索(空)标签
 */
router.post('/:fileid', async (ctx, next)=>{
    const TagCtrl = ctx.controls['tag/tag'];
    const TagCtrl2= ctx.controls['file/tag'];    

    var req  = ctx.request.body;
    var req2 = ctx.params;
    // 提取有效参数
    var fileid = req2.fileid;
    var name    = req.tagname;
    var str     = req.str;
    var page    = parseInt(req.page);
    var pageSize= parseInt(req.pageSize);

    var user = ctx.session.user;
    var ret = await TagCtrl2.attach(ctx, user.id, fileid, name);
    if (!ret) {
        var rellist = await TagCtrl2.getByFile(ctx, fileid);
        var reslist = await TagCtrl.search(ctx, str, page, pageSize, ['createdAt', 'DESC']);
        ctx.body = {'errorCode': 0, 'message': {'rellist': rellist, 'reslist': reslist}}
    } else {
        ctx.body = {'errorCode':-1, 'message': '文件无效！'};
    }
})


router.delete('/:fileid', async (ctx, next)=>{
    const TagCtrl = ctx.controls['tag/tag'];
    const TagCtrl2= ctx.controls['file/tag'];    

    var req  = ctx.query;
    var req2 = ctx.params;
    // 提取有效参数
    var fileid = req2.fileid;
    var name    = req.tagname;
    var str     = req.str;
    var page    = parseInt(req.page);
    var pageSize= parseInt(req.pageSize);

    var user = ctx.session.user;
    await TagCtrl2.dettach(ctx, user.id, fileid, name);
    var rellist = await TagCtrl2.getByFile(ctx, fileid);
    var reslist = await TagCtrl.search(ctx, str, page, pageSize, ['createdAt', 'DESC']);
    ctx.body = {'errorCode': 0, 'message': {'rellist': rellist, 'reslist': reslist}}
})


/* 获取文件关联的标签 */
router.get('/:fileid', async (ctx, next)=>{
    const TagCtrl = ctx.controls['file/tag'];

    var req2 = ctx.params;
    // 提取有效的参数
    var fileid = parseInt(req2.fileid);

    var taglist = await TagCtrl.getByFile(ctx, fileid);
    ctx.body = {'errorCode': 0, 'message': taglist};
})


module.exports = router;