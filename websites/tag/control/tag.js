/****************************************************************************** 
 * 文件名称 ： tag.js
 * 功能说明 ： 标签处理
 * 
 * 创建日期 ： 2019/4/26
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/4/26    - 创建文件。
 *****************************************************************************/ 

const Sequelize = require('sequelize');
const Op = Sequelize.Op;


exports.create = async (ctx, name)=>{
    const Tag = ctx.models['Tag'];

    var [tagIns, created] = await Tag.findOrCreate({logging: false, 
        where: {'name': name}
    });
    return created;
}


exports.delete = async (ctx, id)=>{
    const Tag = ctx.models['Tag'];

    await Tag.destroy({logging: false, 'where': {'id': id}});
}


/* 
 * Function     : search
 * Description  : 搜索标签，并实现分页
 * Parameter    : 
 *   str     - 搜索的字符串
 *   page    - 当前分页
 *   pageSize- 每页显示的记录数量
 *   order   - 排序方式 
 * Return       : {page:, pageMaxium:, total:, taglist:}
 *   page    - 当前页   
 *   maxpage - 最大页数
 *   total   - 记录总数
 *   taglist - 标签列表
 */

exports.search = async (ctx, str, page, pageSize, order)=>{
    const Tag = ctx.models['Tag'];
    var ret = {'total':0, 'page':1, 'pageMaxium':0, 'taglist':[]};

    // 构建搜索条件
    var queryCond = {'raw': true, 'logging': false, 'where': {}};
    if (str) { queryCond['where']['name'] = {[Op.like]: '%'+str+'%'}; }
    // 计算分页数据
    ret['total'] = await Tag.count(queryCond);
    var maxpage = Math.ceil(ret['total']/pageSize);
    maxpage = (maxpage<1) ? 1 : maxpage;
    ret['page'] = (page>maxpage) ? maxpage : (page<1 ? 1 : page);
    ret['pageMaxium'] = maxpage;

    // 查询当前分页的列表数据
    var offset = (ret['page'] - 1) * pageSize;
    queryCond['offset'] = offset;
    queryCond['limit']  = pageSize;
    queryCond['order']  = [order];
    ret['taglist'] = await Tag.findAll(queryCond);

    return ret;
}