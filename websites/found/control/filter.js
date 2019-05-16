/****************************************************************************** 
 * 文件名称 ： filter.js
 * 功能说明 ： found
 * 
 * 创建日期 ： 2019/5/13
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/13    - 创建文件。
 *****************************************************************************/ 

const Sequelize = require('sequelize');
const Op = Sequelize.Op; 


/* 更新指定名称的过滤器 */
exports.update = async (ctx, name, filter)=>{
    const FoundFilter = ctx.models['FoundFilter'];

    // 查询该名称的过滤器
    var filterObj = await FoundFilter.findOne({raw: true, logging: false,
        where: {'father': 0, 'name': 'name', 'value': name}
    });
    if (filterObj) {
        var id = filterObj.id;
        // 删除该过滤器数据
        await FoundFilter.destroy({logging: false,
            where: {[Op.or]: [{'id': id}, {'father': id}]}
        })
    }
    // 创建过滤器名称
    var [itemIns, created] = await FoundFilter.findOrCreate({logging:false, 
        where: {'father': 0, 'name': 'name', 'value': name}
    })
    var itemObj = itemIns.get({plain: true});

    // 创建该过滤器的数据项
    var items = [];
    for (x in filter) {
        if (filter[x]) items.push({'father':itemObj.id, 'name':x, 'value':filter[x]});
    }
    await FoundFilter.bulkCreate(items, {logging:false});
}

exports.delete = async (ctx, id)=>{
    const FoundFilter = ctx.models['FoundFilter'];

    await FoundFilter.destroy({logging: false,
        where: {[Op.or]: [{'id': id}, {'father': id}]}
    });
}

/* 获取过滤器参数，包括名称 */
exports.getById = async (ctx, id)=>{
    const FoundFilter = ctx.models['FoundFilter'];

    var objs = await FoundFilter.findAll({raw: true, logging: false,
        where: {[Op.or]: [{'id': id}, {'father': id}]}
    });

    var filter = {};
    objs.map((x)=>{
        if (x.id == id) {
            filter['name'] = x.value;
        } else {
            filter[x.name] = x.value;
        }
    });

    return filter;
}

/* 获取过滤器列表，只有名称 */
exports.get = async (ctx)=>{
    const FoundFilter = ctx.models['FoundFilter'];

    // 查询该名称的过滤器
    return await FoundFilter.findAll({raw: true, logging: false,
        attributes: ['id', 'value'],
        where: {'father': 0, 'name': 'name'}
    });
}

/* 根据过滤条件筛选符合的基金公司和基金
 * 筛选条件包括：'companyCreate', 'companyMoney', 'companyManager', 'foundCreate', 'foundMoney', 'foundShare', 
 *      'statisticWeek', 'statisticMonth', 'statisticQuarter', 'statisitcHalfyear', 'statistic1year', 'statistic2year', 'statistic3year', 
 *      'statisticThisyear', 'statisticCreate', 'valueMin', 'valueMinGT', 'valueMinLT', 'valueMax', 'valueMaxGT', 'valueMaxLT'
 * 筛选顺序的说明： 将越简单的放在前面， 在更小的范围内筛选，效率更高
 */
exports.apply = async (ctx, query)=>{
    const Found = ctx.models['Found'];
    const FoundCompany = ctx.models['FoundCompany'];
    const FoundValue   = ctx.models['FoundValue'];
    const FoundStatistics = ctx.models['FoundStatistics'];
    var whereCondition;
    
    // 筛选符合条件的基金公司
    whereCondition = {};
    if (query.companyCreate) whereCondition['createDate'] = {[Op.lte]:query.companyCreate+'-01-01'};
    if (query.companyMoney)  whereCondition['moneyTotal']   = {[Op.gte]:query.companyMoney};
    if (query.companyManager)  whereCondition['managerTotal']   = {[Op.gte]:query.companyManager};
    var companyObjs = await FoundCompany.findAll({raw: true, logging: false, 
        attributes: ['code', 'name'], where:whereCondition
    });
    var companyCodes = companyObjs.map((x)=>{ return x.code; });

    // 筛选符合条件的基金(在符合条件公司的基金中)
    whereCondition = {'companyId': companyCodes};
    if (query.foundCreate)     { whereCondition['createDate']   = {[Op.lte]:query.foundCreate+'-01-01'}; }
    if (query.foundMoney)   { whereCondition['moneyUpdate']   = {[Op.gte]: query.foundMoney}; }
    if (query.foundShare) { whereCondition['shareUpdate'] = {[Op.gte]: query.foundShare}; }
    var foundObjs = await Found.findAll({raw:true, logging:false, 
        attributes: ['code'], where: whereCondition
    });
    var foundCodes = foundObjs.map((x)=>{ return x.code; });
    
    // 筛选符合基金的统计信息(在符合基金条件的基金中)
    whereCondition = {};
    if (query.statisticWeek) { whereCondition['lastWeek'] = {[Op.gte]: query.statisticWeek}; }
    if (query.statisticMonth) { whereCondition['lastMonth'] = {[Op.gte]: query.statisticMonth}; }
    if (query.statisticQuarter) { whereCondition['lastQuarter'] = {[Op.gte]: query.statisticQuarter}; }
    if (query.statisitcHalfyear) { whereCondition['lastHalfYear'] = {[Op.gte]: query.statisitcHalfyear}; }
    if (query.statistic1year) { whereCondition['last1Year'] = {[Op.gte]: query.statistic1year}; }
    if (query.statistic2year) { whereCondition['last2Year'] = {[Op.gte]: query.statistic2year}; }
    if (query.statistic3year) { whereCondition['last3Year'] = {[Op.gte]: query.statistic3year}; }
    if (query.statisticThisyear) { whereCondition['thisYear'] = {[Op.gte]: query.statisticThisyear}; }
    if (query.statisticCreate) { whereCondition['fromCreate'] = {[Op.gte]: query.statisticCreate}; }
    if (JSON.stringify(whereCondition)!="{}") {
        whereCondition['code'] = foundCodes;
        var statisticsObj = await FoundStatistics.findAll({raw: true, //logging: false, 
            attributes: ['code'], where: whereCondition
        });
        foundCodes = statisticsObj.map((x)=>{ return x.code; });
    }
    
    // 通过基金净值中的增长率筛选， 统计增长率小于valueMin，且次数大于valueMinGT，小于valueMinLT
    // 查询小于的值时， 没有就不会有结果，所以查找有的结果后，从以前的基金列表中删除就可以了。
    if (query.valueMin && (query.valueMinGT || query.valueMinLT)) {
        var havingSub;

        if (query.valueMinGT && query.valueMinLT) {
            havingSub = Sequelize.literal(`count(code)>=${query.valueMinGT} AND count(code)<=${query.valueMinLT}`);
        } else if (query.valueMinGT) {
            havingSub = Sequelize.literal(`count(code)>=${query.valueMinGT}`);
        } else {
            havingSub = Sequelize.literal(`count(code)<=${query.valueMinLT}`);
        }
        var valueObj2 = await FoundValue.findAll({raw: true, logging: false, 
            attributes: ['code'],
            group: 'code',
            having: havingSub,
            where: {
                "value3": {[Op.gte]: query.valueMin},
                'code': foundCodes,
            },        
        });

        foundCodes = valueObj2.map((x)=>{ return x.code; });
    }

    if (query.valueMax && (query.valueMaxGT || query.valueMaxLT)) {
        var havingSub;

        if (query.valueMaxGT && query.valueMaxLT) {
            havingSub = Sequelize.literal(`count(code)>=${query.valueMaxGT} AND count(code)<=${query.valueMinLT}`);
        } else if (query.valueMaxGT) {
            havingSub = Sequelize.literal(`count(code)>=${query.valueMaxGT}`);
        } else {
            havingSub = Sequelize.literal(`count(code)<=${query.valueMaxLT}`);
        }
        var valueObj2 = await FoundValue.findAll({raw: true, logging: false, 
            attributes: ['code'],
            group: 'code',
            having: havingSub,
            where: {
                "value3": {[Op.lte]: query.valueMax},
                'code': foundCodes,
            },
        });

        foundCodes = valueObj2.map((x)=>{ return x.code; });
    }

    // 获取符合条件基金的信息
    var foundObj2 = await Found.findAll({raw: true, logging: false, 
        attributes: ['code', 'companyId', 'fullname'],
        where: { 'code': foundCodes }
    });
    var companyCodes2 = foundObj2.map((x)=>{ return x.companyId; });
    var companyObj2 = await FoundCompany.findAll({raw: true, logging: false, 
        attributes: ['code', 'name'], where:{'code':companyCodes2}
    });

    return {'companylist': companyObj2, 'foundlist': foundObj2};
}