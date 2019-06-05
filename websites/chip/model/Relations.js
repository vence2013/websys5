/* 
 * 文件名称 ： Relations.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/27    - created.
 */


exports.link = async (models)=>{
    // 芯片/模块/寄存器/位组的关系
    models['ChipModule'].belongsTo(models['Chip'], {onDelete: 'CASCADE'});
    models['ChipRegister'].belongsTo(models['ChipModule'], {onDelete: 'CASCADE'});    
    models['ChipBit'].belongsTo(models['ChipRegister'], {onDelete: 'CASCADE'}); 

    // 文档必然属于某个芯片
    models['Chip'].hasMany(models['ChipDocument']);
    // 文档和芯片模块是多对多的关系
    models['ChipDocument'].belongsToMany(models['ChipModule'], {through: 'ChipDocumentModule'});
    models['ChipModule'].belongsToMany(models['ChipDocument'], {through: 'ChipDocumentModule'});   
}