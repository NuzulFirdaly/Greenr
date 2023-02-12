const Sequelize = require('sequelize');
const sequelize = require('../config/DBConfig');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/

class UserRole {
    static get User() { return "customer"; }
    static get Admin() { return "admin"; }
}
const User = db.define('user', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    Username: {
        type: Sequelize.STRING
    },
    FirstName: {
        type: Sequelize.STRING
    },
    LastName: {
        type: Sequelize.STRING
    },
    Email: {
        type: Sequelize.STRING,
        unique: true
    },
    Password: {
        type: Sequelize.STRING
    },
    Profile_pic: {
        type: Sequelize.STRING,
        defaultValue: "avatar2.jpg"
    },
    Audio:{
        type: Sequelize.BLOB('long'),
    },
    description: {
        type: Sequelize.STRING
    },
    AccountTypeID: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    verify: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    },
    
    // accountType
});
console.log("Connected to user table");
module.exports = User;

