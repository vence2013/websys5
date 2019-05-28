/****************************************************************************** 
 * 文件名称 ： ChipModuleDocument.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/5/28
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/28    - 创建文件。
 *****************************************************************************/ 

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('ChipModuleDocument', {
        bitgrouplist: {
            type: DataTypes.STRING,
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}