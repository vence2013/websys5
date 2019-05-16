/****************************************************************************** 
 * 文件名称 ： apps.js
 * 功能说明 ： 
 *      使用KOA框架， 启动HTTPS服务器。
 * 
 * 创建日期 ： 2019/04/01
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/01    - 创建文件。
 *****************************************************************************/  

const fs    = require('fs');
const path  = require('path');
const https = require('https'); 
// 网站框架KOA
const Koa     = require('koa');
// 表单数据接收
const Body    = require('koa-body');
// 静态文件服务
const StaticServer = require('koa-static-server');
// 前端显示模板引擎
const Views   = require('koa-views');
// 错误处理
const Errors  = require('koa-error');
// 终端日志显示
const Logger  = require('koa-logger');
// Session
const Session = require('koa-session');


// 系统数据
global.sysdata = require('./data');

// SSL证书文件
const options = {
    key : fs.readFileSync('cert/server-key.pem'),
    ca  : fs.readFileSync('cert/ca-cert.pem'),
    cert: fs.readFileSync('cert/server-cert.pem')
}
// 子网站目录
const webdir = path.join(__dirname, 'websites');
// 加载配置文件， 以根目录的路径为基础
const config = require('dotenv').config({ path: '.env' }).parsed;

var app = new Koa();
// cookie的签名
app.keys = ['cookie sign random: 802566 338402 994741 227937 868228'];


app
.use(Body({
    multipart: true, formidable: { maxFileSize: 5*1024*1024*1024 } /* 最大5GB(不考虑视频) */
}))
.use(Views(__dirname+'/websites', {
    map: {html: 'underscore'}
}))
.use(Session({ 
    key: 'koa:sess', maxAge: 3600000/* cookie过期时间， 毫秒*/, overwrite: true,
    httpOnly: true/* 只有服务器端可以获取cookie */, signed: true/* 签名 */, rolling: true, renew: false
}, app))
.use(Logger((str, args)=>{
    var fmt = args.shift();
    console.log(fmt, args);
}))
.use(Errors({
    engine: 'underscore',
    template: path.join(__dirname, 'core/view/errors.html')
}))
.use(StaticServer({ 
    rootDir: 'node_modules', rootPath: '/node_modules' 
}))
.use(StaticServer({ 
    rootDir: '/upload', rootPath: '/upload' 
}))
.use(require('./core/loader')(app, webdir, config));

// 监听服务器
https.createServer(options, app.callback()).listen(443);
console.log('^_^  websys serve in https now!');
