/****************************************************************************** 
 * 文件名称 ： dataTransfer.js
 * 功能说明 ： 数据表的数据转移。
 * 脚本调用说明：
 *      node dataTransfer.js <source database name> <distination database name>
 * 
 * 创建日期 ： 2019/10/05
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/10/05    - 创建文件。
 *****************************************************************************/ 

const Sequelize = require('sequelize'); 
const cfg = require('dotenv').config({ path: __dirname+'/../.env' }).parsed;

var arguments = process.argv.splice(2);
//console.log('dbg', arguments, cfg);

// 创建ORM对象
var sequelizeSrc = new Sequelize(arguments[0], 'root', cfg.MYSQL_ROOT_PASSWORD, { 
    host: cfg.CONTAINER_MYSQL_NAME, dialect: 'mysql', operatorsAliases: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});
var sequelizeDst = new Sequelize(arguments[1], 'root', cfg.MYSQL_ROOT_PASSWORD, { 
    host: cfg.CONTAINER_MYSQL_NAME, dialect: 'mysql', operatorsAliases: false,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
});

sequelizeSrc
.authenticate()
.then(async () => {
    console.log('^_^ Connection has been established successfully.');  


}).catch(err => { 
    console.error('^~^ Unable to connect to the database:', err); 
}); 