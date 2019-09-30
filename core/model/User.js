/* 
 * 文件名称 ： User.js
 * 功能说明 ： 注册用户
 * 
 * 创建日期 ： 2019/04/01
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/01    - 创建文件。
 *  2019/09/30    - 简化用户设计
 */

module.exports = (sequelize, DataTypes) => {
    return sequelize.define("User", {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })
}