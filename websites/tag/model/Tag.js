/****************************************************************************** 
 * 文件名称 ： Tag.js
 * 功能说明 ： 标签的数据模型
 * 
 * 创建日期 ： 2019/4/25
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/4/25    - 创建文件。
 *****************************************************************************/ 

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Tag', {
        name: {
            type: DataTypes.STRING, 
            allowNull: false,
        },
        owner: { // 创建者的账户名称， 非必须
            type: DataTypes.STRING(20)
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
} 