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
const Router = require('koa-router'); 


/******************************************************************************
 * 全局变量
 *****************************************************************************/
var router = new Router();

router.get('/', async (ctx)=>{
    await ctx.render('websites/category/view/index.html'); 
});


// 添加子节点
router.post('/', async (ctx)=>{
    const CategoryCtrl = ctx.controls['category/category'];

    var req = ctx.request.body;
    // 提取有效参数
    var name = req.name;
    var desc = req.desc;
    var father  = req.father;

    var user = ctx.session.user;
    var ret  = await CategoryCtrl.create(ctx, user.username, father, name, desc);
    switch(ret) {
        case -1: ctx.body = {'errorCode': -1, 'message': '当前目录下已存在该子目录！'}; break;
        default: ctx.body = {'errorCode':  0, 'message': 'SUCCESS'};
    }
})

router.put('/:id', async (ctx)=>{
    const CategoryCtrl = ctx.controls['category/category'];
    var user = ctx.session.user;

    var req = ctx.request.body;
    // 提取有效参数
    var req2 = ctx.params;
    var name = req.name;
    var desc = req.desc;
    var id = parseInt(req2.id);
    
    var ret = await CategoryCtrl.update(ctx, user.username, id, name, desc);
    ctx.body = ret ? {'errorCode':  0, 'message': 'SUCCESS'}
                   : {'errorCode': -1, 'message': '无效的节点或无权修改！'}
})


router.delete('/:id', async (ctx)=>{
    const CategoryCtrl = ctx.controls['category/category'];
    var user = ctx.session.user;

    var req2 = ctx.params;
    // 提取有效参数
    var id = parseInt(req2.id);

    if (user.username == 'root') {
        await CategoryCtrl.delete(ctx, id);
        ctx.body = {'errorCode': 0, 'message': "SUCCESS"};
    } else {
        ctx.body = {'errorCode':-1, 'message': "无权删除，请联系管理员"};
    }
})

/* 
 * URL          : /category/tree/:rootid
 * Method       : GET
 * Description  : 获取树形结构的目录数据。
 * 
 * 说明： 为了避免和静态文件(GET方法的/category/view)冲突，使用路径/category/tree/:id
 * Parameter    : none.
 * Return       : none.
 */

router.get('/tree/:rootid', async (ctx)=>{
    const CategoryCtrl = ctx.controls['category/category'];

    var req2 = ctx.params;
    // 获取有效参数
    var rootid = /^\d+$/.test(req2.rootid) ? parseInt(req2.rootid) : 0;

    var tree = await CategoryCtrl.getTreeByRoot(ctx, rootid);
    ctx.body = {'errorCode': 0, 'message': tree};
})


module.exports = router;