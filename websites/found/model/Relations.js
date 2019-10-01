/* 
 * 文件名称 ： Relations.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/12
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/12    - created.
 */

exports.link = async (models)=>{
    models['Found'].belongsTo(models['FoundCompany'], {through: 'companyCode'});
    models['FoundValue'].belongsTo(models['Found'], {through: 'foundCode'});
    models['FoundStatistics'].belongsTo(models['Found'], {through: 'foundCode'});
}