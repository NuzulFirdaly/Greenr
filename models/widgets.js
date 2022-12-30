const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Widgets = db.define('widget', { //Creates a table for pending institution
    widget_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    widgetimage: {
        type: Sequelize.STRING,
        defaultValue: "1.jpg"
    },
    widgeturl: {
        type: Sequelize.STRING,
    }
});

module.exports = Widgets;