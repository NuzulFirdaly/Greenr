const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
/* models */
const User = require('../models/User');
console.log("Retrieve messenger helper flash");
const alertMessage = require('../helpers/messenger');
console.log("Retrieved flash");
const passport = require('passport');
const { cookie } = require('express-validator');
const CourseListing = require('../models/CoursesListing');

//express validator
const { body, validationResult } = require('express-validator');


//Home
router.get('/', (req, res) => {
    // console.log("Printing user object from res.locals")
    CourseListing.findAll({ include: { model: User } }).then((courseArray) => {
        courseArray = JSON.parse(JSON.stringify(courseArray, null, 2))
            //console.log(courseArray);
        if (req.user != null) {
            var cart = Object.keys(req.session.cart).length;

            res.render('home', {
                user: req.user.dataValues,
                courseArray,
                cart: cart
            })
        } else {
            res.render('home', {
                courseArray
            })

        };
    }).catch(err => console.log(err));
});

//login
router.get('/login', (req, res) => {
    console.log("going into login page");
    res.render('user_views/login')
    console.log("login page rendered");
});
redirecturl = "/";
router.post('/loginPost', [body('email').trim().isEmail().normalizeEmail().toLowerCase(), body('password')], async(req, res, next) => {
    let errors = [];
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        validationErrors.array().forEach(error => {
            console.log(error)
            console.log(error.msg)
            errors.push({ text: error.msg })
        })
    }
    console.log(req.body.email);
    console.log(req.body.password);
    await User.findOne({ where: { Email: req.body.email }, raw: true }).then(user => {
        console.log(user.AccountTypeID);
        switch (user.AccountTypeID) {
            case 0: //user
                redirecturl = "/"
                console.log("user is logged in as normal user")
                break;
            case 1: //tutor
                redirecturl = "/course/CreateCourse"
                console.log("user is logged in as tutor")
                break
            case 2: //InstitutionAdmin
                redirecturl = "/institution_admin/showyourpage"
                break;
            case 3: //admin
                redirecturl = "/admin"
                break;
            case 7: //SuperAdmin
                redirecturl = "/admin"
                break;
            default:
                console.log("user does not exist")
                redirecturl = "/"
        };
    }).catch(err => console.log(err));
    console.log("Printing redirecturl")
    console.log(redirecturl)
    console.log(typeof(redirecturl))
        //suppose to nest this but idk so im gonna leave here than make it efficient later... idk how to nest in inside switch
    await passport.authenticate('local', {
        // if (req.user.accountType.dataValues == 1){
        successRedirect: redirecturl, // Route to /video/listVideos URL
        failureRedirect: '/login', // Route to /login URL
        failureFlash: true
            /* Setting the failureFlash option to true instructs Passport to flash an error message using the
       message given by the strategy's verify callback, if any. When a failure occur passport passes the message
       object as error */
    })(req, res, next);
    req.session.cart = {};
    // console.log("printing req usr from login post")
    // console.log(req.user);
});

// Logout User
router.get('/logout', (req, res) => {
    req.logout();
    alertMessage(res, 'success', 'You haved logged out! See you again...', 'fas fa-door-open', true)
    res.redirect('/');
});

//Register
router.get('/register', (req, res) => {
    if (req.user != null) {
        res.redirect("/")
    } else {
        res.render('user_views/register')
    };
});

router.post('/registerPost', [
    // {FirstName, LastName, Username,Email, Password, ConfirmPassword
    body('FirstName').not().isEmpty().trim().escape().withMessage("First name is invalid"),
    body('LastName').not().isEmpty().trim().escape().withMessage("Last Name is invalid"),
    body('Username').not().isEmpty().trim().escape().withMessage("Username is invalid"),
    body('Email').trim().isEmail().withMessage("Email must be a valid email").normalizeEmail().toLowerCase(),
    body('Password').isLength({ min: 8 }).withMessage("Password must be at least 8 Character").matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d@$.!%*#?&]/
    ).withMessage("Password must contain at least 1 uppercase letter, 1 lowercase letter and 1 special character"),
    body('ConfirmPassword').custom((value, { req }) => {
        if (value !== req.body.Password) {
            throw new Error('Passwords do not match')
        }
        return true
    })
], (req, res) => { //when press the submit button listen to post action
    // console.log(req.body);
    let errors = [];
    let { FirstName, LastName, Username, Email, Password, ConfirmPassword } = req.body;

    const validatorErrors = validationResult(req);
    if (!validatorErrors.isEmpty()) { //if isEmpty is false
        console.log("There are errors")
        validatorErrors.array().forEach(error => {
            console.log(error);
            errors.push({ text: error.msg })
        })

        res.render('user_views/register', {
            errors,
            FirstName,
            LastName,
            Username,
            Email,
            Password,
            ConfirmPassword
        });
    } else {
        console.log("There are no errors")
            //user's model's findOne function, select statement and where clause
            // If all is well, checks if user is already registered
        User.findOne({ where: { Email: req.body.Email } })
            .then(user => { //findOne function returns a promise 
                if (user) {
                    // If user is found, that means email has already been
                    // registered
                    res.render('user_views/register', {
                        error: user.Email + ' already registered',
                        FirstName,
                        LastName,
                        Username,
                        Email,
                        Password,
                        ConfirmPassword
                    });
                } else {
                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(Password, salt, function(err, hash) {
                            // Store hash in your password DB.
                            if (err) {
                                throw err;
                            } else {
                                hashedpassword = hash;
                                console.log("This is hashed pasword \n", hashedpassword);
                                // Create new user record
                                User.create({ FirstName, LastName, Username, Email, Password: hashedpassword })
                                    .then(user => {
                                        alertMessage(res, 'success', user.Username + ' added.Please login', 'fas fa-sign-in-alt', true);
                                        res.redirect('/Login');
                                    }).catch(err => console.log(err));
                            }
                        });
                    });
                    // // Create new user record 
                    // User.create({ FirstName, LastName, Email, Password }).then(user => {
                    //     alertMessage(res, 'success', user.name + ' added.Please login', 'fas fa-sign-in-alt', true);
                    //     res.redirect('/Login');
                    // }).catch(err => console.log(err));
                }
            });
    }
    // // Retrieves fields from register page from request body
    // let {FirstName, LastName, Username,Email, Password, ConfirmPassword} = req.body;
    // // Checks if both passwords entered are the same
    // if(Password !== ConfirmPassword) {
    //     errors.push({text: 'Passwords do not match'});
    // }
    // // Checks that password length is more than 4
    // if(Password.length < 4) {
    //     errors.push({text: 'Password must be at least 4 characters'});
    // }
    // if (errors.length > 0) {
    //     res.render('user_views/register', {
    //     errors,
    //     FirstName,
    //     LastName,
    //     username,
    //     Email,
    //     Password,
    //     ConfirmPassword
    //     });
    // } 
    // else 
    //     {
    //         //user's model's findOne function, select statement and where clause
    //         // If all is well, checks if user is already registered
    //         User.findOne({ where: {Email: req.body.Email} })
    //         .then(user => { //findOne function returns a promise 
    //         if (user) {
    //         // If user is found, that means email has already been
    //         // registered
    //             res.render('user_views/register', {
    //                 error: user.Email + ' already registered',
    //                 FirstName,
    //                 LastName,
    //                 Username,
    //                 Email,
    //                 Password,
    //                 ConfirmPassword
    //             });
    //         }    
    //         else {
    //             bcrypt.genSalt(10, function (err, salt) {
    //                 bcrypt.hash(Password, salt, function (err, hash) {
    //                     // Store hash in your password DB.
    //                     if (err) {
    //                         throw err;
    //                     } else {
    //                         hashedpassword = hash;
    //                         console.log("This is hashed pasword \n", hashedpassword);
    //                         // Create new user record
    //                         User.create({ FirstName, LastName, Username, Email, Password: hashedpassword })
    //                             .then(user => {
    //                                 alertMessage(res, 'success', user.Username + ' added.Please login', 'fas fa-sign-in-alt', true);
    //                                 res.redirect('/Login');
    //                             })
    //                             .catch(err => console.log(err));
    //                     }
    //                 });
    //             });
    //             // // Create new user record 
    //             // User.create({ FirstName, LastName, Email, Password }).then(user => {
    //             //     alertMessage(res, 'success', user.name + ' added.Please login', 'fas fa-sign-in-alt', true);
    //             //     res.redirect('/Login');
    //             // }).catch(err => console.log(err));
    //         }
    //     });
    // }
});


module.exports = router;

//     alertMessage(res, 'success', user.name + ' added.Please login', 'fas fa-sign-in-alt', true);