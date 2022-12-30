const Sequelize = require('sequelize');
const sequelize = require('../config/DBConfig');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/

// id: _uuid(),
// category: 'Available',
// date: dateValue,
// time: timeValue,
// done: false,


//Bookings | CourseID|CalendarID|SessionID|tuteeID|TutorID|totalPrice|startTime|endTime|Paid|HourlyRate|Date|CourseName|

const Booking = db.define('bookings', { //Creates a table called user
    //the reason why in mysql there is a id column because we never define a primarykey!!
    Booking_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false

    },
    tutorProfilePic: {
        type: Sequelize.STRING
    },
    tuteeProfilePic: {
        type: Sequelize.STRING
    },
    tutorName: {
        type: Sequelize.STRING
    },
    tuteeName: {
        type: Sequelize.STRING
    },
    meetingLink: {
        type: Sequelize.TEXT
    },
    calendarStartDate: {
        type: Sequelize.DATE
    },
    bookDate: {
        type: Sequelize.STRING
    },
    courseName: {
        type: Sequelize.STRING
    },
    sessionName: {
        type: Sequelize.STRING
    },
    sessionHours: {
        type: Sequelize.INTEGER
    },
    sessionDescription: {
        type: Sequelize.TEXT
    },
    HourlyRate: {
        type: Sequelize.INTEGER
    },
    totalPrice: {
        type: Sequelize.DECIMAL
    },
    startTime: {
        type: Sequelize.INTEGER
    },
    endTime: {
        type: Sequelize.INTEGER
    },
    paid: { //Yes or No or pending or processing
        type: Sequelize.STRING
    }
});
module.exports = Booking;