/****************************************************************************** 
 * 文件名称 ： Category.js
 * 功能说明 ： 目录的数据模型
 * 
 * 创建日期 ： 2019/4/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/4/27    - 创建文件。
 *****************************************************************************/ 

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Category', {
        father: {
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING(255)
        },
        desc: {
            type: DataTypes.BLOB
        },
        owner: { // 创建者的账户名称， 非必须
            type: DataTypes.STRING(20)
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}