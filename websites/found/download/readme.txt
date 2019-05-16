因为数据量太大， 一次下载所有数据容器引起错误而下载失败， 所以各个部分的数据分开下载。
将各个部分的下载功能组织到单个文件中便于维护。

分为以下部分：
1. 公司代码和基金代码的下载， 这部分包括了公司信息的下载; (codes.js)
2. 基金信息的下载（因为基金数量多，所以都单独下载）
    2.1 基础信息; (found.js)
    2.2 净值数据; (foundValue.js)
    2.3 统计数据; (foundStatistics.js)

数据抓起程序在download/中， 这组软件具有以下依赖：
1. 配置文件.env， 用于获取数据库配置参数(检查library.js中的.env路径是否正确)
2. 网站地址配置文件urls.js，格式为:
~~~
module.exports = {
    "companys": "http://x",
    "companyInfo":, "founds":, "foundInfo":,"foundValue":, "foundStatistics":,
}
~~~

下载数据使用以下过程：
在容器内部(才能使用数据库)， 切换到download/路径执行命令。
1. 下载公司及基金代码数据， node codes.js 
2. 下载基金基本信息，      node found.js
3. 下载基金净值数据，      node foundValue.js
4. 下载基金统计数据，      node foundStatistics.js