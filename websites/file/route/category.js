/****************************************************************************** 
 * 文件名称 ： category.js
 * 功能说明 ： file
 * 
 * 创建日期 ： 2019/05/01
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/05/01    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/

var router = new Router(); 

/* 返回文件关联的目录ID数组
 */
router.post('/:fileid', async (ctx, next)=>{
    const CategoryCtrl2 = ctx.controls['file/category'];

    var req  = ctx.request.body;    
    var req2   = ctx.params;
    // 提取有效参数
    var fileid = req2.fileid;
    var categoryid = req.categoryid;    

    var user = ctx.session.user;
    var ids = await CategoryCtrl2.attach(ctx, user.id, fileid, categoryid);
    ctx.body = {'errorCode': 0, 'message': ids};
})


router.delete('/:fileid', async (ctx, next)=>{
    const CategoryCtrl2 = ctx.controls['file/category'];
 
    var req2 = ctx.params;
    var req3 = ctx.query;   
    // 提取有效参数
    var fileid = req2.fileid;
    var categoryid = req3.categoryid;

    var user = ctx.session.user;
    var ids = await CategoryCtrl2.dettach(ctx, user.id, fileid, categoryid);
    ctx.body = {'errorCode': 0, 'message': ids};
})


/* 搜索文件关联的目录列表
 * 返回文件关联的目录ID数组
 */
router.get('/:fileid', async (ctx, next)=>{
    const CategoryCtrl2 = ctx.controls['file/category'];

    var req2 = ctx.params;
    // 提取有效的参数
    var fileid = parseInt(req2.fileid);

    var ids = await CategoryCtrl2.get(ctx, fileid);
    ctx.body = {'errorCode': 0, 'message': ids};
})


module.exports = router;