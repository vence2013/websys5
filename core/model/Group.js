/* 
 * 文件名称 ： Group.js
 * 功能说明 ： 用户分组
 * 
 * 创建日期 ： 2019/04/01
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/01    - 创建文件。
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Group", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
}