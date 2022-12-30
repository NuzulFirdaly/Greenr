const express = require('express');
const { Op, UUID } = require('sequelize');
const ensureAuthenticated = require('../helpers/auth');
const router = express.Router();
const alertMessage = require('../helpers/messenger');
const Booking = require('../models/Booking');
const Calendar = require('../models/Calendar');
const CourseListing = require('../models/CoursesListing');
const Session = require("../models/Lessons")
const User = require('../models/User');


//todo 
//try to see whether its possible to implement angular scheduler system
// tutor no need to select time
// they just select the date, course and session
// because they already indicate the time on the session
// they only need to indicate start time
router.post("/book/:tutorid/:courseid", async(req, res) => {
    //body
    console.log("this is boook ", req.body)
    calendarId = req.body.calendarId
    sessionId = Array.isArray(req.body.sessionId) ? req.body.sessionId[0] : req.body.sessionId
    date = req.body.date
    console.log("THIS SIS DATE FROM REQ BODY DATE", date)

    startTime = req.body.startTime
    endTime = req.body.endTime
    console.log("this is boook 2,0", calendarId, sessionId, date, startTime, endTime)
        //-----
    courseName = null
    HourlyRate = 0
    sessionName = null
    sessionDescription = null
    sessionHours = 0
    bookDate = null
        //---
    tutorName = null
    tutorProfilePic = null
    await CourseListing.findOne({ where: { course_id: req.params.courseid } })
        .then(course => {
            courseName = course.Title
            HourlyRate = course.Hourlyrate
        })
    await Session.findOne({ where: { session_id: sessionId } })
        .then(session => {
            sessionName = session.session_title
            sessionDescription = session.session_description
            sessionHours = session.time_approx
        })
    await User.findOne({ where: { user_id: req.params.tutorid } }).then(tutor => {
        tutorName = tutor.FirstName + " " + tutor.LastName
        tutorProfilePic = tutor.Profile_pic
    })

    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; //https://stackoverflow.com/a/34015511
    convertedStartTime = convertTime12to24(startTime)
    convertedEndTime = convertTime12to24(endTime)
        // await Calendar.findOne({ where: { id: calendarId } }).then(calendar => {
        //     calendarStartDate = calendar.startdate
        //     bookDate = `${calendar.startdate.toLocaleDateString("en-US", options)} | ${formatAMPM(startTime)} - ${formatAMPM(endTime)} `
        // })
    calendarStartDate = new Date(date).setHours(9)
    bookDate = `${ new Date(date).toLocaleDateString("en-US", options)} | ${formatAMPM(startTime)} - ${formatAMPM(endTime)} `
    console.log("this is sessionId", sessionId)
    totalPrice = HourlyRate * sessionHours
    await Booking.create({ tutorName, tutorProfilePic, tuteeProfilePic: req.user.Profile_pic, tuteeName: req.user.FirstName + " " + req.user.LastName, calendarStartDate, bookDate, courseName, sessionName, sessionHours, sessionDescription, HourlyRate, totalPrice, startTime, endTime, paid: "No", CourseId: req.params.courseid, SessionId: sessionId, UserId: req.user.user_id, TutorId: req.params.tutorid })
        .then(Books => {
            BookingID = Books.Booking_id
            res.redirect(301, "/myschedule/bookingProcessing/" + BookingID)
        })

    //create a booking entry, and then check if booking entry exist already inside table, and then redirect to a booking processing page with the booking id


})

router.get("/bookingProcessing/:bookingID", ensureAuthenticated, (req, res) => {
    Booking.findOne({ where: { Booking_id: req.params.bookingID } }).then(booking => {
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


        res.render("schedule/bookingProcessing", {
            tutor_id: tutor_id,
            courseid: courseid,
            date,
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

const convertTime12to24 = (time12h) => {
        console.log("this is time12to24", time12h)
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') { hours = '00'; }
        if (modifier === 'PM') { hours = parseInt(hours, 10) + 12; }
        return parseInt(hours);
    }
    //to format date to a 12 hour formate
function formatAMPM(hours) {

    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var strTime = hours + ampm;
    return strTime;
}

router.post('/submit_entry', async(req, res) => {
    //check whether entry exists already inside our database the date and the time. 
    todoList = req.body

    await Calendar.findAll({ where: { userUserId: req.user.user_id }, raw: true })
        .then(calendar => {
            // console.log("this is from sql",calendar)
            //looping through our database to check whether we have the same entries, datee and time dont matter the id lol 
            for (let i = 0; i < todoList.length; i++) {
                let gotduplicate = false
                for (let j = 0; j < calendar.length; j++) {
                    calendarStartDate = new Date(Date.parse(calendar[j].startdate))
                    calendarEndDate = new Date(Date.parse(calendar[j].enddate))
                    todoStartDate = new Date(Date.parse(todoList[i].startdate))
                    todoEndDate = new Date(Date.parse(todoList[i].enddate))
                        //if similar date but time is different, 
                    if ((calendarStartDate.getTime() == todoStartDate.getTime()) && (calendarEndDate.getTime() == todoEndDate.getTime())) {
                        gotduplicate = true
                        break;
                    }
                }
                if (gotduplicate != true) {
                    Calendar.create({ id: todoList[i].id, category: todoList[i].category, startdate: todoList[i].startdate, enddate: todoList[i].enddate, starttime: todoList[i].starttime, endtime: todoList[i].endtime, userUserId: req.user.user_id }).catch(err => console.log(err));
                }


            }

        })

    res.send(req.body)
})
router.post('/delete_entry', async(req, res) => {
    console.log("this is delete entry req body", req.body)
    todoList = req.body
    await Calendar.findAll({ where: { userUserId: req.user.user_id }, raw: true })
        .then(calendar => {
            console.log("This is delete entry calendar", calendar)
                // console.log("this is from sql",calendar)
                //so basically we are comparing our database and our todolist, since we deleted an entry from todolist it will be shorter than the calendar. we check which is the one that is delete from todolist and delete it from calendar
            for (let i = 0; i < calendar.length; i++) {
                calendarStartDate = new Date(Date.parse(calendar[i].startdate))
                calendarEndDate = new Date(Date.parse(calendar[i].enddate))
                let dateExist = false
                for (let j = 0; j < todoList.length; j++) {
                    todoStartDate = new Date(Date.parse(todoList[j].startdate))
                    todoEndDate = new Date(Date.parse(todoList[j].enddate))
                        //if similar date but time is different, 
                    if ((calendarStartDate.getTime() == todoStartDate.getTime()) && (calendarEndDate.getTime() == todoEndDate.getTime())) {
                        dateExist = true
                    }
                }
                if (dateExist == false) {
                    console.log("to be deleted since it doesnt exist inside todolist", calendar[i])
                        // destroy it
                    Calendar.destroy({ where: { id: calendar[i].id } })
                        // Calendar.create({id:todoList[i].id , category: todoList[i].category, startdate: todoList[i].startdate, enddate: todoList[i].enddate, starttime: todoList[i].starttime, endtime: todoList[i].endtime, userUserId: req.user.user_id }).catch(err => console.log(err));
                } else {
                    console.log("there are no duplicate")
                }
            }
        })
    res.send(req.body)
})

router.post("/unavailable_entry/:tutorid", async(req, res) => {
    calendarId = req.body.id
    console.log(calendarId)
    date = req.body.date
    dateParsed = new Date(Date.parse(date))
    starttime = req.body.starttime
    endtime = req.body.endtime
    console.log("this is req.body", date, starttime, endtime)
    startTimeParsed = new Date(dateParsed.setHours(starttime))
    console.log("this is startt time NOT offseted", startTimeParsed)
        // startTimeOffsetted = new Date(startTimeParsed.setMinutes(startTimeParsed.getMinutes(), startTimeParsed.getTimezoneOffset()))
        // console.log("this is startt time offseted", startTimeOffsetted)
    console.log("checking date parsed sethours", dateParsed.setHours(starttime))
        // console.log("checking offset fuckkk", new Date(dateParsed.setHours(starttime)))

    //We need to do a timezone offset to match the user's local timezone. We first create a date object with the parsed value this creates a date object according to UTC timezone. we need to offset it back
    sqlFormstartdate = new Date(dateParsed.setHours(starttime)) //.toISOString().slice(0, 19).replace('T', ' ')
    console.log("this is sqlFormStartDate", sqlFormstartdate) //motherfucker, the fucking timezoneoffset thats why
    sqlFormstartdateOffsetted = new Date(sqlFormstartdate.setMinutes(sqlFormstartdate.getMinutes() - sqlFormstartdate.getTimezoneOffset())).toISOString().slice(0, 19).replace('T', ' ')
    console.log("checking offset fuckkk", sqlFormstartdateOffsetted)

    sqlFormenddate = new Date(dateParsed.setHours(endtime)) //.toISOString().slice(0, 19).replace('T', ' ')
    sqlFormenddateOffsetted = new Date(sqlFormenddate.setMinutes(sqlFormenddate.getMinutes() - sqlFormenddate.getTimezoneOffset())).toISOString().slice(0, 19).replace('T', ' ')

    console.log("lets fucjing hope", sqlFormstartdateOffsetted, sqlFormenddateOffsetted)

    console.log(req.params.tutorid, "this is unavailable", calendarId, starttime, endtime)

    if (starttime == 9 && endtime == 0) {
        console.log("deleted full day")
        Calendar.destroy({ where: { id: calendarId } })
        res.send("succesfully deleted")
    } else { //the date format isnt the same as mysql
        // console.log("substring", new Date(sqlFormenddateOffsetted).toISOString().slice(0, 10))

        //         //utilizing a dictionary from 9 am to 12 am midnight 
        //retrieve all the rows of the same date
        Calendar.findAll({
                where: {
                    userUserId: req.params.tutorid,
                    startdate: {
                        [Op.substring]: new Date(sqlFormenddateOffsetted).toISOString().slice(0, 10)
                    }
                }
            })
            .then(calendars => {
                availability = { '9': 'break', '10': "break", '11': 'break', '12': "break", "13": "break", "14": "break", "15": "break", "16": "break", "17": "break", "18": "break", "19": "break", "20": "break", "21": "break", "22": "break", "23": "break" }
                    // console.log("this is all rows associated", calendars)
                calendarparsed = JSON.parse(JSON.stringify(calendars, null, 2))
                console.log(calendarparsed)
                    //filling up the availability dictionary
                for (i in calendarparsed) {
                    // console.log("this is i", calendarparsed[i])
                    // console.log(":sidhs", calendarparsed[i].category)
                    if (calendarparsed[i].category == "Available") {
                        startTimeInt = new Date(Date.parse(calendarparsed[i].startdate)).getHours()
                        console.log("this is starttimeint", startTimeInt)
                        checkendtimedate = new Date(Date.parse(calendarparsed[i].enddate))
                        checkendtimeoffset = new Date(checkendtimedate.setMinutes(checkendtimedate.getMinutes()))
                        console.log(checkendtimeoffset)


                        endtimeInt = new Date(Date.parse(calendarparsed[i].enddate)).getHours() == 0 ? 24 : new Date(Date.parse(calendarparsed[i].enddate)).getHours();
                        console.log("this is endtimeint", endtimeInt)
                        console.log("this is endtime", endtimeInt, endtimeInt - startTimeInt)

                        theRange = range(endtimeInt - startTimeInt, startTimeInt)
                        for (i in theRange) {
                            console.log(theRange[i])
                            availability[theRange[i]] = "Available"
                        }
                        // endtimeIntOffsetted = new Date(endtimeInt.setMinutes(endtimeInt.getMinutes() - endtimeInt.getTimezoneOffset()))
                        //     // console.log("this is startTimeINoffseted", startTimeIntOffsetted)
                        // console.log("this is startTimeINoffseted hsours", endtimeIntOffsetted)

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

                //filling in the breaks do a check if statement if the rest of the days are break or not if it is then dont need to create a break entry into mysql
                theRange = range(parseInt(endtime) - parseInt(starttime), parseInt(starttime))
                for (i in theRange) {
                    console.log(theRange[i])
                    availability[theRange[i]] = "break"
                }
                console.log(availability)

                //slicing the front and back if there are breaks
                associativeArray = Object.keys(availability)
                console.log("before delete associativearray", associativeArray)
                while (availability[associativeArray[0]] == 'break') {
                    delete availability[associativeArray[0]]
                    indexOfElement = associativeArray.indexOf(associativeArray[0])
                        // console.log("indexofelement", indexOfElement)
                    if (indexOfElement > -1) {
                        associativeArray.splice(indexOfElement, 1);
                    }

                }
                //length - 1 to get the last index
                console.log("after before break", associativeArray[associativeArray.length - 1], availability[associativeArray[associativeArray.length - 1]])
                while (availability[associativeArray[associativeArray.length - 1]] == 'break') {
                    delete availability[associativeArray[associativeArray.length - 1]]
                    indexOfElement = associativeArray.indexOf(associativeArray[associativeArray.length - 1])
                    if (indexOfElement > -1) {
                        associativeArray.splice(indexOfElement, 1);
                    }
                }
                console.log("after trimming", availability)
                    //we can delete all the entries on the date, assuming that the current availability is updated the latest one. 
                Calendar.destroy({
                        where: {
                            userUserId: req.params.tutorid,
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
                                            await Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else { //this the one with booking, hence must open up array
                                            console.log("this will be startdate for booking", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange))

                                            await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
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
                                            await Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else {
                                            console.log("this will be startdate for booking", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange))
                                            console.log("this is tuteeId", availability[key - 1][1])
                                            await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
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
                                            await Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else if (availability[key - 1] == "Available") {
                                            await Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else { //this is if theres same session
                                            await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })

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
                                Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                            } else if (currentCategory == "Available") {
                                Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                            } else {
                                Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
                            }
                        }
                        res.send("this has been hell")
                    }) //end of destroy.then()
                    // }).then(calendar => {

                //     console.log("this is deleted", calendar)
                //     ignore = true
                //     theStartOfRange = 0
                //     theEndOfRange = 0
                //     doingBreak = false
                //     for (var key in availability) {
                //         console.log(key)
                //         console.log(availability[key])
                //         if (availability[key] == "break" && ignore == true) {
                //             continue
                //         } else if (availability[key] == "break" && ignore == false) {
                //             if (doingBreak == false) {
                //                 //create an available entry
                //                 if (theStartOfRange != 0) {
                //                     console.log("creating available entry with", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange + 1))
                //                     Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                //                 }
                //                 //reset the ranges
                //                 theStartOfRange = 0
                //                 theEndOfRange = 0
                //                 doingBreak = true
                //             }
                //             if (theStartOfRange != 0) {
                //                 theEndOfRange += 1
                //                     // console.log("thje emdtofrange for break", theEndOfRange)

                //             } else {
                //                 theStartOfRange = parseInt(key)
                //                 theEndOfRange = parseInt(key) + 1
                //                     // console.log("thje startofrange for break", theStartOfRange)
                //             }
                //         } else if (availability[key] == "Available") {
                //             ignore = false
                //             if (doingBreak == true) {
                //                 //create break entry 
                //                 if (theStartOfRange != 0) {
                //                     console.log("creating  entry with", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange + 1))
                //                     Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                //                 }
                //                 //reset the ranges
                //                 theStartOfRange = 0
                //                 theEndOfRange = 0
                //                 doingBreak = false
                //             }
                //             if (theStartOfRange != 0) {
                //                 theEndOfRange += 1
                //                     // console.log("the endofrange for available", theEndOfRange)
                //             } else {
                //                 theStartOfRange = parseInt(key)
                //                 theEndOfRange = parseInt(key) + 1
                //                     // console.log("thje startofrange for available", theStartOfRange)

                //             }

                //         }
                //     }
                //     console.log("the start and end of range after the for loop", theStartOfRange, theEndOfRange)
                //     console.log("what the fuck is this", new Date(sqlFormstartdateOffsetted))
                //     if (theStartOfRange != 0) {
                //         console.log("creating last available entry with", new Date(sqlFormstartdateOffsetted), new Date(new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange)))

                //         Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })

                //     }
                //     res.send("this has been hell")
                // })


            })

        //check whether the time range exist inside already if so we make that unavailable
        // Calendar.findOne({ where: { userUserId: req.params.tutorid, startdate: sqlFormstartdateOffsetted, enddate: sqlFormenddateOffsetted } })
        //     .then(calendar => {
        //         console.log("finding wghether calendar exists", calendar)
        //         if (calendar == null || calendar == undefined) {
        //             //finding the original date and changing it
        //             Calendar.findOne({ where: { id: calendarId } }).then(calendar => {
        //                 calendar.update({ enddate: sqlFormstartdateOffsetted })
        //                 Calendar.create({ category: "Break", startdate: sqlFormstartdateOffsetted, enddate: sqlFormenddateOffsetted, userUserId: req.params.tutorid })
        //                 Calendar.create({ category: "Available", startdate: sqlFormenddateOffsetted, enddate: new Date(dateParsed.setHours(24)).toISOString().slice(0, 19).replace('T', ' '), userUserId: req.params.tutorid })
        //                 res.send("lol")
        //             })
        //         } else {
        //             //it means we found the same un-fullday event which means we need to delete it
        //             console.log(calendar, 'calendar deleted')
        //             calendar.destroy()
        //             res.send("lol")
        //         }
        //     })
    }

})


router.get('/fetchbreaks/:tutorid/:calendardate', (req, res) => {
    availability = { '9': 'break', '10': "break", '11': 'break', '12': "break", "13": "break", "14": "break", "15": "break", "16": "break", "17": "break", "18": "break", "19": "break", "20": "break", "21": "break", "22": "break", "23": "break" }
        //send break the availability json

    Calendar.findAll({
            where: {
                userUserId: req.params.tutorid,
                startdate: {
                    [Op.substring]: new Date(req.params.calendar).toISOString().slice(0, 10)
                }
            },
            order: ["startdate"]
        })
        .then(calendars => {
            calendarparsed = JSON.parse(JSON.stringify(calendars, null, 2))
            console.log("fetchbreaks calendar let me see", calendarparsed)
                //filling up the availability dictionary
            for (i in calendarparsed) {
                // console.log("this is i", calendarparsed[i])
                // console.log(":sidhs", calendarparsed[i].category)
                if (calendarparsed[i].category == "Available") {
                    startTimeInt = new Date(Date.parse(calendarparsed[i].startdate)).getHours()
                    console.log("this is starttimeint", startTimeInt)
                    checkendtimedate = new Date(Date.parse(calendarparsed[i].enddate))
                    checkendtimeoffset = new Date(checkendtimedate.setMinutes(checkendtimedate.getMinutes()))
                    console.log(checkendtimeoffset)


                    endtimeInt = new Date(Date.parse(calendarparsed[i].enddate)).getHours() == 0 ? 24 : new Date(Date.parse(calendarparsed[i].enddate)).getHours();
                    console.log("this is endtimeint", endtimeInt)
                    console.log("this is endtime", endtimeInt, endtimeInt - startTimeInt)

                    theRange = range(endtimeInt - startTimeInt, startTimeInt)
                    for (i in theRange) {
                        console.log(theRange[i])
                        availability[theRange[i]] = "Available"
                    }
                    // endtimeIntOffsetted = new Date(endtimeInt.setMinutes(endtimeInt.getMinutes() - endtimeInt.getTimezoneOffset()))
                    //     // console.log("this is startTimeINoffseted", startTimeIntOffsetted)
                    // console.log("this is startTimeINoffseted hsours", endtimeIntOffsetted)

                }
            }
        })

    res.send(JSON.stringify(availability))


})

function range(size, startAt) {
    return [...Array(size).keys()].map(i => i + startAt);
}

router.get('/fetch/:tutorid', async(req, res) => {
    console.log("fetching calendar")
    console.log(req.user.user_id)
    console.log(req.params.tutorid)
    if (req.user.user_id == req.params.tutorid) {
        Calendar.findAll({ where: { userUserId: req.params.tutorid }, raw: true, order: ["startdate"] })
            .then(calendar => {
                console.log(calendar)
                res.send(calendar)
            }).catch(err => console.log(err));
    } else {
        console.log("public fetching calendar")
        bookings = null
            //fetching user's previous bookings see if it will clash with the new bookings, if so need to create new available entries. 
        await Calendar.findAll({ where: { tuteeId: req.user.user_id }, order: ['startdate'], raw: true }).then(bookingsTutee => {
            console.log("this is tutee Bookings:", bookingsTutee)
            bookings = bookingsTutee
        })
        await Calendar.findAll({ where: { userUserId: req.params.tutorid }, order: ['startdate'], raw: true })
            .then(calendar => {
                console.log("we are now inside calendar")
                console.log(calendar)
                console.log("this is cbooking inside the calendar find", bookings)
                calendartoSendWithoutClashes = {}
                calendartoSendWithoutClashes2Boogaloo = []
                if (bookings != null) {
                    for (let i in bookings) {
                        for (let j in calendar) {
                            console.log("this is i and j", i, j)
                            console.log("this is calendar", calendar[j].startdate.toISOString().slice(0, 10))
                            console.log("this is bookinfg", bookings[i].startdate.toISOString().slice(0, 10))
                                // console.log("comparing these 2 dates see if there are any clashes \n", calendar[j].startdate.toISOString().slice(0, 10) + "  " + bookings[i].startdate.toISOString().slice(0, 10))
                            if (calendar[j].startdate.toISOString().slice(0, 10) == bookings[i].startdate.toISOString().slice(0, 10)) { //it means that theres a date that clash
                                console.log("1. round, theere are classhes", bookings[i].startdate.toISOString().slice(0, 10))
                                    //getting timmings
                                starttime = calendar[j].startdate.getHours()
                                endtime = calendar[j].enddate.getHours() == 0 ? 24 : calendar[j].enddate.getHours()
                                console.log("this is entime", endtime)
                                bookstarttime = bookings[i].startdate.getHours()
                                bookendtime = bookings[i].enddate.getHours() == 0 ? 24 : bookings[i].enddate.getHours()
                                    //--
                                availability = null

                                if (calendartoSendWithoutClashes != null && calendar[j].startdate.toISOString().slice(0, 10) in calendartoSendWithoutClashes) { //same date but got another booking clash on the same date
                                    availability = calendartoSendWithoutClashes[calendar[j].startdate.toISOString().slice(0, 10)] //getting the availability
                                } else {
                                    availability = { '9': 'break', '10': "break", '11': 'break', '12': "break", "13": "break", "14": "break", "15": "break", "16": "break", "17": "break", "18": "break", "19": "break", "20": "break", "21": "break", "22": "break", "23": "break" }
                                    calendartoSendWithoutClashes[calendar[j].startdate.toISOString().slice(0, 10)] = availability
                                }
                                console.log("this is endtime, startime ranmgeg mge", endtime, starttime, endtime - starttime)
                                    //filling in the availabilities
                                theRange = range(parseInt(endtime) - parseInt(starttime), parseInt(starttime))
                                for (k in theRange) {
                                    // console.log(theRange[i])
                                    availability[theRange[k]] = "Available"
                                }
                                theRange = range(parseInt(bookendtime) - parseInt(bookstarttime), parseInt(bookstarttime))
                                for (k in theRange) {
                                    // console.log(theRange[i])
                                    availability[theRange[k]] = "TuteeHasBooking"
                                }
                                //----
                                //now check the duration,
                            }
                        }
                    }
                }
                currentClashDate = null
                thisDateDone = false
                for (let index in calendar) {
                    noclashes = true
                    clashdate = null
                    thisDateDone = false
                    if (calendar[index].startdate.toISOString().slice(0, 10) == currentClashDate) //it means the current clash date is done
                    {
                        continue
                    } else {

                    }
                    for (let keys in calendartoSendWithoutClashes) {
                        if (calendar[index].startdate.toISOString().slice(0, 10) != keys) {
                            continue
                        } else { //theres a date with clash
                            // console.log("there are clashes", clashdate)
                            noclashes = false
                                // if(clashdate == keys){
                                //     continue
                                // }
                            clashdate = keys
                            currentClashDate = keys
                            console.log("there are clashes now lol", clashdate, currentClashDate)

                        }
                    }
                    if (noclashes == true) {
                        calendartoSendWithoutClashes2Boogaloo.push(calendar[index])
                    } else { //create new entries
                        availability = calendartoSendWithoutClashes[clashdate]
                        console.log("this date got clashes", clashdate, "\n", availability)

                        ignore = true
                        theStartOfRange = 0
                        theEndOfRange = 0
                        currentCategory = null
                        for (var key in availability) {
                            if ((availability[key] != "Available") && (ignore == true)) {
                                continue
                            } else if (availability[key] != "Available" && ignore == false) {
                                if (currentCategory == null) {
                                    currentCategory = "break"
                                } else if (currentCategory != "break") {
                                    //create previous category entry
                                    if (theStartOfRange != 0) {
                                        if (availability[key - 1] == "Available") {
                                            // await Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                            calendarObject = {
                                                id: '7f63e539-4f0f-4264-bd80-cb6336858c50', //placeholder uuid
                                                category: 'Available',
                                                startdate: new Date(new Date(clashdate).setHours(theStartOfRange)),
                                                enddate: new Date(new Date(clashdate).setHours(theEndOfRange)),
                                                userUserId: calendar[index].userUserId

                                            }
                                            calendartoSendWithoutClashes2Boogaloo.push(calendarObject)
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
                                            // await Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else {
                                            // console.log("this will be startdate for booking", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange))
                                            console.log("this is tuteeId", availability[key - 1][1])
                                                // await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
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
                                            // await Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else if (availability[key - 1] == "Available") {
                                            // await Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                            calendarObject = {
                                                id: '7f63e539-4f0f-4264-bd80-cb6336858c50 ',
                                                category: 'Available',
                                                startdate: new Date(new Date(clashdate).setHours(theStartOfRange)),
                                                enddate: new Date(new Date(clashdate).setHours(theEndOfRange)),
                                                userUserId: calendar[index].userUserId
                                            }
                                            calendartoSendWithoutClashes2Boogaloo.push(calendarObject)
                                        } else { //this is if theres same session
                                            // await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })

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
                                // Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                            } else if (currentCategory == "Available") {
                                // Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                calendarObject = {
                                    id: '7f63e539-4f0f-4264-bd80-cb6336858c50 ',
                                    category: 'Available',
                                    startdate: new Date(new Date(clashdate).setHours(theStartOfRange)),
                                    enddate: new Date(new Date(clashdate).setHours(theEndOfRange)),
                                    userUserId: calendar[index].userUserId
                                }
                                calendartoSendWithoutClashes2Boogaloo.push(calendarObject)
                            } else {
                                // Calendar.create({ category: availability[Object.keys(availability)[Object.keys(availability).length - 1]][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[Object.keys(availability)[Object.keys(availability).length - 1]][1], booking_id: availability[Object.keys(availability)[Object.keys(availability).length - 1]][2] })
                            }
                        }
                        noclashes = false
                        thisDateDone = true
                    }
                }
                //cant destroy, but we can just add a new object with the new start dates and end dates
                // console.log("this is calendar tossentwithouclashes ELECTRIC BOOGALOO BABBYYYYYYYYYYYY", calendartoSendWithoutClashes2Boogaloo)
                res.send(calendartoSendWithoutClashes2Boogaloo)
            }).catch(err => console.log(err));
    }
})
router.get("/retrievetutorid", (req, res) => {
    res.json(JSON.stringify(req.user.user_id))
})
router.get("/:tutorid", (req, res) => {
    if (req.user != null) {
        User.findOne({ where: { user_id: req.params.tutorid } })
            .then(tutor => {
                if (tutor.user_id == req.user.user_id) {
                    res.render("schedule/myschedule", {
                        tutor_id: req.params.tutorid,
                        user: req.user.dataValues,

                    })
                } else {
                    res.redirect("/")
                }
            })
    } else {
        res.redirect("/")
    }
    //validate whether req iser is the same
})

router.post("/makeavailable_entry/:tutorid", async(req, res) => {
    calendarId = req.body.id
    date = req.body.date
    dateParsed = new Date(Date.parse(date))
    starttime = req.body.starttime
    endtime = req.body.endtime
    console.log("this is makeavailable", starttime, endtime, dateParsed)
    if (starttime == "" || endtime == "") {
        console.log("alertings")
        await alertMessage(res, 'danger', 'please select a date, start time & end time', 'fas fa-exclamation-triangle', true)
    } else {
        sqlFormstartdate = new Date(dateParsed.setHours(starttime)) //.toISOString().slice(0, 19).replace('T', ' ')
        sqlFormstartdateOffsetted = new Date(sqlFormstartdate.setMinutes(sqlFormstartdate.getMinutes() - sqlFormstartdate.getTimezoneOffset())).toISOString().slice(0, 19).replace('T', ' ')
        sqlFormenddate = new Date(dateParsed.setHours(endtime)) //.toISOString().slice(0, 19).replace('T', ' ')
        sqlFormenddateOffsetted = new Date(sqlFormenddate.setMinutes(sqlFormenddate.getMinutes() - sqlFormenddate.getTimezoneOffset())).toISOString().slice(0, 19).replace('T', ' ')
        console.log("Going into makeavailable router")
        if (starttime == 9 && endtime == 0) {
            //make available full day
            Calendar.destroy({
                where: {
                    userUserId: req.params.tutorid,
                    startdate: {
                        [Op.substring]: new Date(sqlFormenddateOffsetted).toISOString().slice(0, 10)
                    }
                }
            }).then(calendar => {
                Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(parseInt(starttime)), enddate: new Date(sqlFormstartdateOffsetted).setHours(parseInt(endtime)), userUserId: req.params.tutorid })

            })
            res.send("succesfully created")
        } else { //the date format isnt the same as mysql
            Calendar.findAll({
                    where: {
                        userUserId: req.params.tutorid,
                        startdate: {
                            [Op.substring]: new Date(sqlFormenddateOffsetted).toISOString().slice(0, 10)
                        }
                    }
                })
                .then(calendars => {
                    availability = { '9': 'break', '10': "break", '11': 'break', '12': "break", "13": "break", "14": "break", "15": "break", "16": "break", "17": "break", "18": "break", "19": "break", "20": "break", "21": "break", "22": "break", "23": "break" }
                        // console.log("this is all rows associated", calendars)
                    theRange = range(parseInt(endtime) - parseInt(starttime), parseInt(starttime))
                    for (i in theRange) {
                        console.log(theRange[i])
                        availability[theRange[i]] = "Available"
                    }
                    console.log(availability)

                    calendarparsed = JSON.parse(JSON.stringify(calendars, null, 2))
                    console.log(calendarparsed)
                        //filling up the availability dictionary
                    for (i in calendarparsed) {
                        // console.log("this is i", calendarparsed[i])
                        // console.log(":sidhs", calendarparsed[i].category)
                        if (calendarparsed[i].category == "Available") {
                            startTimeInt = new Date(Date.parse(calendarparsed[i].startdate)).getHours()
                            console.log("this is starttimeint", startTimeInt)
                            checkendtimedate = new Date(Date.parse(calendarparsed[i].enddate))
                            checkendtimeoffset = new Date(checkendtimedate.setMinutes(checkendtimedate.getMinutes()))
                            console.log(checkendtimeoffset)


                            endtimeInt = new Date(Date.parse(calendarparsed[i].enddate)).getHours() == 0 ? 24 : new Date(Date.parse(calendarparsed[i].enddate)).getHours();
                            console.log("this is endtimeint", endtimeInt)
                            console.log("this is endtime", endtimeInt, endtimeInt - startTimeInt)

                            theRange = range(endtimeInt - startTimeInt, startTimeInt)
                            for (i in theRange) {
                                console.log(theRange[i])
                                availability[theRange[i]] = "Available"
                            }
                            // endtimeIntOffsetted = new Date(endtimeInt.setMinutes(endtimeInt.getMinutes() - endtimeInt.getTimezoneOffset()))
                            //     // console.log("this is startTimeINoffseted", startTimeIntOffsetted)
                            // console.log("this is startTimeINoffseted hsours", endtimeIntOffsetted)

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



                    //slicing the front and back if there are breaks
                    associativeArray = Object.keys(availability)
                    console.log("before delete associativearray", associativeArray)
                    while (availability[associativeArray[0]] == 'break') {
                        delete availability[associativeArray[0]]
                        indexOfElement = associativeArray.indexOf(associativeArray[0])
                            // console.log("indexofelement", indexOfElement)
                        if (indexOfElement > -1) {
                            associativeArray.splice(indexOfElement, 1);
                        }

                    }
                    //length - 1 to get the last index
                    console.log("after before break", associativeArray[associativeArray.length - 1], availability[associativeArray[associativeArray.length - 1]])
                    while (availability[associativeArray[associativeArray.length - 1]] == 'break') {
                        delete availability[associativeArray[associativeArray.length - 1]]
                        indexOfElement = associativeArray.indexOf(associativeArray[associativeArray.length - 1])
                        if (indexOfElement > -1) {
                            associativeArray.splice(indexOfElement, 1);
                        }
                    }
                    console.log("after trimming", availability)
                        //we can delete all the entries on the date, assuming that the current availability is updated the latest one. 
                    Calendar.destroy({
                        where: {
                            userUserId: req.params.tutorid,
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
                                            await Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else { //this the one with booking, hence must open up array
                                            console.log("this will be startdate for booking", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange))

                                            await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
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
                                            await Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else {
                                            console.log("this will be startdate for booking", new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange))
                                            console.log("this is tuteeId", availability[key - 1][1])
                                            await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })
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
                                            await Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else if (availability[key - 1] == "Available") {
                                            await Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                                        } else { //this is if theres same session
                                            await Calendar.create({ category: availability[key - 1][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[key - 1][1], booking_id: availability[key - 1][2] })

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
                                Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                            } else if (currentCategory == "Available") {
                                Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
                            } else {
                                Calendar.create({ category: availability[Object.keys(availability)[Object.keys(availability).length - 1]][0], startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid, tuteeId: availability[Object.keys(availability)[Object.keys(availability).length - 1]][1], booking_id: availability[Object.keys(availability)[Object.keys(availability).length - 1]][2] })
                            }
                        }
                        res.send("this has been hell")
                    })
                })
                // console.log("substring", new Date(sqlFormenddateOffsetted).toISOString().slice(0, 10))

            //         //utilizing a dictionary from 9 am to 12 am midnight 
            //retrieve all the rows of the same date
            // Calendar.findAll({
            //         where: {
            //             userUserId: req.params.tutorid,
            //             startdate: {
            //                 [Op.substring]: new Date(sqlFormenddateOffsetted).toISOString().slice(0, 10)
            //             }
            //         }
            //     })
            //     .then(calendars => {
            //         availability = { '9': 'break', '10': "break", '11': 'break', '12': "break", "13": "break", "14": "break", "15": "break", "16": "break", "17": "break", "18": "break", "19": "break", "20": "break", "21": "break", "22": "break", "23": "break" }
            //         calendarparsed = JSON.parse(JSON.stringify(calendars, null, 2))
            //             //filling up the availability dictionary
            //         for (i in calendarparsed) {

            //             if (calendarparsed[i].category == "Available") {
            //                 startTimeInt = new Date(Date.parse(calendarparsed[i].startdate)).getHours()
            //                 checkendtimedate = new Date(Date.parse(calendarparsed[i].enddate))
            //                 checkendtimeoffset = new Date(checkendtimedate.setMinutes(checkendtimedate.getMinutes()))

            //                 endtimeInt = new Date(Date.parse(calendarparsed[i].enddate)).getHours() == 0 ? 24 : new Date(Date.parse(calendarparsed[i].enddate)).getHours();
            //                 theRange = range(endtimeInt - startTimeInt, startTimeInt)
            //                 for (i in theRange) {
            //                     console.log(theRange[i])
            //                     availability[theRange[i]] = "Available"
            //                 }
            //             }
            //         }


            //         //filling in the breaks do a check if statement if the rest of the days are break or not if it is then dont need to create a break entry into mysql
            //         theRange = range(parseInt(endtime) - parseInt(starttime), parseInt(starttime))
            //         for (i in theRange) {
            //             availability[theRange[i]] = "Available"
            //         }
            //         associativeArray = Object.keys(availability)
            //         while (availability[associativeArray[0]] == 'break') {
            //             delete availability[associativeArray[0]]
            //             indexOfElement = associativeArray.indexOf(associativeArray[0])
            //             if (indexOfElement > -1) {
            //                 associativeArray.splice(indexOfElement, 1);
            //             }

            //         }
            //         //length - 1 to get the last index
            //         while (availability[associativeArray[associativeArray.length - 1]] == 'break') {
            //             delete availability[associativeArray[associativeArray.length - 1]]
            //             indexOfElement = associativeArray.indexOf(associativeArray[associativeArray.length - 1])
            //             if (indexOfElement > -1) {
            //                 associativeArray.splice(indexOfElement, 1);
            //             }
            //         }
            //         Calendar.destroy({
            //             where: {
            //                 userUserId: req.params.tutorid,
            //                 startdate: {
            //                     [Op.substring]: new Date(sqlFormenddateOffsetted).toISOString().slice(0, 10)
            //                 }
            //             }
            //         }).then(calendar => {

            //             console.log("this is deleted", calendar)
            //             ignore = true
            //             theStartOfRange = 0
            //             theEndOfRange = 0
            //             doingBreak = false
            //             for (var key in availability) {
            //                 if (availability[key] == "break" && ignore == true) {
            //                     continue
            //                 } else if (availability[key] == "break" && ignore == false) {
            //                     if (doingBreak == false) {
            //                         //create an available entry
            //                         if (theStartOfRange != 0) {
            //                             Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
            //                         }
            //                         //reset the ranges
            //                         theStartOfRange = 0
            //                         theEndOfRange = 0
            //                         doingBreak = true
            //                     }
            //                     if (theStartOfRange != 0) {
            //                         theEndOfRange += 1
            //                             // console.log("thje emdtofrange for break", theEndOfRange)

            //                     } else {
            //                         theStartOfRange = parseInt(key)
            //                         theEndOfRange = parseInt(key) + 1
            //                             // console.log("thje startofrange for break", theStartOfRange)
            //                     }
            //                 } else if (availability[key] == "Available") {
            //                     ignore = false
            //                     if (doingBreak == true) {
            //                         //create break entry 
            //                         if (theStartOfRange != 0) {
            //                             Calendar.create({ category: "break", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
            //                         }
            //                         theStartOfRange = 0
            //                         theEndOfRange = 0
            //                         doingBreak = false
            //                     }
            //                     if (theStartOfRange != 0) {
            //                         theEndOfRange += 1
            //                     } else {
            //                         theStartOfRange = parseInt(key)
            //                         theEndOfRange = parseInt(key) + 1
            //                     }

            //                 }
            //             }
            //             if (theStartOfRange != 0) {
            //                 Calendar.create({ category: "Available", startdate: new Date(sqlFormstartdateOffsetted).setHours(theStartOfRange), enddate: new Date(sqlFormstartdateOffsetted).setHours(theEndOfRange), userUserId: req.params.tutorid })
            //             }
            //             res.send("this has been hell")
            //         })
            //     })
        }
    }
})

router.get("/bookavailableslot/:tutorid/:courseid", (req, res) => {
    if (!req.user) {
        alertMessage(res, 'danger', 'Please log into an account to book', 'fas fa-exclamation-triangle', true)
        res.redirect('/login')
    } else {
        res.render("schedule/bookslot", {
            tutor_id: req.params.tutorid,
            course_id: req.params.courseid
        })
    }

})

router.get("/fetchAllSession/:tutorid/:courseid", (req, res) => {
    console.log("fetching all session")
    Session.findAll({ where: { courseListingCourseId: req.params.courseid }, raw: true, order: ['session_no'] })
        .then(sessions => {
            console.log("fetched these sessions", sessions)
            res.send(sessions)
        }).catch(err => console.log(err))
})


router.get("/sessionInfo/:tutorid/:bookingid", async(req, res) => {
    console.log("this is boookig id", req.params.bookingid)
    Booking.findOne({ where: { Booking_id: req.params.bookingid } }).then(booking => {
        console.log("this is booking", booking)
        bookingParsed = JSON.parse(JSON.stringify(booking, null, 2))
        console.log("this is bookingPArsed", bookingParsed)
        res.send(bookingParsed)
    }).catch(err => console.log(err))
})

router.post("/updateMeetingLink/:bookingId", async(req, res) => {
    var valid = /^(ftp|http|https):\/\/[^ "]+$/.test(req.body.meetingLink);
    if (valid == true) {
        console.log("this is updatemeetinglink", req.body.meetingLink)
        Booking.findOne({ where: { Booking_id: req.params.bookingId } }).then(booking => {
            // console.log("booking found", booking)
            booking.update({ meetingLink: req.body.meetingLink }).then(booking => {
                res.send("meeting Link updated")
                console.log("meetinglink updated", booking)
            })
        })
    } else {
        // alertMessage(res, 'danger', 'invalid Meeting link', 'fas fa-exclamation-triangle', true)
        res.send("meeting link invalid")
    }


})

router.get("/user/:userid", (req, res) => {
    res.render("schedule/usermyschedule")
})

router.get("/fetchbookings/:userid", (req, res) => {
    Calendar.findAll({ where: { tuteeId: req.params.userid } }).then(bookings => {
        bookingsParsed = JSON.parse(JSON.stringify(bookings, null, 2))
        console.log("this is bookingssssPArsed", bookingsParsed)
        res.send(bookingsParsed)
    })
})
module.exports = router;