const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const CourseListing = db.define('course_listing', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    course_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    Title: {
        type: Sequelize.STRING
    },
    Category: {
        type: Sequelize.STRING
    },
    Subcategory: {
        type: Sequelize.STRING
    },
    Short_description: {
        type: Sequelize.STRING,
    },
    Description: {
        type: Sequelize.TEXT
    },
    Course_thumbnail: {
        type: Sequelize.STRING,
        defaultValue: "avatar2.jpg"
    },
    //cannot be more than 8
    Hourlyrate: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },
    Maximumdays: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    Minimumdays: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});
module.exports = CourseListing;