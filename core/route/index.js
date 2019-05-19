/****************************************************************************** 
 * 文件名称 ： index.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/04/03
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/03    - 创建文件。
 *****************************************************************************/ 

const Router = require('koa-router');


/******************************************************************************
 * 全局变量
 *****************************************************************************/

var router = new Router();


/* 用户登录 */
router.post('/login', async (ctx)=>{
    const UserCtrl = ctx.controls['user'];
    var jsonResult = {'errorCode': 0, 'message': ''}

    // 将参数传递给对象
    var req = ctx.request.body;
    // 转化参数类型/格式， 过滤恶意输入
    var username = req.username;
    var password = req.password;
    
    // 调用登录接口
    var ret = await UserCtrl.login(ctx, username, password);
    // 登录成功，设置SESSION数据。
    if (ret) {
        ctx.session.user = {'id':ret.id, 'username': ret.username, 'interfaces': ret.interfaces.toString()}; 
        jsonResult.message = ctx.session.user;
    } else {
        jsonResult.errorCode = -1;
        jsonResult.message   = '用户名或密码错误！';
    }

    ctx.body = jsonResult;
})

/* 系统首页 */
router.get('/', async (ctx)=>{
    ctx.redirect('/view');
})


/* 注销请求 */
router.get('/logout', async (ctx)=>{
    ctx.session.user = null;    
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
})

/* 根据用户登录状况返回可访问的导航菜单。
 * 树形结构的接口列表如下：
 * [{
 *      "name": "Document", "url": "/abc", "children": [{
 *          "name": ...
 *      }]
 * }, {
 *      "name": "File", ...
 * }]
 */
router.get('/nav', async (ctx)=>{
    var user = ctx.session.user;
    var src  = sysdata.navigation;

    var nav = {}, navSub = {};
    for (var i=0; i<src.length; i++) {
        if ((src[i]['access']!='any') && (!user || (user.username!='root' && (src[i]['access']!='user')))) continue;
        var father = src[i]['father'];
        if (father) {
            if (!navSub[father]) navSub[father] = [];
            navSub[father].push(src[i]); 
        } else {
            var name = src[i]['name'];
            nav[name] = src[i];
        }
    }
    // 将二级菜单关联到一级菜单
    for (x in navSub) { nav[x]['children'] = navSub[x]; }
    var navlist = [];
    for (x in nav) { navlist.push(nav[x]); }
    
    ctx.body = {'errorCode': 0, 'message': {'user': user ? user : null, 'nav': navlist}}
});

router.get('/backup', async (ctx)=>{
    const SysCtrl = ctx.controls['sys'];

    var ret = await SysCtrl.backup();
    ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
})

module.exports = router;
