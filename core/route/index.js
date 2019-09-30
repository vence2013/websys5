/****************************************************************************** 
 * 文件名称 ： index.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/04/03
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/03    - 创建文件。
 *****************************************************************************/ 

const moment = require('moment');
const Router = require('koa-router');


/******************************************************************************
 * 全局变量
 *****************************************************************************/

var router = new Router();


/* 系统首页 */
router.get('/', async (ctx)=>{
    await ctx.render('core/view/index.html'); 
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
    // 将对象转换为数组
    var navlist = [];
    for (x in nav) { navlist.push(nav[x]); }
    
    ctx.body = {'errorCode': 0, 'message': {'user': user ? user : null, 'nav': navlist}}
});

/* 该接口只有root用户可以访问 */
router.get('/backup', async (ctx)=>{
    const SysCtrl = ctx.controls['sys'];
    const DocumentCtrl = ctx.controls['document/document'];

    var req2 = ctx.query;
    var taglist = req2.taglist
        .replace(/[\s]+/, ' ') // 将多个空格替换为一个
        .replace(/(^\s*)|(\s*$)/g, "") // 删除字符串首尾的空格
        .split(' ');
    var query = {'page':1, 'pageSize':1000, 'order':['createdAt', 'DESC']};
    if (taglist.length) query['tag']=taglist;
    // 导出文件
    var user = ctx.session.user;
    await DocumentCtrl.export2file(ctx, user.id, query);
    // 执行数据备份
    var datestr = moment().format("YYYYMMDD");
    var backupfile = 'backup-'+datestr+'.tgz';
    SysCtrl.backup(backupfile);
    ctx.body = {'errorCode':0, 'message':backupfile};
})

router.get('/backup/progress', async (ctx)=>{
    const SysCtrl = ctx.controls['sys'];
    var message = '';

    switch (SysCtrl.backupProgress()) {
        case 1: message = '完成文件备份， 正在进行数据库导出...'; break;
        case 2: message = '完成数据库导出，正在打包备份文件...';  break;
        case 3: message = '数据备份完成！'; break;
        default: message = '系统备份就绪!';
    }

    ctx.body = {'errorCode':0, 'message':message};
})

module.exports = router;
