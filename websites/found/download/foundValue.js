/****************************************************************************** 
 * 文件名称 ： foundValue.js
 * 功能说明 ： found
 *      下载基金净值数据
 * 
 * 说明： 该文件在容器内的终端运行。
 * 
 * 创建日期 ： 2019/2/21
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/21    - 创建文件。
 *****************************************************************************/ 

const cheerio = require('cheerio');
const Request = require('request');
const Library = require('./library');
const URLs    = require("./urls");


/******************************************************************************
 * 全局变量
 *****************************************************************************/

var DBConn, RunData = {};


/* 
 * Function     : FoundValueRequest
 * Description  : 净值的访问需要模拟referer参数。
 * 
 * Parameter    : 
 * Return       : 
 */

function FoundValueRequest(fCodes, cb)
{
    var fCode = fCodes.shift();
    var url = URLs.foundValue.replace(/\*/, fCode);
    console.log("DBG["+__filename+"|FoundValueRequest()] Request(%d) - %s.", fCodes.length, url);    

    Request
    .get({
        'url': url, 
        timeout: 60000,
        headers: {
            'referer': 'http://fundf10.eastmoney.com'
        }
    }, (err, res, body)=>{
        console.log("DBG["+__filename+"|FoundValueRequest()] Response - %s.", url);
        var data = null;

        if (!err && res.statusCode==200) {
            //console.log("DBG["+__filename+"|FoundValueRequest()] Body - %o.", body);        
            data = JSON.parse(body);                      
        }  else {
            RunData['FoundValueFailed'] = RunData['FoundValueFailed'] ? 1 : (RunData['FoundValueFailed']+1);
            console.log("DBG["+__filename+"|FoundValueRequest()] Error - err:%o, res:%o, body:%o.", err, res, body);
        }   
        
        if (cb) { cb(data, fCode, fCodes); }  
    })
}


/* 
 * Function     : FoundValueWrapper
 * Description  : 
 * 
 * Parameter    : 
 * Return       : 
 */

function FoundValueWrapper(foundCodes)
{
    FoundValueRequest(foundCodes, async (data, foundCode, foundCodes)=>{
        function nextProcess() {
            if (foundCodes.length) { // 下一个公司代码
                setTimeout(()=>{ FoundValueWrapper(foundCodes); }, 1000);
            } else { // S6. 结束
                console.log("Found Value Update Finished! RunData:%o", RunData);
                process.exit(0);
            }   
        }

        // 将净值数据加入数据库
        if (data && data.Data && data.Data.LSJZList && data.Data.LSJZList.length) {
            const FoundValue = DBConn.model['FoundValue'];            

            var list = data.Data.LSJZList;
            console.log("DBG["+__filename+"|FoundValueWrapper()] - l2, length:%d.", list.length);
            RunData['FoundValueTotal'] = RunData['FoundValueTotal'] ? list.length : (RunData['FoundValueTotal']+list.length);
            const start = Date.now();
            bulkFoundValue(list);

            /* 方法描述：
             *     使用批量添加的方法，将数据分为几次处理。
             * 该方法使用批量创建的方法，假设获取净值数据前已经清空了数据表。
             * 
             */            
            function bulkFoundValue(list) {
                var valueObjs = [];
                for (var i=0; (i<1000)&&list.length; i++) {
                    var x = list.shift();
                    var value = x.DWJZ ? x.DWJZ : 0;
                    var value2 = x.LJJZ ? x.LJJZ : 0;
                    var value3 = x.JZZZL ? x.JZZZL : 0;
                    valueObjs.push({'FoundCode': foundCode, 'date': x.FSRQ, 'value': value, 'value2': value2, 'value3': value3});
                }

                FoundValue
                .bulkCreate(valueObjs, {logging: false})
                .then(()=>{ 
                    if (list.length) { bulkFoundValue(list); }
                    else {
                        const ms = Date.now() - start;
                        console.log("DBG["+__filename+"|FoundValueWrapper()] - l3, ms:%d.", ms);
                        nextProcess();
                    }
                });
            }
        } else {
            nextProcess();
        }         
    });
}


/* 
 * Function     : FoundCodesWithCleanValueWrapper
 * Description  : 删除基金净值数据,然后获取基金代码后，调用回调函数。
 * 
 * Parameter    : 
 * Return       : 
 */

function FoundCodesWithCleanValueWrapper(cb)
{
    const Found = DBConn.model['Found'];
    const sql = "DELETE FROM `FoundValues`;";
    
    DBConn.db.query(sql)
    .then(()=>{
        // 从数据库获取所有基金代码
        Found.findAll({logging: false,
            attributes: ['code'], raw: true
        })
        .then((res)=>{
            //console.log("DBG["+__filename+"|CompanyFoundWrapper()] - l3, res.length:%d, res:%o.", res.length, res);
            RunData['FoundTotal'] = res.length;
            var fCodes = res.map((x)=>{ return x.code; });
            if (cb) { cb(fCodes); }
        });
    });
}


/******************************************************************************
 * 下载任务
 *****************************************************************************/

RunData['start'] = Library.dateFormat("yyyy-MM-dd hh:mm:ss", new Date());
console.log("DBG["+__filename+"] - found value.");

Library.dbConnect((conn)=>{
    DBConn = conn;

    FoundCodesWithCleanValueWrapper(FoundValueWrapper);
});