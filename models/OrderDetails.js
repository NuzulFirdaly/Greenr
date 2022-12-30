const Sequelize = require('sequelize');
const sequelize = require('../config/DBConfig');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const OrderDetails = db.define('order_detail', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    quantity: {
        type: Sequelize.INTEGER
    },
    total_price: {
        type: Sequelize.DOUBLE
    },

});
module.exports = OrderDetails;