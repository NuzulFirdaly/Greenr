const CourseListing = require('../models/CoursesListing');
const Sequelize = require('sequelize');
const Lessons = require('../models/Lessons');
const User = require('../models/User');
const mySQLDB = require('./DBConfig');
const PendingSeller = require('../models/PendingSeller');
const ItemListing = require('../models/ItemListing');
const Calendar = require('../models/Calendar');

const RateReview = require('../models/RateReview');

const Booking = require("../models/Booking")
const Orders = require('../models/Orders');
const OrderDetails = require('../models/OrderDetails');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate().then(() => {
            console.log('tutorhub database connected');
        }).then(() => {
            /*
            Defines the relationship where a user has many videos.
            In this case the primary key from user will be a foreign key
            in video.
            */

            User.hasMany(CourseListing, { foreignKey: { type: Sequelize.UUID, allowNull: false } });

            // Course
            CourseListing.belongsTo(User);
            CourseListing.hasMany(Lessons, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            Lessons.belongsTo(CourseListing);
            User.hasOne(PendingSeller, { foreignKey: { type: Sequelize.UUID, allowNull: false } });
            PendingSeller.belongsTo(User);
            User.hasMany(ItemListing);
            ItemListing.belongsTo(User);
            // Calendar
            User.hasMany(Calendar, { foreignKey: "userUserId" }); //this is the tutorID
            Calendar.belongsTo(User, { foreignKey: "userUserId" })
            User.hasMany(Calendar, { foreignKey: "tuteeId" })
            Calendar.belongsTo(User, { foreignKey: "tuteeId" })
            Booking.hasMany(Calendar, { foreignKey: "booking_id" })
            Calendar.belongsTo(Booking, { foreignKey: "booking_id" })

            // Order
            User.hasMany(Orders, { foreignKey: "BuyerId" });
            Orders.belongsTo(User, { foreignKey: "BuyerId" });

            Orders.hasMany(OrderDetails, { foreignKey: "OrderId" });
            OrderDetails.belongsTo(Orders, { foreignKey: "OrderId" });

            CourseListing.hasMany(OrderDetails, { foreignKey: "course_id" });
            OrderDetails.belongsTo(CourseListing, { foreignKey: "course_id" });

            // Itemlisting
            User.hasMany(ItemListing);
            ItemListing.belongsTo(User);
            User.hasMany(Calendar);
            Calendar.belongsTo(User)

            //Bookings | CourseID|CalendarID|SessionID|tuteeID|TutorID|totalPrice|startTime|endTime|Paid|HourlyRate|Date|CourseName|
            CourseListing.hasMany(Booking, { foreignKey: "CourseId" })
            Booking.belongsTo(CourseListing, { foreignKey: "CourseId" })
            Lessons.hasMany(Booking, { foreignKey: "SessionId" })
            Booking.belongsTo(Lessons, { foreignKey: "SessionId" })
            User.hasMany(Booking, { foreignKey: "UserId" })
            Booking.belongsTo(Booking, { foreignKey: "UserId" })
            User.hasMany(Booking, { foreignKey: "TutorId" })
            Booking.belongsTo(Booking, { foreignKey: "TutorId" })


            //ratereview
            CourseListing.hasMany(RateReview, { foreignKey: "CourseId" });
            RateReview.belongsTo(CourseListing, { foreignKey: "CourseId" });
            User.hasMany(RateReview, { foreignKey: "TutorId" });
            RateReview.belongsTo(User, { foreignKey: "TutorId" });
            User.hasMany(RateReview, { foreignKey: "UserId" });
            RateReview.belongsTo(User, { foreignKey: "UserId" });

            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
                console.log('Create tables if none exists')
            }).catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};

module.exports = { setUpDB };