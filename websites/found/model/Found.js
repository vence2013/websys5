/****************************************************************************** 
 * 文件名称 ： Found.js
 * 功能说明 ： 基金信息
 * 
 * 创建日期 ： 2019/2/12
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/12    - 创建文件。
 *****************************************************************************/ 

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Found', {
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
            primaryKey: true,
        },    
        fullname: {
            type: DataTypes.STRING(255)
        },
        type: {
            type: DataTypes.STRING(255)
        },
        createDate: {
            type: DataTypes.DATE
        },
        createShare: { 
            type: DataTypes.FLOAT
        },        
        moneyUpdate: { 
            type: DataTypes.FLOAT
        },
        moneyUpdateDate: { 
            type: DataTypes.DATE
        },
        shareUpdate: {
            type: DataTypes.FLOAT  
        },
        shareUpdateDate: {
            type: DataTypes.DATE
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}