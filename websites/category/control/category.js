/****************************************************************************** 
 * 文件名称 ： category.js
 * 功能说明 ： 
 *      目录处理
 * 
 * 创建日期 ： 2019/4/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/4/27    - 创建文件。
 *****************************************************************************/  


exports.create = async (ctx, userid, father, name, desc)=>{    
    const Category = ctx.models['Category'];
    
    // 新增节点的父节点只能是：根节点， 自己创建的节点
    if (father) {
        var categoryObj = await Category.findOne({raw:true, logging:false, where:{'id':father}});
        if (!categoryObj || (categoryObj.ownerId!=userid)) return -1;  // 无权在该节点下添加子节点
    }
    var [categoryIns, created] = await Category.findOrCreate({logging:false, 
        where: {'name': name, 'father': father}, defaults: {'desc': desc, 'ownerId':userid}
    });
    return created ? 0 : -2;
}


exports.update = async (ctx, userid, categoryid, name , desc)=>{
    const Category = ctx.models['Category'];
    
    var categoryIns = await Category.findOne({logging: false,
        where: {'id': categoryid, 'ownerId': userid}  // 只能修改自己创建的目录节点
    });
    if (categoryIns) {
        await categoryIns.update({'name': name, 'desc': desc}, {logging: false}); 
    }
    return categoryIns ? true : false;
}

/* 获取某个目录节点的子树数据，并以数组形式给出 */
async function getListByRoot(ctx, rootid) {
    const Category = ctx.models['Category'];

    var list = await Category.findAll({raw: true, logging: false, 
        where: { 'father': rootid} // 只处理树形结构，不管创建者（由调用函数处理）
    });
    for (var i=0; i<list.length; i++) {
        // 将desc从buffer格式转换为字符串
        list[i]['desc'] = list[i]['desc'] ? list[i]['desc'].toString() : '';
        var sub = await getListByRoot(ctx, list[i]['id']);
        list = list.concat(sub);
    }

    return list;
}

exports.delete = async (ctx, userid, categoryid)=>{
    var Category = ctx.models['Category'];
    
    // 当前节点的创建者必须为当前用户，否则无权删除
    var categoryObj = await Category.findOne({raw:true, logging:false, where:{'id':categoryid}});
    if (!categoryObj || (categoryObj.ownerId!=userid)) return;
    
    // 获取所有的子树节点
    var ids = [ categoryid ];
    var list = await getListByRoot(ctx, categoryid);
    for (var i in list) { ids.push(list[i]['id']); }

    await Category.destroy({logging: false, 
        where: {'id': ids, 'ownerId': userid}
    });
}


exports.getTreeByRoot = getTreeByRoot;

/* 
 * Function     : getTreeByRoot
 * Description  : 通过ID获取(具有访问权限的)目录树对象数据。
 * Parameter    : 
 * Return       : 树形结构的目录树对象
 */

async function getTreeByRoot(ctx, userid, rootid) {
    const Category = ctx.models['Category'];

    var brothers = await Category.findAll({raw: true, logging: false, 
        where: {'father': rootid, 'ownerId':userid}
    });
    // 递归查找子树
    for (var i=0; i<brothers.length; i++) { 
        brothers[i]['desc'] = brothers[i]['desc'] ? brothers[i]['desc'].toString() : '';
        brothers[i]['children'] = await getTreeByRoot(ctx, userid, brothers[i]['id']);
    }

    return brothers;
}
