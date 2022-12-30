const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/

// id: _uuid(),
// category: 'Available',
// date: dateValue,
// time: timeValue,
// done: false,
const Calendar = db.define('calendar', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    category: {
        type: Sequelize.STRING
    },
    startdate: {
        type: Sequelize.DATE
    },
    enddate: {
        type: Sequelize.DATE
    },
});
module.exports = Calendar;