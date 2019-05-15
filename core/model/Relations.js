/* 
 * 文件名称 ： Relations.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/04/03
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/03 - 创建文档
 */

exports.link = async (models)=>{
    models['User'].belongsToMany(models['Group'], {through: 'UserGroup'});
    models['Group'].belongsToMany(models['User'], {through: 'UserGroup'});
}