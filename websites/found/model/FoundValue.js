/****************************************************************************** 
 * 文件名称 ： FoundValue.js
 * 功能说明 ： 基金净值
 * 
 * 创建日期 ： 2019/2/12
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/12    - 创建文件。
 *****************************************************************************/ 

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('FoundValue', {
        date: {
            type: DataTypes.DATE
        },
        value: {
            type: DataTypes.FLOAT  // 单位净值
        }, 
        value2: {
            type: DataTypes.FLOAT  // 累计净值
        },
        value3: {
            type: DataTypes.FLOAT  // 净值增长率
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}