/****************************************************************************** 
 * 文件名称 ： FoundCompany.js
 * 功能说明 ： 基金公司
 * 
 * 创建日期 ： 2019/2/12
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/2/12    - 创建文件。
 *****************************************************************************/ 

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('FoundCompany', {
        code: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },        
        name: {
            type: DataTypes.STRING(255)
        },
        attr: {
            type: DataTypes.STRING(255)
        }, 
        createDate: {
            type: DataTypes.DATE
        },
        createMoney: {
            type: DataTypes.FLOAT
        },
        moneyTotal: { 
            type: DataTypes.FLOAT
        },
        foundTotal: { 
            type: DataTypes.INTEGER
        },
        managerTotal: {
            type: DataTypes.INTEGER  
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}