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
    models['Document'].belongsTo(models['User'], {as: 'owner'});

    // 文档 - 标签
    models['Document'].belongsToMany(models['Tag'], {through: 'DocumentTag'});
    models['Tag'].belongsToMany(models['Document'], {through: 'DocumentTag'});
    // 文档 - 目录
    models['Document'].belongsToMany(models['Category'], {through: 'DocumentCategory'});
    models['Category'].belongsToMany(models['Document'], {through: 'DocumentCategory'});    
}