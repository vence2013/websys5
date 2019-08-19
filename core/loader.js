/****************************************************************************** 
 * 文件名称 ： loader.js
 * 功能说明 ： 加载核心系统，子网站模块。
 * 
 * 创建日期 ： 2019/04/01
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/01    - 创建文件。
 *****************************************************************************/ 

const fs        = require("fs") ;
const url       = require('url');
const path      = require('path');
const crypto    = require('crypto');
const glob      = require('glob'); 
const moment    = require('moment');
const compose   = require('koa-compose');
const Sequelize = require('sequelize');
const StaticServer = require('koa-static-server');

/* 
 * Function     : model
 * Description  : 加载所有路径下载的数据模型文件。
 * 
 * 说明： 先完成所有数据模型的加载，然后再加载关系。
 * Parameter    :
 *      sequelize - 数据库连接
 *      dirlist   - 数据文件所在的目录
 *      models    - 模型列表(输出)
 * Return       : none
 */

async function model(sequelize, dirlist, models)
{
    // 导入数据模型( 过滤关系Relations.js )
    for (var i=0; i<dirlist.length; i++) {
        await fs
        .readdirSync(dirlist[i])
        .filter((x)=>{ return x!='Relations.js'; })  // 加载数据模型时过滤Relations.js
        .forEach(async (e, idx)=>{
            let file = path.join(dirlist[i], e);
            if (fs.statSync(file).isFile()) {
                let fileObj = path.parse(file);
                models[ fileObj.name ] = await sequelize.import(file);
            }
        })
    }
    
    // 导入数据模型的关系
    for (var i=0; i<dirlist.length; i++) {
        let file = dirlist[i]+'/Relations.js';
        if (fs.existsSync(file)) { await require(file).link(models, sequelize); }
    }
}


/* 
 * Function     : control
 * Description  : 加载所有路径下载的路由。
 * 
 * Parameter    :
 *      dirlist   - 数据文件所在的目录
 *      controls  - 控制器
 * Return       : none
 */

async function control(dirlist, controls)
{    
    for (var i=0; i<dirlist.length; i++) {
        glob
        .sync(dirlist[i]+"/*.js")
        .map((file)=>{
            var fileObj = path.parse(file);
            var ret = fileObj.dir.split('/');
            ret.pop();
            var webname  = ret.pop();
            var filename = fileObj.name;
            
            var key = (webname=='core') ? filename : (webname+'/'+filename);
            controls[ key ] = require(file);
        });
    }
}


/* 
 * Function     : control
 * Description  : 加载所有路径下载的路由。
 * 
 * Parameter    :
 *      dirlist   - 数据文件所在的目录
 * Return       : none
 */

function route(dirlist)
{
    var routers = [];

    for (var i=0; i<dirlist.length; i++) {
        glob
        .sync(dirlist[i]+"/*.js")
        .map((file)=>{
            var urlPrefix = '';

            var fileObj = path.parse(file);
            var ret = fileObj.dir.split('/');
            ret.pop();
            var webname  = ret.pop();
            var filename = fileObj.name;

            if (filename=='index') {
                urlPrefix = (webname=='core') ? '' : '/'+webname;
            } else {
                urlPrefix = (webname=='core') ? '/'+filename : ('/'+webname+'/'+filename);
            }
            var router = require(file);
            router.prefix(urlPrefix);

            routers.push(router.routes());
            routers.push(router.allowedMethods());
        });
    }

    return compose(routers);
}


/* 检查接口访问权限的中间件。
 */

function authCheck() {
    return async function(ctx, next) { 
        var user = ctx.session.user;
        var success = false;
        
        // 1. 访问的接口为公开接口
        var publiclist = sysdata.interfaces.public;
        var reqstr = ctx.method+url.parse(ctx.url).pathname;
        // 将公开接口转换为正则表达式， 比如'/docment/:id' > /^\/document\/[^\/]*$/
        for (var i=0; !success && (i<publiclist.length); i++) {
            var str1 = publiclist[i].method+publiclist[i].url;
            
            var str2 = str1
                       .replace(/:[^/]+/g, '[^/]*')  // 1. 将':*'替换为'[^/]*'
                       .replace(/\//g, '\\\/')         // 2. 将所有的'/'替换为'\/'
            // 根据字符串构建正则表达式
            if ((new RegExp('^'+str2+'$')).test(reqstr)) success = true;
        }
    
        if (!success && user) {
            // 2. 当前登录用户为超级管理员(root)
            if (user.username=='root') success = true;
            else {
                // 3. 访问的接口为私有接口，用户具有访问该接口的权限
                var privatelist = user.interfaces
                                  .replace(/[\s]+/, ' ')  // 删除多余的空格
                                  .replace(/^\s+|\s+$/g,'') // 删除首尾的空格
                                  .split(' ');
                // 参考公开列表处理
                for (var i=0; !success && (i<privatelist.length); i++) {            
                    var str2 = privatelist[i]
                               .replace(/:[^/]+/g, '[^/]*')  // 1. 将':*'替换为'[^/]*'
                               .replace(/\//g, '\\\/')         // 2. 将所有的'/'替换为'\/'
                    // 根据字符串构建正则表达式
                    if ((new RegExp('^'+str2+'$')).test(reqstr)) success = true;
                }
            }
        }
    
        if (!success) { ctx.throw(401); }
        await next(); 
    }
}

/* 检查系统是否初始化
 */

function installCheck() {
    return async function(ctx, next) {
        if (fs.existsSync("./install.log")) await next();
        else {
            var req = ctx.method+ctx.url;

            if (req == 'POST/user') { // 添加超级管理员用户
                const hash = crypto.createHash('sha256');

                var req = ctx.request.body;
                // 转化参数类型/格式， 过滤恶意输入
                var username = req.username;
                var password = req.password;
                var now      = moment().format("YYYY-MM-DD HH:mm:ss");

                // 添加用户
                // 获取密码的sha256结果    
                hash.update(password);
                var cryptoPassword = hash.digest('hex');
                await ctx.sequelize.query("INSERT INTO `Users` (`username`, `password`, `interfaces`, `createdAt`, `updatedAt`) VALUES('"+
                    username+"','"+cryptoPassword+"','','"+now+"','"+now+"');", {logging: false});
                // 添加分组
                await ctx.sequelize.query("INSERT INTO `Groups` (`name`, `createdAt`, `updatedAt`) VALUES('"+username+"','"+now+"','"+now+"');", {logging: false});

                // 创建 install.log 
                fs.writeFileSync(__dirname+'/../install.log', 'install at:'+now);

                ctx.body = {'errorCode': 0, 'message': 'SUCCESS'};
            } else { // 清理数据库
                await ctx.sequelize.query("DELETE FROM Users;", {logging: false});
                await ctx.sequelize.query("DELETE FROM Groups;", {logging: false});
                await ctx.sequelize.query("DELETE FROM Categories;", {logging: false});
                ctx.throw(403);
                await next();
            }
        }       
    }
}

/* 初始化数据库后加载核心框架
 */

module.exports = (app, webdir, config)=>{
    // 创建数据库连接，并关联到 ctx.sequelize 。
    var sequelize = new Sequelize(config.SYSNAME, config.SYSNAME, config.MYSQL_ROOT_PASSWORD, 
        {
            host: config.MYSQL_IP, dialect: 'mysql', pool: 
            { max: 5, min: 0, acquire: 30000, idle: 10000 }
        }
    );
    app.context.sequelize = sequelize;

    // 数据库连接测试。
    sequelize
    .authenticate()
    .then(async () => { 
        console.log('^_^ Connection has been established successfully.'); 

        app.context.models  = [];
        app.context.controls= [];

        /* 加载系统核心和子网站的静态资源 */
        app
        .use(installCheck())  // 检查系统是否安装， 放在系统核心前（包括静态资源）
        .use(StaticServer({ rootDir: path.join(__dirname, 'view'), rootPath: '/view' }))

        glob.sync(webdir+"/*/").map(async (dir)=>{
            if (fs.existsSync(path.join(dir, 'view')))    {
                var dirObj = path.parse(dir);
                app
                .use(StaticServer({ rootDir: path.join(dir, 'view'), rootPath: '/'+dirObj.base+'/view' }))
            }
        });

        /* 首先加载核心资源， 然后加载子网站资源。
         * 分开加载的原因是： 子网站需要权限管理的支持，同时权限管理需要在子网站资源加载前执行。
         */
        await model(sequelize, [ path.join(__dirname, 'model') ], app.context.models);
        await control([ path.join(__dirname, 'control') ], app.context.controls);
        app
        .use(authCheck()) // 认证检查， 放在子网站静态资源后，路由前
        .use(route([ path.join(__dirname, 'route') ]))
        

        // 加载子网站
        {
            var modeldirs=[], controldirs=[], routedirs=[];
    
            /* 加载系统资源
            * 1. 分类搜索系统的各类资源目录， 比如数据模型目录(modeldir), 路由目录(routedir)...
            * 2. 分类加载目录列表下的资源 
            */
            glob.sync(webdir+"/*/").map(async (dir)=>{
                // 遍历子网站目录，添加资源路径
                var modeldir   = path.join(dir,'model');
                var routedir   = path.join(dir,'route');
                var controldir = path.join(dir,'control');
                // 如果这些资源目录存在，则添加到列表
                if (fs.existsSync(modeldir))   { modeldirs.push(modeldir); }
                if (fs.existsSync(routedir))   { routedirs.push(routedir); }
                if (fs.existsSync(controldir)) { controldirs.push(controldir); }
            });
    
            await model(sequelize, modeldirs, app.context.models);
            await control(controldirs, app.context.controls);
            app.use(route(routedirs)); 
        }

        // 同步到数据库
        await sequelize.sync({logging: false}); 
    }).catch(err => { 
        console.error('^~^ Unable to connect to the database:', err); 
    });

    return async function(ctx, next) { await next(); }
}
