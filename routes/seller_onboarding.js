const express = require('express');
const router = express.Router();
const path = require('path');
const { body, validationResult } = require('express-validator');

const alertMessage = require('../helpers/messenger');
const multer = require('multer'); //parser for file upload
const { url } = require('inspector');
const Tutor = require('../models/Tutor');
const PendingSeller = require('../models/PendingSeller');
const profilePictureUpload = require('../helpers/imageUploads');
const pendingcertsUpload = require('../helpers/certUpload')
const User = require('../models/User');

const ensureAuthenticated = require('../helpers/auth');

/// mfff https://stackoverflow.com/questions/53165658/what-findone-returns-when-there-is-no-match
// User -> Tutor Onboarding
router.get('/becometutor', async(req, res) => { //check if user is logged in here
    if ((req.user != null) && (req.user.AccountTypeID == 0)) {
        await PendingSeller.findOne({ where: { userUserId: req.user.user_id } }).then(pendingticket => {
            if (pendingticket !== null) {
                res.redirect('/seller_onboarding/finish')
            } else {
                if ((req.user) && (req.user.AccountTypeID == 0)) {
                    res.render('seller_onboarding/seller_onboarding', { title: "Become A Tutor!", layout: 'seller_onboarding_base', user: req.user.dataValues })
                } else {
                    alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
                    res.redirect("/")
                };
            }
        })

    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };
});

router.post("/profilePictureUpload", (req, res) => {
    profilePictureUpload(req, res, async(err) => {
        console.log("profile picture upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                res.json({ err: err });
            } else {
                res.json({ file: `${req.file.filename}`, path: '/images/profilepictures/' + `${req.file.filename}` });
                //check to see if the course record exist or not if so just update it with the new picture
                await User.findOne({ where: { user_id: req.user.user_id } }).then(user => {
                    user.update({ Profile_pic: req.file.filename })
                })
            }
        }
    });
})

router.get('/personal_info', async(req, res) => {
    if ((req.user != null) && (req.user.AccountTypeID == 0)) {
        await PendingSeller.findOne({ where: { userUserId: req.user.user_id } }).then(pendingticket => {
            if (pendingticket !== null) {
                res.redirect('/seller_onboarding/finish')

            } else {
                if ((req.user) && (req.user.AccountTypeID == 0)) {
                    res.render('seller_onboarding/personal_info', {
                        layout: 'seller_onboarding_base'
                    });
                } else {
                    alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
                    res.redirect("/")
                };
            }
        })
    } else {
        alertMessage(res, 'danger', 'You dont have access to that page!', 'fas fa-exclamation-triangle', true)
        res.redirect("/")
    };

    //checking to see whether theres already a pending ticket

});

router.post('/pendingcertUpload', (req, res) => {
    pendingcertsUpload(req, res, async(err) => {
        console.log("profile picture upload printing req.file.filename")
        console.log(req.file)
        if (err) {
            res.json({ err: err });
        } else {
            if (req.file === undefined) {
                res.json({ err: err });
            } else {
                res.json({ path: `/pendingcerts/${req.file.filename}`, file: `${req.file.filename}` });
                await Pending.findOne({ where: { user_id: req.user.user_id } }).then(user => {
                    user.update({ cert: req.file.filename })
                })
            }
        }
    });
})
router.post('/personal_info_upload', [
    body('first_name').not().isEmpty().trim().escape().withMessage("First name is invalid"),
    body('last_name').not().isEmpty().trim().escape().withMessage("Last name is invalid"),
    body('description').not().isEmpty().withMessage("description is invalid"),

], ensureAuthenticated, (req, res) => {
    //retrieve input
    //validate input
    //update record in user table
    //redirect to professional info
    console.log(req.body)
    let { first_name, last_name, description, trueFileName } = req.body;
    let errors = [];
    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })
        res.render('seller_onboarding/personal_info', {
            layout: 'seller_onboarding_base',
            user: req.user.dataValues,
            errors

        });
    } else {
        User.findOne({ where: { user_id: req.user.user_id } }).then(user => {
            user.update({ FirstName: first_name, LastName: last_name, description: description })
        })
        userid = req.user.dataValues.user_id;
        PendingSeller.create({ userUserId: userid, FirstName: first_name, LastName: last_name, description: description })
            .then(tutor => {
                alertMessage(res, 'success', tutor.tutor_id + 'user has been verified as tutor', 'fas fa-sign-in-alt', true);
                res.redirect('/');
            })
            .catch(err => console.log(err));
        res.redirect('/seller_onboarding/finish')
    }
});


router.get('/finish', ensureAuthenticated, (req, res) => {
    res.render('seller_onboarding/finish', {
        user: req.user.dataValues
    })
})
module.exports = router;