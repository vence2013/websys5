/* 
 * 文件名称 ： Relations.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/27    - created.
 */

const Sequelize = require('sequelize');

exports.link = async (models, sequelize)=>{
    // 芯片/模块/寄存器/位组的关系
    models['ChipModule'].belongsTo(models['Chip'], {onDelete: 'CASCADE'});
    models['ChipRegister'].belongsTo(models['ChipModule'], {onDelete: 'CASCADE'});    
    models['ChipBit'].belongsTo(models['ChipRegister'], {onDelete: 'CASCADE'}); 

    /* 芯片 - 文档
     * 在关系中描述文档与位组的关系， 通过位组ID列表来描述
     */
    ChipDocument = sequelize.define('ChipDocument', {
        bitgrouplist: Sequelize.STRING
    })
    models['Chip'].belongsToMany(models['Document'], {through: ChipDocument});
    models['Document'].belongsToMany(models['Chip'], {through: ChipDocument});    
    // 芯片模块 - 文档
    ChipModuleDocument = sequelize.define('ChipModuleDocument', {
        bitgrouplist: Sequelize.STRING
    })
    models['ChipModule'].belongsToMany(models['Document'], {through: ChipModuleDocument});
    models['Document'].belongsToMany(models['ChipModule'], {through: ChipModuleDocument});
}