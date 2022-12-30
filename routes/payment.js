const express = require('express');
const router = express.Router();
const paypal = require('paypal-rest-sdk');
const { Op } = require('sequelize');
const Booking = require('../models/Booking');
const Orders = require('../models/Orders');
const OrderDetails = require('../models/OrderDetails');
const ensureAuthenticated = require('../helpers/auth');


// const Orders = require('../models/Orders');
// const OrderDetails = require('../models/OrderDetails');
const alertMessage = require('../helpers/messenger');
const Calendar = require('../models/Calendar');
router.post("/bookingPayment/:bookingId", ensureAuthenticated, (req, res) => {
    Booking.findOne({ where: { Booking_id: req.params.bookingId } }).then(booking => {
        tutor_id = booking.TutorId
        courseid = booking.CourseId
        calendarStartDate = booking.calendarStartDate
        bookDate = booking.bookDate
        startTime = booking.startTime
        endTime = booking.endTime
        sessionId = booking.SessionId
        courseName = booking.courseName
        HourlyRate = booking.HourlyRate
        sessionName = booking.sessionName
        sessionDescription = booking.sessionDescription
        sessionHours = booking.sessionHours
        totalPrice = booking.totalPrice
        HourlyRate = booking.HourlyRate


        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/payment/booking/success/" + req.params.bookingId,
                "cancel_url": "http://localhost:3000/payment/booking/cancel/" + req.params.bookingId
            },
            "transactions": [{
                "amount": {
                    "currency": "SGD",
                    "total": totalPrice
                },
                "description": "Hat for the best team ever"
            }]
        };

        paypal.payment.create(create_payment_json, function(error, payment) {
            if (error) {
                throw error;
            } else {
                console.log(payment);
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        res.redirect(payment.links[i].href);
                    }
                }
            }
        });
    })
})

router.get("/booking/cancel/:bookingID", async(req, res) => {
    res.redirect("/myschedule/bookingProcessing/" + req.params.bookingID)
})

router.get("/booking/success/:bookingID", async(req, res) => {
    //reorder calendar for tutor and create an entry for user in calendar
    await Booking.findOne({ where: { Booking_id: req.params.bookingID } }).then(async(booking) => {
        await booking.update({ paid: "yes" })
        tutor_id = booking.TutorId
        courseid = booking.CourseId
        calendarStartDate = booking.calendarStartDate
        bookDate = booking.bookDate
        startTime = booking.startTime
        endTime = booking.endTime
        sessionId = booking.SessionId
        courseName = booking.courseName
        HourlyRate = booking.HourlyRate
        sessionName = booking.sessionName
        sessionDescription = booking.sessionDescription
        sessionHours = booking.sessionHours
        totalPrice = booking.totalPrice
        HourlyRate = booking.HourlyRate

        sqlFormstartdateOffsetted = calendarStartDate.setHours(parseInt(startTime))
        sqlFormenddateOffsetted = calendarStartDate.setHours(parseInt(endTime))
            //updating tutor calendar
        await Calendar.findAll({
            where: {
                userUserId: tutor_id,
                startdate: {
                    [Op.substring]: calendarStartDate.toISOString().slice(0, 10) //ddmmyyyy
                }
            }
        }).then(calendars => {
            availability = { '9': 'break', '10': "break", '11': 'break', '12': "break", "13": "break", "14": "break", "15": "break", "16": "break", "17": "break", "18": "break", "19": "break", "20": "break", "21": "break", "22": "break", "23": "break" }
            calendarparsed = JSON.parse(JSON.stringify(calendars, null, 2))
            console.log("this is calendar parsed", calendarparsed)
                //filling up the availability dictionary
            for (i in calendarparsed) {
                if (calendarparsed[i].category == "Available") {
                    startTimeInt = new Date(Date.parse(calendarparsed[i].startdate)).getHours()
                    checkendtimedate = new Date(Date.parse(calendarparsed[i].enddate))
                    checkendtimeoffset = new Date(checkendtimedate.setMinutes(checkendtimedate.getMinutes()))

                    endtimeInt = new Date(Date.parse(calendarparsed[i].enddate)).getHours() == 0 ? 24 : new Date(Date.parse(calendarparsed[i].enddate)).getHours();
                    theRange = range(endtimeInt - startTimeInt, startTimeInt)
                    for (j in theRange) {
                        console.log(theRange[j])
                        availability[theRange[j]] = "Available"
                    }
                } else if (calendarparsed[i].category != "Available" && calendarparsed[i].category != "break") {
                    //store booking id and tuteeid inside availability, since later when we replace it we can still have it
                    startTimeInt = new Date(Date.parse(calendarparsed[i].startdate)).getHours()
                    checkendtimedate = new Date(Date.parse(calendarparsed[i].enddate))
                    checkendtimeoffset = new Date(checkendtimedate.setMinutes(checkendtimedate.getMinutes()))

                    endtimeInt = new Date(Date.parse(calendarparsed[i].enddate)).getHours() == 0 ? 24 : new Date(Date.parse(calendarparsed[i].enddate)).getHours();
                    theRange = range(endtimeInt - startTimeInt, startTimeInt)
                    for (j in theRange) {
                        console.log("Booking", theRange[j])
                        availability[theRange[j]] = [calendarparsed[i].category, calendarparsed[i].tuteeId, calendarparsed[i].booking_id]
                    }
                }
            }
            //filling in the booking session
            theRange = range(endTime - startTime, startTime)
            console.log("this is filling in the booking")
            for (i in theRange) {
                console.log(theRange[i])
                availability[theRange[i]] = [sessionName, req.user.user_id, req.params.bookingID]
            }

            //filling in the breaks do a check if statement if the rest of the days are break or not if it is then dont need to create a break entry into mysql
            associativeArray = Object.keys(availability)
            while (availability[associativeArray[0]] == 'break') {
                delete availability[associativeArray[0]]
                indexOfElement = associativeArray.indexOf(associativeArray[0])
                if (indexOfElement > -1) {
                    associativeArray.splice(indexOfElement, 1);
                }

            }
            //length - 1 to get the last index
            while (availability[associativeArray[associativeArray.length - 1]] == 'break') {
                delete availability[associativeArray[associativeArray.length - 1]]
                indexOfElement = associativeArray.indexOf(associativeArray[associativeArray.length - 1])
                if (indexOfElement > -1) {
                    associativeArray.splice(indexOfElement, 1);
                }
            }
            //replacing it with new calendar objects
            Calendar.destroy({
                    where: {
                        userUserId: tutor_id,
                        startdate: {
                            [Op.substring]: new Date(sqlFormenddateOffsetted).toISOString().slice(0, 10)
                        }
                    }
                }).then(async(calendar) => {
                    console.log("this is availability:", availability)
                    ignore = true
                    theStartOfRange = 0
                    theEndOfRange = 0
                    currentCategory = null
                    for (var key in availability) {
                        if (availability[key] == "break" && ignore == true) {
                            continue
                        } else if (availability[key] == "break" && ignore == false) {
                            if (currentCategory == null) {
                                currentCategory = "break"
                            } else if (currentCategory != "break") {
                                //create previous category entry
                                if (theStartOfRange != 0) {
                                    if (availability[key - 1] == "Available") {
                                        await Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id })
                                    } else { //this the one with booking, hence must open up array
                                        console.log("this will be startdate for booking", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange))

                                        await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
                                    }
                                    //reset the ranges
                                    theStartOfRange = 0
                                    theEndOfRange = 0
                                    currentCategory = "break"
                                }
                            } else {
                                currentCategory = "break"
                            }
                            if (theStartOfRange != 0) {
                                theEndOfRange += 1
                                    // console.log("thje emdtofrange for break", theEndOfRange)
                            } else {
                                theStartOfRange = parseInt(key)
                                theEndOfRange = parseInt(key) + 1
                                    // console.log("thje startofrange for break", theStartOfRange)
                            }
                        } else if (availability[key] == "Available") {
                            ignore = false
                            if (currentCategory == null) {
                                currentCategory = "Available"
                            } else if (currentCategory != "Available") {
                                //create break entry 
                                if (theStartOfRange != 0) {
                                    if (availability[key - 1] == "break") {
                                        await Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id })
                                    } else {
                                        console.log("this will be startdate for booking", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange))
                                        console.log("this is tuteeId", availability[key - 1][1])
                                        await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
                                    }
                                    theStartOfRange = 0
                                    theEndOfRange = 0
                                    currentCategory = "Available"
                                }
                            } else {
                                currentCategory = "Available"
                            }
                            if (theStartOfRange != 0) {
                                theEndOfRange += 1
                            } else {
                                theStartOfRange = parseInt(key)
                                theEndOfRange = parseInt(key) + 1
                            }
                        } else if (availability[key] != "Available" && availability[key] != "break") { //this for those with bookings //need check if it is a seperate booking ID
                            ignore = false
                            console.log("this is availability[key]", availability[key][0])
                            console.log("this is currentCategoryu", currentCategory)
                            if (currentCategory == null) {
                                currentCategory = availability[key][0] + availability[key][2] //sessionname + bookingID
                            } else if (currentCategory != availability[key][0] + availability[key][2]) {
                                if (theStartOfRange != 0) {
                                    if (availability[key - 1] == "break") {
                                        await Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id })
                                    } else if (availability[key - 1] == "Available") {
                                        await Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id })
                                    } else { //this is if theres same session
                                        await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })

                                    }
                                    theStartOfRange = 0
                                    theEndOfRange = 0
                                    currentCategory = availability[key][0] + availability[key][2]
                                    console.log("changed currentCategory to array", currentCategory)
                                }
                            } else {
                                currentCategory = availability[key][0] + availability[key][2]
                            }

                            console.log("this is the startof range before the else", theStartOfRange)
                            if (theStartOfRange != 0) {
                                theEndOfRange += 1
                            } else {
                                console.log("it keeps going here")
                                theStartOfRange = parseInt(key)
                                console.log("this is sthe start of range", theStartOfRange)
                                theEndOfRange = parseInt(key) + 1
                            }

                        }
                    }
                    if (theStartOfRange != 0) { //end of the loop check category
                        if (currentCategory == "break") {
                            Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id })
                        } else if (currentCategory == "Available") {
                            Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id })
                        } else {
                            Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: tutor_id, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
                        }
                    }
                }) //end of destroy.then()

        })
        res.render("schedule/bookingPaymentSuccess", {
            tutor_id: tutor_id,
            courseid: courseid,
            startTime,
            endTime,
            sessionId,
            courseName,
            HourlyRate,
            sessionName,
            sessionDescription,
            sessionHours,
            bookDate,
            totalPrice,
            bookingID: req.params.bookingID
        })

    })

})
router.post('/item', ensureAuthenticated, (req, res) => {
    cart = req.session.cart;
    items = [];
    total = 0;
    console.log(cart);
    for (var key in cart) {
        item = {};
        item['name'] = cart[key][3];
        item['price'] = cart[key][0];
        item['currency'] = 'SGD';
        item['quantity'] = cart[key][1];
        items.push(item);
        total += parseFloat(cart[key][2]);
    }
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/payment/success",
            "cancel_url": "http://localhost:3000/payment/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": items
            },
            "amount": {
                "currency": "SGD",
                "total": total
            },
            "description": "Hat for the best team ever"
        }]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            throw error;
        } else {
            console.log(payment);
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });

});

router.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    cart = req.session.cart
    total = 0;
    for (var key in cart) {
        total += parseFloat(cart[key][2]);
    }

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "SGD",
                "total": total
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            today = new Date();
            total = 0;
            for (var key in cart) {
                total += parseFloat(cart[key][2]);
            }

            Orders.create({ status: "Ongoing", date: today, total, BuyerId: req.user.user_id })
                .then((order) => {
                    order_id = JSON.parse(JSON.stringify(order)).order_id;
                    console.log("this is order", JSON.parse(JSON.stringify(order)));
                    details = [];
                    cart = req.session.cart;
                    console.log("this is carts", cart);
                    for (var key in cart) {
                        dict = {};
                        dict["quantity"] = cart[key][1];
                        dict["total_price"] = cart[key][2];
                        dict["item_id"] = key;
                        dict["OrderId"] = order_id;
                        details.push(dict);
                    }
                    console.log("this is detail", details);
                    OrderDetails.bulkCreate(details)
                        .then(() => {
                            alertMessage(res, "success", 'Order successful.', 'fas fa-sign-in-alt', true);
                            var shipping_address = payment.payer.payer_info.shipping_address
                            cart["street"] = shipping_address.line1;
                            cart["city"] = shipping_address.city;
                            cart["postal_code"] = shipping_address.postal_code;
                            cart["date"] = today;
                            console.log(cart);
                            res.redirect('/shop/receipt');
                        })
                        .catch(err => console.log(err));;
                })
                .catch(err => console.log(err));

        }
    });
});
router.get('/cancel', (req, res) => res.redirect('/shop/viewCart'));

function range(size, startAt) {
    return [...Array(size).keys()].map(i => i + startAt);
}
module.exports = router;