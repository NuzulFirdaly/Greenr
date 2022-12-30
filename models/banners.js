const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Banners = db.define('institutionbanner', { //Creates a table for pending institution
    banner_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    bannerpicture: {
        type: Sequelize.STRING,
        defaultValue: "1.jpg"
    },
});

module.exports = Banners;