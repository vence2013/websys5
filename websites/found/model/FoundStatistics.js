/****************************************************************************** 
 * 文件名称 ： FoundStatistics.js
 * 功能说明 ： 基金统计信息
 * 近一周， 近一月， 近半年， 近一年， 近两年， 近三年， 今年来， 成立来
 * 
 * 创建日期 ： 2019/2/23
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/23    - 创建文件。
 *****************************************************************************/ 

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('FoundStatistics', {
        lastWeek: {
            type: DataTypes.FLOAT
        }, 
        lastMonth: {
            type: DataTypes.FLOAT
        }, 
        lastQuarter: {
            type: DataTypes.FLOAT
        }, 
        lastHalfYear: {
            type: DataTypes.FLOAT
        }, 
        last1Year: {
            type: DataTypes.FLOAT
        }, 
        last2Year: {
            type: DataTypes.FLOAT
        }, 
        last3Year: {
            type: DataTypes.FLOAT
        }, 
        thisYear: {
            type: DataTypes.FLOAT
        }, 
        fromCreate: {
            type: DataTypes.FLOAT
        }, 
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}