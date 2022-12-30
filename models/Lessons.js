const Sequelize = require('sequelize');
const sequelize = require('../config/DBConfig');
const db = require('../config/DBConfig');
const CourseListing = require('./CoursesListing');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Lessons = db.define('Lessons', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    session_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    session_no: {
        type: Sequelize.INTEGER
    },
    session_title: {
        type: Sequelize.TEXT
    },
    session_description: {
        type: Sequelize.TEXT
    },
    time_approx: {
        type: Sequelize.STRING
    },

});
module.exports = Lessons;