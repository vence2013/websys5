/* 
 * 文件名称 ： Relations.js
 * 功能说明 ： 
 *      Relations of models.
 * 
 * 创建日期 ： 2019/2/7
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/7    - created.
 */

exports.link = async (models)=>{
    models['Category'].belongsTo(models['User'], {as: 'owner'});
}