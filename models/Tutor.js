// const Sequelize = require('sequelize');
// const db = require('../config/DBConfig');
// const User = require('./User');
// /* Creates a user(s) table in MySQL Database.
// Note that Sequelize automatically pleuralizes the entity name as the table name
// */
// const Tutor = db.define('tutors', { //Creates a table called user
//     tutor_id: {
//     type: Sequelize.UUID,
//     defaultValue: Sequelize.UUIDV4,
//     primaryKey: true,
//     allowNull: false
//     }
// });


// //bruh must state the name in the options or else they will randomly assign some weird column name lol
// //why does it create the foreignkey column name so weird one sia
// User.hasOne(Tutor,{foreignKey: {allowNull:false}});
// Tutor.belongsTo(User); 
// // User.sync({ force: true }) // This creates the table, dropping it first if it already existed //calling Sequelize to sync ALL models
// console.log("All models were synchronized successfully.");

// console.log("Finish defining tutor table table");
// module.exports = Tutor;