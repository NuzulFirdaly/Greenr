const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/


const PendingSeller = db.define('pendingseller', { //Creates a table called user
    pending_ticket_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    FirstName: {
        type: Sequelize.STRING
    },
    LastName: {
        type: Sequelize.STRING
    },
    Profile_pic: {
        type: Sequelize.STRING,
        defaultValue: "avatar2.jpg"
    },
    description: {
        type: Sequelize.STRING
    },

    // occupation, fromyear, toyear, college_country, college_name, major, graduateyear, dateofbirth, nric

});
console.log("Connected to user table");



//hasOne, belongsTo, hasMany, belongsToMany
//one-to-one 


module.exports = PendingSeller;