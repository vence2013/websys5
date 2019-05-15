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

    var nav = [];
    var navSource = sysdata.navigation;

    for (var i=0; i<navSource.length; i++) { // 遍历一级菜单
        // 判断是否能够访问该节点
        if ((navSource[i].access=='any') || 
            (user && (user.username=='root')) || 
            (user && (navSource[i].access=='user'))) 
        { 
            var obj = {'name': navSource[i].name, 'url': navSource[i].url}; 

            // 如果有子菜单，则遍历二级菜单
            if (navSource[i].children && navSource[i].children.length) {
                var sub = navSource[i].children;
                for (var j=0; j<sub.length; j++) {
                    // 判断是否能够访问该节点
                    if ((sub[j].access=='any') || 
                        (user && (user.username=='root')) || 
                        (user && (sub[j].access=='user'))) 
                    {
                        if (!obj['children']) obj['children'] = [];
                        obj['children'].push({'name': sub[j].name, 'url': sub[j].url});
                    } 
                }
            }  

            nav.push(obj);
        }      
    }
    
    ctx.body = {'errorCode': 0, 'message': {'user': user ? user : null, 'nav': nav}}
});


/* 
 * URL          : /logout
 * Method       : GET
 * Description  : 处理注销请求。
 * Parameter    : none.
 * Return       : none.
 */

router.get('/logout', async (ctx)=>{
    var jsonResult = {'errorCode': 0, 'message': 'SUCCESS'}

    ctx.session.user = null;    
    ctx.body = jsonResult;
})


module.exports = router;
