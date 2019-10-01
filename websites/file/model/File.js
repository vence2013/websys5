/****************************************************************************** 
 * 文件名称 ： File.js
 * 功能说明 ： 文件
 * 
 * 创建日期 ： 2019/2/6
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/6    - 创建文件。
 *****************************************************************************/ 

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('File',  {
        // 关键属性
        name: {
            type: DataTypes.STRING, // 上传时的文件名称
            allowNull: false
        }, 
        location: {
            type: DataTypes.STRING(255),  // 目录按月份划分
            allowNull: false
        },
        // 附加属性
        desc: {
            type: DataTypes.BLOB, 
            allowNull: true,
        },
        // 文件固有属性
        size: {
            type: DataTypes.INTEGER(10),   // byte
            allowNull: false
        },
        ext: {
            type: DataTypes.STRING(32),
            allowNull: true
        },
        owner: { // 创建者的账户名称， 非必须
            type: DataTypes.STRING(20)
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}