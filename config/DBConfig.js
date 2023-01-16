const fs = require('fs');


const Sequelize = require('sequelize');
//bring in db.js which contains database name, username and password
const db = require('./db');

// Instantiates Sequelize with database parameters
const sequelize = new Sequelize(db.database, db.username, db.password, {
    dialect: 'mysql', // Tells squelize that MySQL is used
    host: db.host, // Name or IP address of MySQL server
    port: '3306',
    define: {
        timestamps: false // Don't create timestamp fields in database
    },
});


module.exports = sequelize;