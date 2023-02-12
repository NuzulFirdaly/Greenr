const CourseListing = require('../models/CoursesListing');
const Sequelize = require('sequelize');
const Lessons = require('../models/Lessons');
const User = require('../models/User');
const mySQLDB = require('./DBConfig');
const PendingSeller = require('../models/PendingSeller');
const ItemListing = require('../models/ItemListing');
const Calendar = require('../models/Calendar');
const RateReview = require('../models/RateReview');
const Hash =  require('hash.js');
const Booking = require("../models/Booking");
const Orders = require('../models/Orders');
const OrderDetails = require('../models/OrderDetails');
var bcrypt = require('bcryptjs');
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

            ItemListing.hasMany(OrderDetails, { foreignKey: "item_id" });
            OrderDetails.belongsTo(ItemListing, { foreignKey: "item_id" });

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
            mySQLDB.addHook("afterBulkSync", generate_root_account.name, generate_root_account.bind(this, mySQLDB));
            mySQLDB.sync({ // Creates table if none exists
                force: drop
            }).then(() => {
                console.log('Create tables if none exists')
            }).catch(err => console.log(err))
        })
        .catch(err => console.log('Error: ' + err));
};

/**
 * This function creates a root account 
 * @param {Sequelize} database Database ORM handle
 * @param {SyncOptions} options Synchronization options, not used
 */
var hashedpassword = '';
bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash("P@ssw0rd", salt, function (err, hash){
        hashedpassword = hash;
    })
})
async function generate_root_account(database, options) {
    //	Remove this callback to ensure it runs only once
    database.removeHook("afterBulkSync", generate_root_account.name);
    //	Create a root user if not exists otherwise update it
    const audio = fs.readFileSync('0_003.wav');
    // const audio_base64 = audio.toString('base64');
    try {
        console.log(hashedpassword);
        console.log(audio);
        console.log("Generating root administrator account");
        const root_parameters = {
            user_id: "00000000-0000-0000-0000-000000000000",
            FirstName: "admin",
            LastName:"admin",
            Username:"greenr_admin",
            Email: "admin@mail.com",
            AccountTypeID: 2,
            verify: true,
            Audio:audio,
            Password: hashedpassword

            
        };
        //	Find for existing account with the same id, create or update
        var account = await User.findOne({ where: { "user_id": root_parameters.user_id } });

        account = await ((account) ? account.update(root_parameters) : User.create(root_parameters));

        console.log("== Generated root account ==");
        console.log(account.toJSON());
        console.log("============================");
        return Promise.resolve();
    }
    catch (error) {
        console.error("Failed to generate root administrator user account");
        console.error(error);
        return Promise.reject(error);
    }
}

module.exports = { setUpDB };
