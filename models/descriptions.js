const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Descriptions = db.define('institutiondescription', { //Creates a table for pending institution
    description_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    about: {
        type: Sequelize.STRING,
        defaultValue: "My about is about my institution"
    },
    mycourse: {
        type: Sequelize.STRING,
        defaultValue: "The courses I offer are here"
    }
});

module.exports = Descriptions;