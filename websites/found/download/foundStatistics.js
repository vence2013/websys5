/****************************************************************************** 
 * 文件名称 ： foundStatistics.js
 * 功能说明 ： found
 *      下载基金统计数据。
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
 * Function     : CompanyRequest
 * Description  : 获取公司代码列表
 * 
 * Parameter    : 
 * Return       : 
 */

function FoundStatisticsRequest(cb) 
{
    var url = URLs.foundStatistics+Math.random();
    console.log("DBG["+__filename+"|FoundStatisticsRequest()] Request - %s.", url);

    Request
    .get({
        'url': url,
        'timeout': 60000,
    }, (err, res, body)=>{
        console.log("DBG["+__filename+"|CompanyRequest()] Response - %s.", url);
        var codes = null;

        if (!err && res.statusCode==200) {
            //console.log("DBG["+__filename+"|CompanyRequest()] Body - %o.", body);
            eval(body);
            //console.log("DBG["+__filename+"|CompanyRequest()] - l1, rankData:%o.", rankData);
            codes = rankData.datas;
        } else {
            console.log("DBG["+__filename+"|CompanyRequest()] Error - err:%o, res:%o, body:%o.", err, res, body);
        }

        if (cb) { cb(codes); }   
    })
}


/* 
 * Function     : FoundStatisticsWrapper
 * Description  : 重新获取统计数据
 * 
 * Parameter    : 
 * Return       : 
 */

function FoundStatisticsWrapper()
{
    var sql = "DELETE FROM `FoundStatistics`;";

    DBConn.db
    .query(sql)
    .then(()=>{
        console.log("DBG["+__filename+"|FoundStatisticsWrapper()] - found statistics cleaned.");
        // 获取基金统计信息
        FoundStatisticsRequest(async (infos)=>{
            //console.log("DBG["+__filename+" | FoundStatisticsWrapper()] - l1, infos:%o.", infos);
            RunData['FoundTotal'] = infos.length;

            if (infos.length) {
                // 将公司代码添加到数据库
                const FoundStatistics = DBConn.model['FoundStatistics'];

                bulkFoundStatistics(infos);

                /* 方法描述：
                *     使用批量添加的方法，将数据分为几次处理。
                * 该方法使用批量创建的方法，假设获取净值数据前已经清空了数据表。
                * 
                */            
                function bulkFoundStatistics(list) {
                    var valueObjs = [];
                    for (var i=0; (i<1000)&&list.length; i++) {
                        var x = list.shift();
                        var arr = x.split(',');
        
                        var lastWeek   = arr[7] ? arr[7] : null;
                        var lastMonth  = arr[8] ? arr[8] : null;
                        var lastQuarter  = arr[9] ? arr[9] : null;
                        var lastHalfYear = arr[10] ? arr[10] : null;
                        var last1Year  = arr[11] ? arr[11] : null;
                        var last2Year  = arr[12] ? arr[12] : null;
                        var last3Year  = arr[13] ? arr[13] : null;
                        var thisYear   = arr[14] ? arr[14] : null;
                        var fromCreate = arr[15] ? arr[15] : null;
                        var obj = {'code':arr[0], 'lastWeek':lastWeek, 'lastMonth':lastMonth, 'lastQuarter':lastQuarter, 'lastHalfYear':lastHalfYear, 
                            'last1Year':last1Year, 'last2Year':last2Year, 'last3Year':last3Year, 'thisYear': thisYear, 'fromCreate':fromCreate};
                        //console.log("DBG["+__filename+"|CompanyRequest()] - l1, arr:%o, obj:%o.", arr, obj);
                        valueObjs.push(obj);
                    }
                    
                    FoundStatistics
                    .bulkCreate(valueObjs, {logging: false})
                    .then(()=>{ 
                        if (list.length) { bulkFoundStatistics(list); }
                        else {
                            console.log("Found Statistics Update Finished! RunData:%o", RunData);
                            process.exit(0);  
                        }
                    });
                }  
            }
        })
    })
}


/******************************************************************************
 * 下载任务
 *****************************************************************************/

RunData['start'] = Library.dateFormat("yyyy-MM-dd hh:mm:ss", new Date());
console.log("DBG["+__filename+"] - found statistics.");

Library.dbConnect((conn)=>{
    DBConn = conn;

    FoundStatisticsWrapper();
});