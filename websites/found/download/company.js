/****************************************************************************** 
 * 文件名称 ： codes.js
 * 功能说明 ： found
 *      下载公司列表， 公司信息，基金列表
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
var CompanyCodes2 = [];


/* 
 * Function     : CompanyFoundRequest
 * Description  : 获取某个公司的开放基金代码列表
 * 
 * Parameter    : 
 * Return       : 
 */

function CompanyFoundRequest(cCodes, cb)
{
    var cCode = cCodes.shift();
    var url = URLs.founds.replace(/\*/, cCode)
    console.log("DBG["+__filename+"|CompanyFoundRequest()] Request(%d) - %s.", cCodes.length, url);

    Request
    .get({
        'url': url,
        'timeout': 60000,
    }, (err, res, body)=>{
        console.log("DBG["+__filename+"|CompanyFoundRequest()] Response - %s.", url);
        var codes = [];

        if (!err && res.statusCode==200) {
            //console.log("DBG["+__filename+"|CompanyFoundRequest()] Body - %o.", body);
            var $ = cheerio.load(body);            

            $(".third-block").map((i, e)=>{
                if ($(e).find('.tab-title').text() != "开放式基金") return ;

                $(e).find('.code').map((i2, e2)=>{
                    var code = $(e2).text();
                    if (/^\d+$/.test(code)) {
                        codes.push(code);
                    } else {
                        console.log("DBG["+__filename+"|CompanyFoundRequest()] - Unknown founds, code:%s.", code);
                    }                       
                }) 
            })   
            console.log("DBG["+__filename+"|CompanyFoundRequest()] debug - ", codes.length, JSON.stringify(codes), cCodes.length);
        } else {
            RunData['CompanyFoundFailed'] = RunData['CompanyFoundFailed'] ? 1 : (RunData['CompanyFoundFailed']+1);
            console.log("DBG["+__filename+"|CompanyFoundRequest()] Error - err:%o, res:%o, body:%o.", err, res, body);
        }
        // 报错后忽略， 继续处理下一个数据
        if (cb) { cb(codes, cCode, cCodes); } 
    })
}


/* 
 * Function     : CompanyFoundWrapper
 * Description  : 链式处理公司代码数组
 * 
 * Parameter    : 
 * Return       : 
 */

function CompanyFoundWrapper(cCodes)
{
    console.log("DBG["+__filename+"|CompanyFoundWrapper()] - l1, length:%d.", cCodes.length);

    // S3. 获取公司的基金列表
    CompanyFoundRequest(cCodes, (fCodes, cCode, cCodes2)=>{
        //console.log("DBG["+__filename+"|CompanyFoundWrapper()] - l2, fCodes:%o, companyCode:%d, companyCodes:%o", fCodes, cCode, cCodes2);

        function nextProcess() {
            if (cCodes2.length) { // 下一个公司代码
                setTimeout(()=>{ CompanyFoundWrapper(cCodes2); }, 300);
            } else {
                console.log("Company Codes & Info, Found Codes Update Finished! RunData:%o", RunData);
                process.exit(0);                
            }
        }

        // 将基金代码添加到数据库
        if (fCodes.length) {
            const Found = DBConn.model['Found'];
            const start = Date.now();
            bulkFoundCode(fCodes);

            function bulkFoundCode(list)
            {
                var codeObjs = [];
                for (var i=0; (i<100)&&list.length; i++) {
                    var x = list.shift();
                    codeObjs.push({'code': x, 'FoundCompanyCode': cCode});
                }
                
                Found
                .bulkCreate(codeObjs, {logging: false})
                .then(()=>{
                    if (list.length) { bulkFoundCode(list); }
                    else {
                        const ms = Date.now() - start;
                        console.log("DBG["+__filename+"|CompanyFoundWrapper()] - l3, ms:%d.", ms);
                        nextProcess();
                    }
                })
            }
        } else {
            nextProcess();
        }
    });
}


/* 
 * Function     : CompanyInfoRequest
 * Description  : 获取公司代码数组中第1个元素的公司信息。
 * 
 * Parameter    : 
 * Return       : 
 */

function CompanyInfoRequest(cCodes, cb)
{
    var cCode = cCodes.shift();
    var url = URLs.companyInfo.replace(/\*/, cCode)    
    console.log("DBG["+__filename+"|CompanyInfoRequest()] Request(%d) - %s.", cCodes.length, url);

    Request
    .get({
        'url': url,
        'timeout': 60000,
    }, (err, res, body)=>{
        console.log("DBG["+__filename+"|CompanyInfoRequest()] Response - %s.", url);
        var info = null;

        if (!err && res.statusCode==200) {
            //console.log("DBG[entry.js|CompanyInfoRequest()] Body - %o.", body);            
            var $ = cheerio.load(body);

            info = {};
            $(".company-info").find(".category-item").map((i, e)=>{
                $(e).find('.category-name').map((i2, e2)=>{
                    var name  = $(e2).text();
                    var value = $(e).find('.category-value').eq(i2).text();
                    //console.log("DBG["+__filename+"|CompanyInfoRequest()] debug - ", name, value);
                    switch(name) {
                    case "法定名称": info['name'] = value; break;
                    case "公司属性": info['attr'] = value; break;
                    case "成立日期": info['createDate']  = value; break;
                    case "注册资本": 
                        var ret = value.match(/[0-9\.]+/);
                        if (ret) { info['createMoney'] = parseFloat(ret[0]); }
                        break;
                    case "管理规模": 
                        var ret = value.match(/[0-9\.]+/);
                        if (ret) { info['moneyTotal']  = parseFloat(ret[0]); }
                        break;
                    case "基金数量": 
                        var ret = value.match(/\d+/);
                        if (ret) { info['foundTotal']  = parseInt(ret[0]); }
                        break;
                    case "经理人数": 
                        var ret = value.match(/\d+/);
                        if (ret) { info['managerTotal']  = parseInt(ret[0]); }                    
                        break;
                    }
                })                
            })
            console.log("DBG["+__filename+"|CompanyInfoRequest()] debug - ", JSON.stringify(info));
        } else {
            RunData['CompanyInfoFailed'] = RunData['CompanyInfoFailed'] ? 1 : (RunData['CompanyInfoFailed']+1);
            console.log("DBG["+__filename+"|CompanyInfoRequest()] Error - err:%o, res:%o, body:%o.", err, res, body);
        }

        if (cb) { cb(info, cCode, cCodes); }  
    })
}


/* 
 * Function     : CompanyInfoWrapper
 * Description  : 将公司代码数据进行链式处理
 * 
 * Parameter    : 
 * Return       : 
 */

function CompanyInfoWrapper(cCodes)
{
    console.log("DBG["+__filename+"|CompanyInfoWrapper()] - l1, length:%d.", cCodes.length);

    // S2. 获取公司的详细信息
    CompanyInfoRequest(cCodes, (info, cCode, cCodes2)=>{
        function nextProcess() {
            if (cCodes.length) { // 使用setTimeout断开递归调用
                setTimeout(()=>{ CompanyInfoWrapper(cCodes2); }, 300);
            } else { // S3. 获取公司的基金列表
                CompanyFoundWrapper(CompanyCodes2);
            } 
        }

        // 将公司信息添加到数据库
        if (info) {
            const FoundCompany = DBConn.model['FoundCompany'];

            FoundCompany.findOne({logging: false,
                'where': {'code': cCode}
            })
            .then((res)=>{
                res.update({'name': info.name, 'attr': info.attr, 'createDate': info.createDate,
                    'createMoney': info.createMoney, 'foundTotal': info.foundTotal, 'moneyTotal': info.moneyTotal, 
                    'managerTotal': info.managerTotal}, {logging: false});
            })
            .then(nextProcess);
        } else {
            // 如果数据无效则忽略， 继续处理下一个数据
            nextProcess();
        }    
    });
}


/* 
 * Function     : CompanyRequest
 * Description  : 获取公司代码列表
 * 
 * Parameter    : 
 * Return       : 
 */

function CompanyRequest(cb) 
{
    var url = URLs.companys;
    console.log("DBG["+__filename+"|CompanyRequest()] Request - %s.", url);

    Request
    .get({
        'url': url,
        'timeout': 60000,
    }, (err, res, body)=>{
        console.log("DBG["+__filename+"|CompanyRequest()] Response - %s.", url);
        var codes = [];

        if (!err && res.statusCode==200) {
            //console.log("DBG["+__filename+"|CompanyRequest()] Body - %o.", body);            
            var $ = cheerio.load(body);

            var list = $(".sencond-block").find('a');
            list.map((i, e)=>{
                var href = $(e).attr('href');
                if (href.length > 0) {
                    var code = href.match(/\/(\d+)\.html/g);
                    if (code.length) { codes.push(code[0].substr(1, 8)); }
                }
            })   
            console.log("DBG["+__filename+"|CompanyRequest()] debug - ", codes.length, JSON.stringify(codes));              
        } else {
            console.log("DBG["+__filename+"|CompanyRequest()] Error - err:%o, res:%o, body:%o.", err, res, body);
        }

        RunData['CompanyCount'] = codes.length;
        if (cb) { cb(codes); }   
    })
}


/* 
 * Function     : CompanyWrapper
 * Description  : 重新获取所有数据
 * 
 * Parameter    : 
 * Return       : 
 */

function CompanyWrapper()
{
    var sql = ["DELETE FROM `Founds`;", "DELETE FROM `FoundCompanies`;", "DELETE FROM `FoundValues`;"];

    DBConn.db.query(sql[0])
    .then(async ()=>{ return DBConn.db.query(sql[1]); })
    .then(async ()=>{ return DBConn.db.query(sql[2]); })
    .then(()=>{
        console.log("DBG["+__filename+"|CompanyWrapper()] - database cleaned.");
        // S1. 获取公司代码
        CompanyRequest(async (cCodes)=>{
            // 将公司代码添加到数据库
            const FoundCompany = DBConn.model['FoundCompany'];

            // 因为公司数量不多， 所以一次性添加
            var companyObjs = cCodes.map((x)=>{ 
                CompanyCodes2.push(x); // 获取基金列表需要使用
                return {'code': x}; 
            });
            
            FoundCompany
            .bulkCreate(companyObjs, {logging: false})
            .then(()=>{
                CompanyInfoWrapper(cCodes);
            });
        })
    })
}


/******************************************************************************
 * 下载任务
 *****************************************************************************/

RunData['start'] = Library.dateFormat("yyyy-MM-dd hh:mm:ss", new Date());
console.log("DBG["+__filename+"] - code.");

Library.dbConnect((conn)=>{
    DBConn = conn;

    CompanyWrapper();
});