/* 
 * 文件名称 ： Relations.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/2/9
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/9    - created.
 */

exports.link = async (models)=>{
    // 文件 - 标签
    models['File'].belongsToMany(models['Tag'], {through: 'FileTag'});
    models['Tag'].belongsToMany(models['File'], {through: 'FileTag'});
}