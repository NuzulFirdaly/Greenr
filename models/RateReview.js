const Sequelize = require('sequelize');
const sequelize = require('../config/DBConfig');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const RateReview = db.define('ratereview', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    ratereview_id:{
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    Rating:{
        type: Sequelize.INTEGER
    },
    Review: {
        type: Sequelize.STRING
    },
    Date: {
        type: Sequelize.DATE
    }
});
module.exports = RateReview;