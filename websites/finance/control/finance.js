/****************************************************************************** 
 * 文件名称 ： finance.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/6/6
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/6/6    - 创建文件。
 *****************************************************************************/  

exports.create = async (ctx, money, date, desc, type)=>{
    const Finance = ctx.models['Finance'];
    const FinancePay = ctx.models['FinancePay'];

    if (type=='payFixed') {
        var [fpIns, created] = await FinancePay.findOrCreate({logging:false, 
            where: {'money':money, 'desc':desc}
        });
    } else if (type=='property') {
        var [fIns, created] = await Finance.findOrCreate({logging:false, 
            where: {'total':money, 'money':0, 'date':date, 'type':type, 'desc':desc}
        });
    } else {
        // 查找最后一次的总金额， 根据新的项目计算新的总金额
        var financeObjs = await Finance.findAll({logging:false, raw:true, order: [['date', 'DESC'], ['id', 'DESC']], limit:1});
        var total = financeObjs.length ? parseInt(financeObjs[0].total) : 0;
        total = (type=='get') ? (total+money) : (total-money);
        var [fIns, created] = await Finance.findOrCreate({logging:false, 
            where: {'total':total, 'money':money, 'date':date, 'type':type, 'desc':desc}
        });
    }
    return created ? 0 : -1;
}