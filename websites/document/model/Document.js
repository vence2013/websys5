/****************************************************************************** 
 * 文件名称 ： Document.js
 * 功能说明 ： 文档数据模型
 * 
 * 创建日期 ： 2019/5/12
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/5/12    - 创建文件。
 *****************************************************************************/ 

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Document', {
        content: {
            type: DataTypes.BLOB, 
            allowNull: false, 
        },
        private: { // 私有权限
            type: DataTypes.STRING(20),   
            allowNull: false
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci'        
    });
}