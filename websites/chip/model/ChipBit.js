/****************************************************************************** 
 * 文件名称 ： ChipBit.js
 * 功能说明 ： 
 *     位组以列表的形式表现，在前端进行后续处理。
 * 
 * 创建日期 ： 2019/5/27
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/27    - 创建文件。
 *****************************************************************************/ 

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('ChipBit', {
        name: {
            type: DataTypes.STRING,  
            allowNull: false,
        }, 
        fullname: {
            type: DataTypes.STRING,  
        },
        bitlist: {
            type: DataTypes.STRING, 
            allowNull: false,
        },
        valuelist: {
            type: DataTypes.STRING, 
        },
        rw: {  /* 读写权限 */
            type: DataTypes.STRING, 
        },
        desc: {
            type: DataTypes.BLOB, 
        }
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}