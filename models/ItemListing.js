const Sequelize = require('sequelize');
const sequelize = require('../config/DBConfig');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const ItemListing = db.define('item_listing', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    item_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    Name: {
        type: Sequelize.STRING
    },
    Description: {
        type: Sequelize.STRING
    },
    Picture: {
        type: Sequelize.STRING,
    },
    Price: {
        type: Sequelize.FLOAT,
        defaultValue: 1
    },
});
console.log("Connected to user table");
module.exports = ItemListing;