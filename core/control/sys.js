/****************************************************************************** 
 * 文件名称 ： sys.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/19
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/19    - 创建文件。
 *****************************************************************************/ 

const fs = require('fs');
const childProcess = require('child_process');
const tar = require('tar');
const mysqldump = require('mysqldump');


var Progress = 0;
exports.backupProgress = (ctx)=>{ return Progress; };

exports.backup = async (backupfile)=>{
    // 重新创建临时备份目录
    var tmpdir  = '/upload/backup'; 
    if (!fs.existsSync(tmpdir)) fs.mkdirSync(tmpdir);

    // 复制备份文件
    childProcess.spawnSync('cp', ['-f', '/web/.env', tmpdir+'/env']);
    childProcess.spawnSync('cp', ['-fr', '/web/cert', tmpdir]);
    childProcess.spawnSync('cp', ['-fr', '/export', tmpdir]);

    Progress = 1;

    // 加载配置文件， 以根目录的路径为基础
    const cfg = require('dotenv').config({ path: '/web/.env' }).parsed;
    // 备份数据库
    await mysqldump({
        connection: {
            host: cfg.CONTAINER_MYSQL_NAME,
            user: 'root',
            password: cfg.MYSQL_ROOT_PASSWORD,
            database: cfg.SYSNAME,
        },
        dumpToFile: tmpdir+'/'+cfg.SYSNAME+'.sql',
    })
    Progress = 2;

    tar.c({gzip:true, sync:true, file: '/upload/'+backupfile}, [tmpdir]);
    Progress = 3;
    childProcess.spawnSync('rm', ['-fr', tmpdir]);
}