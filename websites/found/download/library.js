/****************************************************************************** 
 * 文件名称 ： library.js
 * 功能说明 ： found
 * 公共功能库     
 * 1. 连接数据库， 同步数据结构。
 * 
 * 创建日期 ： 2019/2/21
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/21    - 创建文件。
 *****************************************************************************/ 

const Sequelize = require('sequelize');
const cfg = require('dotenv').config({ path: __dirname+'/../../../.env' }).parsed;


/* 
 * Function     : dateFormat
 * Description  : 
 * 对Date的扩展，将Date转化为指定格式的String。
 *     月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 *     年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * 例子：
 *     (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 *     (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 * 
 * Parameter    : 
 * Return       : 用户可访问的接口列表
 */

exports.dateFormat = (fmt, date)=>{
    var o = {   
        "M+" : date.getMonth()+1,                 //月份   
        "d+" : date.getDate(),                    //日   
        "h+" : date.getHours(),                   //小时   
        "m+" : date.getMinutes(),                 //分   
        "s+" : date.getSeconds(),                 //秒   
        "q+" : Math.floor((date.getMonth()+3)/3), //季度   
        "S"  : date.getMilliseconds()             //毫秒   
    };

    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)) { 
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }

    return fmt;   
}  


/* 
 * Function     : dbConnect
 * Description  : 
 *      初始化数据库连接， 并加载数据库模型。
 * 
 * Parameter    : 
 * Return       : none
 */

exports.dbConnect = (cb)=>{
    var DBConn = {};

    // 创建ORM对象
    var sequelize = DBConn['db'] = new Sequelize(cfg.SYSNAME, cfg.SYSNAME, cfg.MYSQL_ROOT_PASSWORD, { 
        host: cfg.CONTAINER_MYSQL_NAME, dialect: 'mysql', operatorsAliases: false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    });

    sequelize
    .authenticate()
    .then(async () => {
        console.log('^_^ Connection has been established successfully.');  

        DBConn['model'] = {};
        DBConn['model']['Found']        = await sequelize.import(__dirname+"/../model/Found");
        DBConn['model']['FoundCompany'] = await sequelize.import(__dirname+"/../model/FoundCompany");
        DBConn['model']['FoundValue']   = await sequelize.import(__dirname+"/../model/FoundValue");
        DBConn['model']['FoundStatistics']= await sequelize.import(__dirname+"/../model/FoundStatistics");

        // 同步到数据库
        sequelize
        .sync({logging: false})
        .then(()=>{
            if (cb) { cb(DBConn); }
        })               
    }).catch(err => { 
        console.error('^~^ Unable to connect to the database:', err); 
    }); 
}