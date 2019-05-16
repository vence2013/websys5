/****************************************************************************** 
 * 文件名称 ： found.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/13
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/13    - 创建文件。
 *****************************************************************************/  

exports.getCompany = async (ctx, code)=>{
    const FoundCompany = ctx.models['FoundCompany'];

    return await FoundCompany.findOne({raw:true, logging: false,
        where: { 'code': code}
    });
}

exports.getFound = async (ctx, code)=>{
    const Found = ctx.models['Found'];

    return await Found.findOne({raw:true, logging: false,
        where: { 'code': code}
    });
}

exports.getStatistics = async (ctx, code)=>{
    const FoundStatistics = ctx.models['FoundStatistics'];

    return await FoundStatistics.findOne({raw:true, logging: false,
        where: { 'code': code}
    });
}