const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');

/* models */
const Course = require('../models/CoursesListing');
const Lessons = require('../models/Lessons')
const User = require('../models/User')

const alertMessage = require('../helpers/messenger');
const passport = require('passport');
const { session } = require('passport');
const CourseListing = require('../models/CoursesListing');

const { body, validationResult } = require('express-validator');

const courseThumbnailUpload = require('../helpers/thumbnailUploads');
const RateReview = require('../models/RateReview');
const ensureAuthenticated = require('../helpers/auth');


//change this to database where admin can add
categories = {
        'GRAPHIC DESIGN': ['LOGO DESIGN', 'BRAND STYLE GUIDES', 'GAME ART', 'RESUME DESIGN'],
        'DIGITAL MARKETING': ['SOCIAL MEDIA ADVERTISING', 'SEO', 'PODCAST MARKETING', 'SURVEY', 'WEB TRAFFIC'],
        'WRITING & TRANSLATION': ['ARTICLES & BLOG POSTS'],
        'PROGRAMMING & TECH': ['WEB PROGRAMMING', 'E-COMMERCE DEVELOPMENT', 'MOBILE APPLS', 'DESKTOP APPLICATIONS', 'DATABASES', 'USER TESTING']
    }
    //a route so that our createcourse select field can fetch the data
router.get("/category/:category", (req, res) => {
    choicesArray = categories[req.params.category]
    res.end(JSON.stringify({ "subcategories": choicesArray }));
});
router.get("/CreateCourse", (req, res) => {
    // console.log(req.user.AccountTypeID)
    if (((req.user != null) && (req.user.AccountTypeID == 1)) && (req.user.AccountTypeID == 1)) {
        res.render("course/coursecreation", {
            user: req.user.dataValues, //have to do this for all pages
        })
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };

});

router.post("/courseThumbnailUpload", (req, res) => {
    courseThumbnailUpload(req, res, async(err) => {
        console.log("profile picture upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                res.json({ err: err });
            } else {
                res.json({ file: `${req.file.filename}`, path: '/images/coursethumbnails/' + `${req.file.filename}` });
                //check to see if the course record exist or not if so just update it with the new picture
                // await Pending.findOne({where: {user_id:  req.user.user_id } }).then(user => {
                //     user.update({cert:req.file.filename})
                // })
            }
        }
    });
})
router.post("/CreateCourse", [
    body('coursetitle').not().isEmpty().trim().escape().withMessage("Course Title is invalid"),
    body('courseThumbnailUpload').not().isEmpty().trim().escape().withMessage("please select a course thumbnail"),
    body('trueFileName').not().isEmpty().trim().escape().withMessage("please select a course thumbnail"),
    body('short_description').not().isEmpty().withMessage("Short description is invalid").isLength({ max: 100 }).withMessage("Short description too long, Must be below 100 characters"),
    body('description').not().isEmpty().withMessage("description is invalid").isLength({ min: 100, max: 2500 }).withMessage("Description must be between 100 to 2500 characters"),
    body('category').not().isEmpty().trim().escape().withMessage("please select a category"),
    body('subcategory').not().isEmpty().trim().escape().withMessage("subcategory is invalid")
], async(req, res) => {
    console.log(req.body);
    let { coursetitle, category, subcategory, short_description, description, courseThumbnailUpload, trueFileName } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render("course/coursecreation", {
            coursetitle,
            category,
            subcategory,
            short_description,
            description,
            courseThumbnailUpload,
            trueFileName,
            user: req.user.dataValues, //have to do this for all pages
            errors
        })
    } else {
        userid = req.user.dataValues.user_id;
        console.log(userid)
            //check if course with the same name has been created
        Course.findOne({ where: { title: coursetitle } }).then(course => {
            if (course !== null) {
                errors.push({ text: "There already exists a course with the same name, please think of unique title!" })
                res.render("course/coursecreation", {
                    user: req.user.dataValues, //have to do this for all pages
                    errors
                })

            } else {
                if (req.user.institutionInstitutionId != null) {
                    Course.create({ Title: coursetitle, Category: category, Subcategory: subcategory, Short_description: short_description, Description: description, userUserId: userid, Course_thumbnail: trueFileName, institutionInstitutionId: req.user.institutionInstitutionId })
                        .then(course => {
                            alertMessage(res, 'success', course.Title + ` added. \n Course will be displayed under your institution's page`, 'fas fa-check', true);
                            res.redirect('/course/CreateSession/' + course.course_id);
                        })
                        .catch(err => console.log(err));

                } else {
                    Course.create({ Title: coursetitle, Category: category, Subcategory: subcategory, Short_description: short_description, Description: description, userUserId: userid, Course_thumbnail: trueFileName })
                        .then(course => {
                            alertMessage(res, 'success', course.Title + ' added.', 'fas fa-sign-in-alt', true);
                            res.redirect('/course/CreateSession/' + course.course_id);
                        })
                        .catch(err => console.log(err));
                }
            }
        })
    }
});

router.get("/CreateSession/:courseid", (req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 1)) {
        course_id = req.params.courseid
            //raw: true need because we dont want other attributes like _previousdatavalue
        Lessons.findAll({
            where: { courseListingCourseId: course_id },
            raw: true,
            order: [
                ['session_no', 'ASC']
            ]
        })

        //lessons are all the lessons from the course id(return multiple lessons)
        .then((lessons) => {
            res.render("course/sessioncreation", {
                sessionarray: lessons,
                course_id: course_id,
                user: req.user.dataValues,
            })
        });
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };
})

// await PendingTutor.findOne({where:{ userUserId: req.user.user_id}}).then(pendingticket =>{
//     if(pendingticket !== null){
//         res.redirect('/tutor_onboarding/finish')
//     }else{
//         if ((req.user) && (req.user.AccountTypeID == 0)){
//             console.log("printing user object from tutoronboarding");
//             console.log(req.user);
//             res.render('tutor_onboarding/personal_info', {
//                 layout: 'tutor_onboarding_base',
//                 user: req.user.dataValues,
//             });
//         }
//         else{
//             res.redirect("/")
//         };
//     }
// })

router.post("/CreateSession/:courseid", async(req, res) => {
    await Lessons.findAll({
            where: { courseListingCourseId: req.params.courseid },
            raw: true,
            order: [
                ['session_no', 'ASC']
            ]
        })
        //lessons are all the lessons from the course id(return multiple lessons)
        .then((lessons) => {
            let errors = [];
            console.log('this is lesson query in createsession post')
            console.log(lessons)
            console.log(lessons.length)
            if (lessons.length === 0) {
                errors.push({ text: "You must have at least 1 session" })
                res.render('course/sessioncreation', {
                    errors,
                    course_id: req.params.courseid,
                    user: req.user.dataValues
                })
            } else {
                if ((req.user) && (req.user.AccountTypeID == 1)) {
                    res.redirect(301, '/course/addpricing/' + req.params.courseid)
                } else {
                    res.redirect("/")
                }
                //render session and push error saying need to have 1 cost
            }
        })

    // if (((req.user != null) && (req.user.AccountTypeID == 1)) && (req.user.AccountTypeID == 1)){
    //     course_id = req.params.courseid
    //     console.log(course_id)
    //     //raw: true need because we dont want other attributes like _previousdatavalue
    //     Lessons.findAll({where: {courseListingCourseId: course_id}, raw: true, order:[['session_no', 'ASC']]})

    //     //lessons are all the lessons from the course id(return multiple lessons)
    //     .then((lessons)=> {
    //         console.log(lessons)
    //         res.render("course/sessioncreation",{
    //             sessionarray : lessons,
    //             course_id : course_id,
    //             user:req.user.dataValues,
    //         })
    //   });
    // }
    // else{
    //     res.redirect("/")
    // };
    //check whether the user has a session or not if not dont let them go to the pricing

})

router.get("/addnewlesson/:courseid", (req, res) => {
    if (((req.user != null) && (req.user.AccountTypeID == 1)) && (req.user.AccountTypeID == 1)) {
        res.render("course/addnewlesson", {
            course_id: req.params.courseid,
            user: req.user.dataValues,
        })
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };

})
router.post("/addnewlesson/:courseid", [
    body('title').not().isEmpty().withMessage("Session Title is invalid"),
    body('session_description').not().isEmpty().withMessage("Session Title is invalid"),
    body('time_approx').not().isEmpty().withMessage("Session Title is invalid")
], (req, res) => {
    let { title, session_description, time_approx } = req.body
    let errors = [];
    sessioncount = 0
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render(`course/addnewlesson/${req.params.courseid}`, {
            user: req.user.dataValues, //have to do this for all pages
            errors
        })
    } else {
        //to get the current count
        Lessons.findAll({
                where: { courseListingCourseId: req.params.courseid },
                raw: true,
                order: [
                    ['session_no', 'ASC']
                ]
            })
            //lessons are all the lessons from the course id(return multiple lessons)
            .then((lessons) => {
                console.log(lessons)
                sessioncount = lessons.length
                console.log("printing session count")
                console.log(sessioncount)
                console.log("Going to create session now")
                Lessons.create({ session_no: sessioncount + 1, session_title: title, session_description: session_description, time_approx: time_approx, courseListingCourseId: req.params.courseid })
                    .then(lesson => {
                        console.log("succesfully create session redirecting now")
                        alertMessage(res, 'success', lesson.session_title + ' added.', 'fas fa-sign-in-alt', true);
                        res.redirect(301, '/course/CreateSession/' + req.params.courseid)
                    })
            });
    }

})

function* enumerate(it, start = 1) {
    let i = start
    for (const x of it) {
        yield [i++, x]
    }
}

router.post("/deletelesson/:courseid/:sessionno", (req, res) => {
    Lessons.findAll({
            where: { courseListingCourseId: req.params.courseid },
            raw: true,
            order: [
                ['session_no', 'ASC']
            ]
        })
        .then(lessons => {
            //deleting lesson with session no
            console.log(lessons)
            Lessons.destroy({ where: { session_no: req.params.sessionno } }).then(function() {
                //updating all lessons number
                Lessons.findAll({
                        where: { courseListingCourseId: req.params.courseid },
                        raw: true,
                        order: [
                            ['session_no', 'ASC']
                        ]
                    })
                    .then(lessons => {

                        console.log("========== after delet ===========")
                        for (const [index, object] of enumerate(lessons)) {
                            console.log(index, object)
                            Lessons.findOne({ where: { session_id: object.session_id } })
                                .then(lesson => {
                                    lesson.update({ session_no: index })
                                })
                        }
                        res.redirect(301, "/course/CreateSession/" + req.params.courseid)
                    })
            })


        })

})
router.get("/addpricing/:courseid", (req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 1)) {
        course_id = req.params.courseid
        console.log(course_id)
        Lessons.findAll({
                where: { courseListingCourseId: course_id },
                raw: true,
                order: [
                    ['session_no', 'ASC']
                ]
            })
            //lessons are all the lessons from the course id(return multiple lessons)
            .then((lessons) => {
                sessioncount = lessons.length;
                let totalhours = 0
                for (let i = 0; i < sessioncount; i++) {
                    totalhours += parseInt(lessons[i].time_approx)
                }
                res.render("course/addpricing", {
                    sessionarray: lessons,
                    course_id: course_id,
                    user: req.user.dataValues,
                    sessioncount: sessioncount,
                    totalhours
                })
            });
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };
})

router.post("/addnewpricing/:courseid", (req, res) => {
    let { hourlyrate, minimumdays, maximumdays } = req.body;
    CourseListing.update({
            Hourlyrate: hourlyrate,
            Maximumdays: maximumdays,
            Minimumdays: minimumdays,
        }, { where: { course_id: req.params.courseid } })
        .then(course => {
            console.log(course)
            res.redirect(301, "/course/mycourses")
        })
});

router.get("/mycourses", (req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 1)) {
        tutor_id = req.user.dataValues.user_id;
        CourseListing.findAll({
                where: { userUserId: tutor_id },
                raw: true
            })
            .then((courses) => {

                console.log(courses);
                res.render("course/mycourses", {
                    user: req.user.dataValues,
                    userobject: req.user.dataValues,
                    coursesarray: courses
                })
            });
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };
});

//associationze.UUID, allowNull: false }});


router.get("/viewcourse/:courseid", async(req, res) => {
    console.log("we are at view course now")
    courseid = req.params.courseid;
    await CourseListing.findAll({
            where: { course_id: courseid },
            include: [Lessons, User],
            order: [
                [Lessons, 'session_no', 'ASC']
            ]
        })
        .then(course => {
            console.log("THIS IS COURSE NUZULLLLLLLL")
            console.log(course)
            console.log("this is course user", course[0].user) //checking if tutor created the course
            if (req.user) {
                if (course[0].user.user_id == req.user.user_id) {
                    console.log("*****************wtfsfsdf sf???")
                    res.redirect('/course/updatecourse/' + req.params.courseid)
                } else {
                    RateReview.findAll({ where: { CourseId: courseid }, include: [User] })
                        .then(ratereviews => {
                            RateReview.findAll({
                                    where: { CourseId: courseid },
                                    attributes: [
                                        [Sequelize.fn('avg', Sequelize.col('Rating')), 'avgRating']
                                    ],
                                    raw: true,
                                })
                                .then(async function(avgRating) {
                                    if (!avgRating) {
                                        avgRating = 0;
                                    }

                                    if (req.user) {
                                        console.log("ymca")
                                        console.log(req.user.user_id)
                                        await RateReview.findOne({ where: { CourseId: courseid, UserId: req.user.user_id }, include: [User] })
                                            .then(yourRateReview => {
                                                console.log('gjfdjgjldfgj')
                                                course = JSON.parse(JSON.stringify(course, null, 2))[0]
                                                yourRateReview = yourRateReview
                                                if (yourRateReview) {
                                                    console.log("kms")
                                                    console.log(JSON.parse(JSON.stringify(ratereviews, null, 2)))
                                                    res.render("course/viewcourse", {
                                                        users: req.user.dataValues, //have to do this for all pages
                                                        course,
                                                        avgRating: avgRating[0].avgRating,
                                                        yourRateReview: yourRateReview.dataValues,
                                                        ratereviews: JSON.parse(JSON.stringify(ratereviews, null, 2))
                                                    })
                                                } else {
                                                    console.log(JSON.parse(JSON.stringify(ratereviews, null, 2)))
                                                    console.log(ratereviews)
                                                    console.log(avgRating)
                                                    console.log("yopopropr")
                                                    res.render("course/viewcourse", {
                                                        users: req.user.dataValues, //have to do this for all pages
                                                        course,
                                                        avgRating: avgRating[0].avgRating,
                                                        ratereviews: JSON.parse(JSON.stringify(ratereviews, null, 2))
                                                    })
                                                }
                                            })
                                            .catch(error => console.log(error));
                                    } else { // console.log(course);
                                        course = JSON.parse(JSON.stringify(course, null, 2))[0]
                                        res.render("course/viewcourse", {
                                            course: course,
                                            avgRating: avgRating[0].avgRating,
                                            ratereviews: JSON.parse(JSON.stringify(ratereviews, null, 2))
                                        })

                                    }

                                });
                        })
                }
            } else {
                RateReview.findAll({ where: { CourseId: courseid }, include: [User] })
                    .then(ratereviews => {
                        RateReview.findAll({
                                where: { CourseId: courseid },
                                attributes: [
                                    [Sequelize.fn('avg', Sequelize.col('Rating')), 'avgRating']
                                ],
                                raw: true,
                            })
                            .then(async function(avgRating) {
                                if (!avgRating) {
                                    avgRating = 0;
                                }
                                course = JSON.parse(JSON.stringify(course, null, 2))[0]
                                res.render("course/viewcourse", {
                                    course: course,
                                    avgRating: avgRating[0].avgRating,
                                    ratereviews: JSON.parse(JSON.stringify(ratereviews, null, 2))
                                })
                            })
                    })
            }
        }).catch(error => console.log(error));
})



router.get("/updatecourse/:courseid", ensureAuthenticated, (req, res) => {
    courseid = req.params.courseid
    CourseListing.findAll({
            where: { course_id: courseid },
            include: [Lessons, User],
            order: [
                [Lessons, 'session_no', 'ASC']
            ]
        })
        .then(course => {
            if (course[0].user.user_id != req.user.user_id) {
                res.redirect('/course/viewcourse/' + courseid)
            } else {
                // console.log(course);
                console.log("====== update course==========")
                    // console.log(JSON.stringify(course, null, 2))
                course = JSON.parse(JSON.stringify(course, null, 2))[0]
                console.log(course)
                console.log("================")
                if ((req.user != null) && (req.user.AccountTypeID == 1)) {
                    res.render("course/updatecourse", {
                        user: req.user.dataValues, //have to do this for all pages
                        course
                    })
                } else {
                    alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
                    res.redirect("/")
                };

            }

        }).catch(error => console.log(error));
})

router.get("/editcourse/:courseid", (req, res) => {
    CourseListing.findOne({ where: { course_id: req.params.courseid }, raw: true })
        .then(course => {
            console.log(course);
            if ((req.user != null) && (req.user.AccountTypeID == 1)) {
                res.render("course/editcourse", {
                    user: req.user.dataValues, //have to do this for all pages
                    course: course
                })
            } else {
                alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
                res.render("/")
            };
        })
})
router.post("/editcourse/:courseid", (req, res) => {
    let { coursetitle, category, subcategory, short_description, description } = req.body;
    console.log(coursetitle, category, short_description, description)

    CourseListing.findOne({ where: { course_id: req.params.courseid } })
        .then(course => {
            course.update({ Title: coursetitle, Category: category, Subcategory: subcategory, Short_description: short_description, Description: description })
            res.redirect(301, '/course/updatecourse/' + req.params.courseid)
        })
        .catch(err => console.log(err));
})

//get editaddnewsession
router.get('/editaddnewlesson/:courseid', (req, res) => {
        if ((req.user != null) && (req.user.AccountTypeID == 1)) {
            res.render("course/editaddnewlesson", {
                course_id: req.params.courseid,
                user: req.user.dataValues,
            })
        } else {
            alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
            res.redirect("/")
        };
    })
    //post editaddnewsession
router.post('/editaddnewlesson/:courseid', [
    body('title').not().isEmpty().withMessage("Session Title is invalid"),
    body('session_description').not().isEmpty().withMessage("Session Title is invalid"),
    body('time_approx').not().isEmpty().withMessage("Session Title is invalid")
], (req, res) => {
    let { title, session_description, time_approx } = req.body
    let errors = [];
    sessioncount = 0
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render(`course/editaddnewlesson/${req.params.courseid}`, {
            user: req.user.dataValues, //have to do this for all pages
            errors
        })
    } else {
        //to get the current count
        Lessons.findAll({
                where: { courseListingCourseId: req.params.courseid },
                raw: true,
                order: [
                    ['session_no', 'ASC']
                ]
            })
            //lessons are all the lessons from the course id(return multiple lessons)
            .then((lessons) => {
                console.log(lessons)
                sessioncount = lessons.length
                console.log("printing session count")
                console.log(sessioncount)
                console.log("Going to create session now")
                Lessons.create({ session_no: sessioncount + 1, session_title: title, session_description: session_description, time_approx: time_approx, courseListingCourseId: req.params.courseid })
                    .then(lesson => {
                        console.log("succesfully create session redirecting now")
                        alertMessage(res, 'success', lesson.session_title + ' added.', 'fas fa-sign-in-alt', true);
                        res.redirect(301, '/course/editlesson/' + req.params.courseid)
                    })
            });
    }

})

router.get("/editlesson/:courseid", (req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 1)) {
        course_id = req.params.courseid
        console.log(course_id)
            //raw: true need because we dont want other attributes like _previousdatavalue
        Lessons.findAll({
            where: { courseListingCourseId: course_id },
            raw: true,
            order: [
                ['session_no', 'ASC']
            ]
        })

        //lessons are all the lessons from the course id(return multiple lessons)
        .then((lessons) => {
            console.log(lessons)
            res.render("course/editlesson", {
                lessons,
                course_id: course_id,
                user: req.user.dataValues,
            })
        });
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };
});

router.post("/editlesson/:courseid", async(req, res) => {
    await Lessons.findAll({
            where: { courseListingCourseId: req.params.courseid },
            raw: true,
            order: [
                ['session_no', 'ASC']
            ]
        })
        //lessons are all the lessons from the course id(return multiple lessons)
        .then((lessons) => {
            let errors = [];
            console.log('this is lesson query in createsession post')
            console.log(lessons)
            console.log(lessons.length)
            if (lessons.length === 0) {
                errors.push({ text: "You must have at least 1 session" })
                res.render('course/editlesson', {
                    errors,
                    course_id: req.params.courseid,
                    user: req.user.dataValues
                })
            } else {
                if ((req.user) && (req.user.AccountTypeID == 1)) {
                    res.redirect(301, '/course/editpricing/' + req.params.courseid)
                } else {
                    alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
                    res.redirect("/")
                }
                //render session and push error saying need to have 1 cost
            }
        })
})
router.get("/editpricing/:courseid", (req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 1)) {
        course_id = req.params.courseid
        console.log(course_id)
        Lessons.findAll({
                where: { courseListingCourseId: course_id },
                raw: true,
                order: [
                    ['session_no', 'ASC']
                ]
            })
            //lessons are all the lessons from the course id(return multiple lessons)
            .then((lessons) => {
                sessioncount = lessons.length;
                let totalhours = 0
                for (let i = 0; i < sessioncount; i++) {
                    totalhours += parseInt(lessons[i].time_approx)
                }
                res.render("course/editpricing", {
                    sessionarray: lessons,
                    course_id: course_id,
                    user: req.user.dataValues,
                    sessioncount: sessioncount,
                    totalhours
                })
            });
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };
})

router.post("/editdeletesession/:courseid/:sessionno", (req, res) => {
    Lessons.findAll({
            where: { courseListingCourseId: req.params.courseid },
            raw: true,
            order: [
                ['session_no', 'ASC']
            ]
        })
        .then(lessons => {
            //deleting lesson with session no
            console.log(lessons)
            Lessons.destroy({ where: { session_no: req.params.sessionno } }).then(function() {
                //updating all lessons number
                Lessons.findAll({
                        where: { courseListingCourseId: req.params.courseid },
                        raw: true,
                        order: [
                            ['session_no', 'ASC']
                        ]
                    })
                    .then(lessons => {

                        console.log("========== after delet ===========")
                        for (const [index, object] of enumerate(lessons)) {
                            console.log(index, object)
                            Lessons.findOne({ where: { session_id: object.session_id } })
                                .then(lesson => {
                                    lesson.update({ session_no: index })
                                })
                        }
                        res.redirect(301, "/course/editlesson/" + req.params.courseid)
                    })
            })
        })
});

router.post("/deletecourse/:courseid", (req, res) => {
    console.log("deleting course")
    CourseListing.destroy({ where: { course_id: req.params.courseid } })
        .then(function() {
            res.redirect(301, '/course/mycourses')
        })
})

router.get("/updatelesson/:sessionid", (req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 1)) {
        Lessons.findOne({ where: { session_id: req.params.sessionid }, raw: true })
            .then(lesson => {
                console.log(lesson)
                res.render("course/updatesession", {
                    user: req.user.dataValues,
                    lesson

                })
            })

    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };

})

router.post("/updatelesson/:sessionid", (req, res) => {
    let { title, session_description, time_approx } = req.body;
    Lessons.findOne({ where: { session_id: req.params.sessionid } })
        .then(lesson => {
            lesson.update({ session_title: title, session_description, time_approx })
            res.redirect(301, "/course/CreateSession/" + lesson.courseListingCourseId)
        })
})
router.get("/editupdatesession/:sessionid", (req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 1)) {
        Lessons.findOne({ where: { session_id: req.params.sessionid }, raw: true })
            .then(lesson => {
                console.log(lesson)
                res.render("course/editupdatesession", {
                    user: req.user.dataValues,
                    lesson

                })
            })

    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };

})

router.post("/editupdatesession/:sessionid", (req, res) => {
    let { title, session_description, time_approx } = req.body;
    Lessons.findOne({ where: { session_id: req.params.sessionid } })
        .then(lesson => {
            lesson.update({ session_title: title, session_description, time_approx })
            res.redirect(301, "/course/editlesson/" + lesson.courseListingCourseId)
        })
})
module.exports = router;