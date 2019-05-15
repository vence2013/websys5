/* 
 * 文件名称 ： User.js
 * 功能说明 ： 注册用户
 * 
 * 创建日期 ： 2019/04/01
 * 创建者   ： wuxb
 * 修改历史 ： 
 *  2019/04/01    - 创建文件。
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
        },
        /* 记录该用户可以访问的用户接口列表，格式为字符串，以逗号分隔，接口项格式如： GET/logout, POST/document
         */
        interfaces: {
            type: DataTypes.BLOB,
            allowNull: true
        }
    })
}