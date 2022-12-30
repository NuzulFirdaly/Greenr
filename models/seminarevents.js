const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const SeminarEvents = db.define('seminarevents', { //Creates a table for pending institution
    seminarevents_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    SEImage: {
        type: Sequelize.STRING,
        defaultValue: "1.jpg"
    },
    SETitle: {
        type: Sequelize.STRING,
        defaultValue: "Seminar and event"
    },
    SEDescription: {
        type: Sequelize.STRING,
        defaultValue: "Description of the event"
    },
    SEUrl: {
        type: Sequelize.STRING
    }
});

module.exports = SeminarEvents;