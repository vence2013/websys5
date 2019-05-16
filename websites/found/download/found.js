/****************************************************************************** 
 * 文件名称 ： found.js
 * 功能说明 ： found
 *      下载基金信息数据
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
 * Function     : FoundInfoRequest
 * Description  : 获取解决信息数据
 * 
 * Parameter    : 
 * Return       : 
 */

function FoundInfoRequest(fCodes, cb)
{
    var fCode = fCodes.shift();
    var url = URLs.foundInfo.replace(/\*/, fCode);
    console.log("DBG["+__filename+"|FoundInfoRequest()] Request(%d) - %s.", fCodes.length, url);

    Request
    .get({
        'url': url, 
        'timeout': 60000
    }, (err, res, body)=>{
        console.log("DBG["+__filename+"|FoundInfoRequest()] Response - %s.", url);
        var info = null;

        if (!err && res.statusCode==200) {
            //console.log("DBG[entry.js|FoundInfoRequest()] Body - %o.", body);            
            var $ = cheerio.load(body);            

            info = {};
            $(".txt_in").find('th').map((i, e)=>{
                var name = $(e).text();
                var value = $(".txt_in").find('td').eq(i).text();
                //console.log("DBG[entry.js|FoundInfoRequest()] debug - ", i, name, value);

                switch (name) {
                case "基金全称": info['fullname'] = value; break;
                case "基金类型": info['type'] = value; break;
                case "成立日期/规模": 
                    var arr = value.split('/');
                    if (arr && (arr.length>=2)) {
                        var ret = arr[1].match(/[\d\.]+/);
                        info['shareCreateDate']  = arr[0].replace(/[^\d]*(\d+)[^\d]*(\d+)[^\d]*(\d+).*/, '$1-$2-$3');
                        if (ret) { info['shareCreate'] = parseFloat(ret[0]); }
                    }                
                    break;
                case "资产规模": 
                    var arr = value.split('（');
                    if (arr && (arr.length>=2)) {
                        var ret = arr[0].match(/[\d\.]+/);
                        if (ret) { info['moneyUpdate'] =  parseFloat(ret[0]); }
                        info['moneyUpdateDate'] = arr[1].replace(/[^\d]*(\d+)[^\d]*(\d+)[^\d]*(\d+).*/, '$1-$2-$3');                        
                    }
                    break;
                case "份额规模":
                    var arr = value.split('（');
                    if (arr && (arr.length>=2)) {
                        var ret = arr[0].match(/[\d\.]+/);
                        if (ret) { info['shareUpdate'] =  parseFloat(ret[0]); }                    
                        info['shareUpdateDate'] = arr[1].replace(/[^\d]*(\d+)[^\d]*(\d+)[^\d]*(\d+).*/, '$1-$2-$3');                           
                    }                 
                    break;
                }
            })
            console.log("DBG["+__filename+"|FoundInfoRequest()] debug - ", JSON.stringify(info));              
        } else {
            RunData['FoundInfoFailed'] = RunData['FoundInfoFailed'] ? 1 : (RunData['FoundInfoFailed']+1);
            console.log("DBG["+__filename+"|FoundInfoRequest()] Error - err:%o, res:%o, body:%o.", err, res, body);
        }
        // 报错后忽略， 继续处理下一个数据
        if (cb) { cb(info, fCode, fCodes); } 
    })  
}


/* 
 * Function     : FoundInfoWrapper
 * Description  : 链式处理公司代码数组
 * 
 * Parameter    : 
 * Return       : 
 */

function FoundInfoWrapper(fCodes)
{
    // S4. 获取基金的详细信息
    FoundInfoRequest(fCodes, (info, foundCode, fCodes2)=>{
        //console.log("DBG["+__filename+"|FoundInfoWrapper()] - l1, info:%o, foundCode:%d, fCodes2:%o", info, foundCode, fCodes2);

        function nextProcess() {
            if (fCodes.length) { // 下一个公司代码
                setTimeout(()=>{ FoundInfoWrapper(fCodes2); }, 300);
            } else { // S5. 获取基金的净值数据
                console.log("Found Info Update Finished! RunData:%o", RunData);
                process.exit(0);
            }   
        }

        // 将基金信息添加到数据库
        if (info) {
            const Found = DBConn.model['Found'];

            Found.findOne({logging: false,
                'where': {'code': foundCode}
            })
            .then(async (foundIns)=>{
                return foundIns.update({'fullname': info.fullname, 'type': info.type, 'createDate': info.shareCreateDate,
                    'createShare': info.shareCreate, 'moneyUpdate': info.moneyUpdate, 'moneyUpdateDate': info.moneyUpdateDate, 
                    'shareUpdate': info.shareUpdate, 'shareUpdateDate': info.shareUpdateDate}, {logging: false});
            })
            .then(nextProcess);
        } else {
            nextProcess();
        }      
    });
}


/* 
 * Function     : FoundCodesWrapper
 * Description  : 获取基金代码后调用回调函数。
 * 
 * Parameter    : 
 * Return       : 
 */

function FoundCodesWrapper(cb)
{
    const Found = DBConn.model['Found'];

    // 从数据库获取所有基金代码
    Found.findAll({logging: false,
        attributes: ['code'], raw: true
    })
    .then((res)=>{
        //console.log("DBG["+__filename+"|CompanyFoundWrapper()] - l3, res.length:%d, res:%o.", res.length, res);
        RunData['FoundCount'] = res.length;
        var fCodes = res.map((x)=>{ return x.code; });
        if (cb) { cb(fCodes); }
    });
}


/******************************************************************************
 * 下载任务
 *****************************************************************************/

RunData['start'] = Library.dateFormat("yyyy-MM-dd hh:mm:ss", new Date());
console.log("DBG["+__filename+"] - found.");

Library.dbConnect((conn)=>{
    DBConn = conn;

    FoundCodesWrapper(FoundInfoWrapper);
});