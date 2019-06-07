/****************************************************************************** 
 * 文件名称 ： finance.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/6/6
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/6/6    - 创建文件。
 *****************************************************************************/  

const Sequelize = require('sequelize');
const Op = Sequelize.Op;


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

exports.search = async (ctx, str, page, pageSize)=>{
    const Finance = ctx.models['Finance'];

    var total = await Finance.count({logging:false, where:{'desc':{[Op.like]: '%'+str+'%'}}});
    var maxpage  = Math.ceil(total/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    page = (page>maxpage) ? maxpage : (page<1 ? 1 : page);

    var offset = (page - 1) * pageSize;
    var ret = await Finance.findAll({logging:false, raw:true, where:{'desc':{[Op.like]: '%'+str+'%'}}, offset:offset, limit:pageSize});
    
    for (var i=0; i<ret.length; i++) { ret[i]['desc'] = ret[i]['desc'].toString(); }
    return {'total':total, 'page':page, 'financelist':ret};
}

exports.detail = async (ctx, financeid)=>{
    const Finance = ctx.models['Finance'];

    var ret = await Finance.findOne({logging:false, raw:true, where:{'id':financeid}});
    ret['desc'] = ret['desc'].toString();
    return ret;
}

exports.draw = async (ctx)=>{
    const Finance = ctx.models['Finance'];

    var ret = await Finance.findAll({logging:false, raw:true, 
        order: [['date', 'DESC'], ['id', 'DESC']], limit:100
    });
    console.log(ret);
    for (var i=0; i<ret.length; i++) { ret[i]['desc'] = ret[i]['desc'].toString(); }
    return ret;
}

exports.pay = async (ctx)=>{
    const FinancePay = ctx.models['FinancePay'];

    var ret = await FinancePay.findAll({logging:false, raw:true});
    for (var i=0; i<ret.length; i++) { ret[i]['desc'] = ret[i]['desc'].toString(); }
    return ret;
}

exports.detailPay = async (ctx, payid)=>{
    const FinancePay = ctx.models['FinancePay'];

    var ret = await FinancePay.findOne({logging:false, raw:true, where:{'id':payid}});
    ret['desc'] = ret['desc'].toString();
    return ret;
}