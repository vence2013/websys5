/****************************************************************************** 
 * 文件名称 ： Finance.js
 * 功能说明 ： 
 * 
 * 创建日期 ： 2019/6/6
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/6/6    - 创建文件。
 *****************************************************************************/ 

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Finance', {
        total: {
            type: DataTypes.FLOAT,  
            allowNull: false,
        }, 
        modify: {
            type: DataTypes.FLOAT, 
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('get', 'pay', 'reset'),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        desc: {
            type: DataTypes.BLOB
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}