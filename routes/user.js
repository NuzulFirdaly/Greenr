const express = require('express');
const CourseListing = require('../models/CoursesListing');
const router = express.Router();
const upload = require('../helpers/backgroundUpload')
const profupload = require('../helpers/imageUploads');
const User = require('../models/User');
const alertMessage = require('../helpers/messenger');
const ensureAuthenticated = require('../helpers/auth');
// router.get('/viewProfile/:id', async(req, res) => {
//     var id = req.params.id;
//     var tutor = await User.findOne({ where: { user_id: id } });
//     var extra = await professionalProfile.findOne({ where: { userUserId: id } });
//     var affiliation = await Institution.findOne({ where: { institution_id: tutor.institutionInstitutionId } });
//     console.log(affiliation);
//     if (req.user) {
//         if (id === req.user.dataValues.user_id) { res.redirect('/user/Settings'); } else {
//             if (tutor.AccountTypeID == 1) {
//                 tutor_id = id;
//                 var courses = await CourseListing.findAll({ where: { userUserId: tutor_id }, raw: true })
//                 res.render('user/viewProfile', {
//                     layout: 'userFunctions',
//                     tutor: tutor.dataValues,
//                     coursesarray: courses,
//                     extra: extra.dataValues,
//                     affiliation
//                 })

//             } else {
//                 res.render('user/viewProfile', {
//                     layout: 'userFunctions',
//                     tutor: tutor.dataValues,
//                     extra: extra.dataValues,
//                     affiliation
//                 });
//             }
//         }
//     } else {
//         if (tutor.AccountTypeID == 1) {
//             tutor_id = id;
//             var courses = await CourseListing.findAll({ where: { userUserId: tutor_id }, raw: true })
//             res.render('user/viewProfile', {
//                 layout: 'userFunctions',
//                 tutor: tutor.dataValues,
//                 coursesarray: courses,
//                 extra: extra.dataValues,
//                 affiliation
//             })

//         } else {
//             res.render('user/viewProfile', {
//                 layout: 'userFunctions',
//                 tutor: tutor.dataValues,
//                 extra: extra.dataValues,
//                 affiliation
//             });
//         }
//     }
// })

router.get('/Settings', ensureAuthenticated, async(req, res) => {
    if (req.user !== null) {
        // var extra = await professionalProfile.findOne({ where: { userUserId: req.user.dataValues.user_id } });
        // var affiliation = await Institution.findOne({ where: { institution_id: req.user.dataValues.institutionInstitutionId } });
        // console.log("I am cow", affiliation);
        if (req.user.AccountTypeID == 1) {
            tutor_id = req.user.dataValues.user_id;
            CourseListing.findAll({
                    where: { userUserId: tutor_id },
                    raw: true
                })
                .then((courses) => {
                    var cart = Object.keys(req.session.cart).length;
                    console.log(courses);
                    res.render('user/Settings', {
                        layout: 'userFunctions',
                        user: req.user.dataValues,
                        coursesarray: courses,
                        cart: cart
                            // extra: extra.dataValues,
                            // affiliation
                    })
                });
        } else {
            res.render('user/Settings', {
                layout: 'userFunctions',
                user: req.user.dataValues,
                // extra: extra.dataValues,
                // affiliation
            });
        }
    }
});

router.get('/editProfile', ensureAuthenticated, async(req, res) => {
    if (req.user !== null) {
        //     var extra = await professionalProfile.findOne({ where: { userUserId: req.user.dataValues.user_id } });
        //     var affiliation = await Institution.findOne({ where: { institution_id: req.user.dataValues.institutionInstitutionId } });

        if (req.user.AccountTypeID == 1) {
            if (req.user.InstitutionName !== null) {
                tutor_id = req.user.dataValues.user_id;
                CourseListing.findAll({
                        where: { userUserId: tutor_id },
                        raw: true
                    })
                    .then((courses) => {

                        console.log(courses);
                        res.render('user/editProfile', {
                            layout: 'userFunctions',
                            user: req.user.dataValues,
                            coursesarray: courses,
                            // extra: extra.dataValues,
                            // affiliation
                        })
                    });

            } else {
                tutor_id = req.user.dataValues.user_id;
                CourseListing.findAll({
                        where: { userUserId: tutor_id },
                        raw: true
                    })
                    .then((courses) => {

                        console.log(courses);
                        res.render('user/editProfile', {
                            layout: 'userFunctions',
                            user: req.user.dataValues,
                            coursesarray: courses,
                            // extra: extra.dataValues,
                            // affiliation
                        })
                    });
            }

        } else {
            res.render('user/editProfile', {
                layout: 'userFunctions',
                user: req.user.dataValues,
                extra: extra.dataValues
            });
        }
    }
});

router.post('/backgroundUpload', (req, res) => {
    // Creates user id directory for upload if not exist
    upload(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                res.json({ file: `${req.file.filename}` });
            }
        }
    });
})

router.post('/profilePictureUpload', (req, res) => {
    // Creates user id directory for upload if not exist
    profupload(req, res, (err) => {
        if (err) {
            res.json({ file: '/img/no-image.jpg', err: err });
        } else {
            if (req.file === undefined) {
                res.json({ file: '/img/no-image.jpg', err: err });
            } else {
                res.json({ file: `${req.file.filename}` });
            }
        }
    });
})

router.post('/editProfile', async(req, res, next) => {
    let { backgroundFile, profilePicture, colorInput, firstName, lastName, description } = req.body;
    await User.findOne({ where: { user_id: req.user.dataValues.user_id } })
        .then(thisuser => {
            thisuser.update({ Profile_pic: profilePicture, FirstName: firstName, LastName: lastName, description })
        })



    // await professionalProfile.findOne({ where: { userUserId: req.user.dataValues.user_id } })
    //     .then(info => {
    //         console.log(info);
    //         if (info !== null) {
    //             info.update({ color: colorInput, background: backgroundFile })
    //         } else {
    //             professionalProfile.create({ color: colorInput, background: backgroundFile, userUserId: req.user.dataValues.user_id })
    //         }
    //     })
    alertMessage(res, 'success', 'Profile updated', 'fas fa-check', true);
    res.redirect("/user/Settings");
});

module.exports = router;