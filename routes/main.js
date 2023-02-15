const express = require('express');
const JWT = require('jsonwebtoken');
const router = express.Router();
var bcrypt = require('bcryptjs');
const regexEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const regexPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
fs = require('fs');
const path = require('path');
/* models */

const User = require('../models/User');
// console.log("Retrieve messenger helper flash");
const alertMessage = require('../helpers/messenger');
// console.log("Retrieved flash");
const passport = require('passport');
const { cookie } = require('express-validator');
const CourseListing = require('../models/CoursesListing');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
//express validator
const { body, validationResult } = require('express-validator');
const { use } = require('passport');


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


// router.get('/voice-recongition', async function(req, res) {
//     console.log("going into login page");
//     const id = req.user.user_id;
//     // const payload = JWT.verify(token, 'the-key');
//     // uuid = payload.uuid;
//     console.log(id);
//     const Email = await User.findOne({ where: { user_id: id }, raw: true })
//         // console.log(user);
//     res.render('user_views/login', {
//         Email: Email.Email
//     });

// });
// // login with email

router.get('/login', (req, res) => {

    console.log("going into login page");
    res.render('user_views/email_login')
    console.log("email login page rendered");
});

router.get('/login/verify/:id', (req, res) => {
    console.log("going into login page");
    const id = req.params.id;

    console.log("verify email page rendered", );
    res.render('user_views/verify', { email: email })
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
    const user = await User.findOne({ where: { Email: req.body.email }, raw: true }).then((user) => {
        if (user) {
            if (user.verify == false) {
                var name = user.FirstName + ' ' + user.LastName;
                alertMessage(res, 'info', 'Please verify your email before using our service', 'fa fa-envelope', true);
                send_verification(user.user_id, user.Email, name);

                res.redirect('/login');
            }
        }

    })

    // console.log(user.user_id);

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
        successRedirect: "/", // Route to /video/listVideos URL
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

const FormData = require('form-data');
let request = require('request');
const axios = require('axios');
const console = require('console');
// router.post('/voice', async function(req, res) {
//     const form = new FormData();
//     console.log(req.body);
//     const user = await User.findOne({ where: { Email: req.body.Email }, raw: true });
//     console.log(user);
//     const ext = path.extname("audio/" + req.body.audio).toLowerCase();
//     if (ext !== '.wav') {
//         let errors = [];
//         errors = errors.concat({ text: "Format is wrong. Please Use .wav format!" });
//         // alertMessage(res, 'danger', 'Invalid Voice', 'fa fa-exclamation-circle', true);
//         res.render('user_views/login', {
//             errors: errors,
//             Email: user.Email
//         });

//     }
//     // const isWAV = validateWAVFile('sample.wav');
//     // onsole.log(isWAV); // true
//     const audio_path = "audio/" + req.body.audio;
//     for (let i = 0; i < 1; i++) {
//         const audioFile1 = user.Audio;
//         const audioFile2 = fs.createReadStream(audio_path);
//         form.append('file1', audioFile1, {
//             contentType: 'audio/wav',
//             filename: 'temp.wav'
//         });
//         form.append('file2', audioFile2, {
//             contentType: 'audio/wav',
//             filename: 'temp.wav'
//         });
//         console.log(form);
//         try {
//             let errors = [];
//             await axios.post("http://saran-greenr-speaker-recongition.chhba7cyd9ekdwc5.southeastasia.azurecontainer.io/predict", form, {
//                     headers: {
//                         'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
//                     }
//                 }).then(response => {
//                     console.log(response.data);
//                     if (response.data == 'yes') {
//                         res.redirect("/twofa/" + user.user_id);
//                     } else if (response.data == 'no') {
//                         console.log('Print Error');
//                         errors = errors.concat({ text: "Invalid!!!" });
//                         // alertMessage(res, 'danger', 'Invalid Voice', 'fa fa-exclamation-circle', true);
//                         res.render('user_views/login', {
//                             errors: errors,
//                             Email: user.Email
//                         });
//                     }

//                 })
//                 .catch(error => {
//                     console.error(error);
//                 });

//         } catch (e) { console.log(e, "getFileError") }
//     }
// });

// router.get('/twofa/:id', async function(req, res) {
//         const uuid = req.params.id
//         const user = await User.findByPk(uuid);
//         const update = await User.update({
//             twofa: true
//         }, {
//             where: {
//                 user_id: uuid
//             }
//         });
//         user.save();
//         console.log(user);
//         res.redirect('/');
//     })
// Logout User
router.get('/logout', async function(req, res) {
    const uuid = req.user.user_id
    const user = await User.findByPk(uuid);
    // const update = await User.update({
    //     twofa: false
    // }, {
    //     where: {
    //         user_id: uuid
    //     }
    // });
    user.save();
    console.log(user);
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
router.get('/email/verify', (req, res) => {
    if (req.user != null) {
        res.redirect("/")
    } else {
        res.render('user_views/verify')
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
], (req, res, next) => { //when press the submit button listen to post action
    // console.log(req.body);
    let errors = [];
    let { FirstName, LastName, Username, Email, Password, ConfirmPassword } = req.body;
    // const ext = path.extname("audio/" + req.body.Audio).toLowerCase();
    // const ext2 = path.extname("audio/" + req.body.Audio2).toLowerCase();
    // if (ext !== '.wav' || ext2 !== '.wav') {
    //     let errors = [];
    //     errors = errors.concat({ text: "Format is wrong. Please Use .wav format!" });
    //     res.render('user_views/register', {
    //         errors: errors,
    //         FirstName,
    //         LastName,
    //         Username,
    //         Email,
    //         Password,
    //         ConfirmPassword
    //     });

    // }
    // const file = "audio/" + req.body.Audio;
    // const audio_file = fs.readFileSync(file);
    // const file2 = "audio/" + req.body.Audio2;
    // const audio_file2 = fs.readFileSync(file2);
    // // train(audio_file, audio_file2);
    // console.log(audio_file);
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
                                var verify_code = Math.random().toString().substr(2, 6)
                                console.log(verify_code);
                                // Create new user record
                                User.create({ FirstName, LastName, Username, Email, Password: hashedpassword, code: verify_code })
                                    .then(user => {

                                        send_verification(user.user_id, Email, FirstName);
                                        alertMessage(res, 'success', 'Please Verify Your Email', 'fas fa-sign-in-alt', true);
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
});

// // async function train(audio1, audio2) {
// console.log("training the audio files")
// const form = new FormData();
// form.append('file1', audio1, {
//     contentType: 'audio/wav',
//     filename: 'temp.wav'
// });
// form.append('file2', audio2, {
//     contentType: 'audio/wav',
//     filename: 'temp.wav'
// });
// console.log(form);
// await axios.post("http://saran-greenr-speaker-recongition.chhba7cyd9ekdwc5.southeastasia.azurecontainer.io/same", form, {
//     headers: {
//         'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
//     }
// }).then(response => {
//     console.log(response.data);
//     console.log("Done training")
// })
// };
router.get("/forgot-password", (req, res, next) => {
    console.log("Forgot password page accessed.");
    return res.render('user/forgot_password');
});


router.post("/forgot-password", async function(req, res, next) {
    let errors = [];
    try {
        if (!regexEmail.test(req.body.email)) {
            errors = errors.concat({ text: "Invalid email address!" });
        } else {
            const user = await User.findOne({ where: { Email: req.body.email } });
            if (user === null) {
                errors = errors.concat({ text: "This email is not registered!" });
                return res.render('user/forgot_password', { errors: errors });
            }
        }
    } catch (error) {
        console.error("There is errors with the forgot form body.");
        console.error(error);
        return res.render('user/forgot_password', { errors: errors });
    }
    try {
        const user = await User.findOne({ where: { Email: req.body.email } });

        alertMessage(res, 'success', 'Successfully Sent Password reset link to your email. Please Check It!', 'fas fa-sign-in-alt', true);
        await send_resetlink(user.FirstName, user.Email, user.user_id);
        return res.redirect("/login");
    } catch (error) {
        //	Else internal server error
        console.error(`Failed to create a new user: ${req.body.email} `);
        console.error(error);
        return res.status(500).end();
    }

});

async function send_resetlink(name, email, id) {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'ggreenr3@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLEINT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
        },
    });
    const token = JWT.sign({
        uuid: id
    }, 'the-key', {
        // expire in 5mins
        expiresIn: '300000'
    });
    console.log("Password email reset link sent ready...")
    return transport.sendMail({
        to: email,
        from: 'Greenr',
        subject: `Reset Password`,
        html: `
		<hr>

<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta name="description" content="Reset Password Email Template.">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                          <a href="http://localhost:3000/" title="logo" target="_blank">
                            <img id="imgborder" class="logo" style="width: 85px;" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhdIzJ2li_ahsu1QM_dUc5Jvilnp54TKSYPw&usqp=CAU">
                          </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Hello ${name}, You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply send you your old password. A unique link to reset your
                                            password has been generated for you. To reset your password, click the
                                            following link and follow the instructions.
                                        </p>
                                        <a href="http://localhost:3000/reset-password/${token}"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>Greenr</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>
</html>
		`
    });
}

router.get("/reset-password/:token", async function(req, res, next) {
    const token = req.params.token;
    console.log('password reseting page accesed')
    let uuid = null;
    let errors = [];
    try {
        const payload = JWT.verify(token, 'the-key');
        uuid = payload.uuid;
        console.log(uuid);
    } catch (error) {
        console.error(`The token is invalid`);
        console.error(error);
        return res.sendStatus(400).end();
    }
    try {
        const user = await User.findByPk(uuid);
        console.log(user);
        return res.render('user/reset_password', { email: user.Email, user })
    } catch (error) {
        console.log(error);
    }
});

router.post("/reset-password/:id", async function(req, res, next) {
    let errors = [];
    const id = req.params.id;
    const { password, password2 } = req.body;
    const user = await User.findByPk(id);
    try {
        if (!regexPwd.test(req.body.password)) {
            errors = errors.concat({ text: "Password requires minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one symbol!" });
        } else if (req.body.password !== req.body.password2) {
            errors = errors.concat({ text: "Password do not match!" });
        }
    } catch (error) {
        console.error("There is errors with the reset password form.");
        console.error(error);
        return res.render('/', { errors: errors });
    }
    try {
        var hashedpassword = '';
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(req.body.password1, salt, function(err, hash) {
                hashedpassword = hash;
            })
        })

        if (req.session) {
            req.session.destroy();
        }
        alertMessage(res, 'success', 'Successfully changed password. ', 'fas fa-sign-in-alt', true);
        return res.render('user_views/email_login', )
    } catch (error) {
        console.log(error);
    }
});

// google api
const CLIENT_ID = '288378853501-ma7eu9kd529v7ttoa2q4oo4q0uoiq914.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04GTcJVcVlA1qCgYIARAAGAQSNwF-L9IrOrpPxfwmzjJB7ryuTVaubJYu66iGdSNskSjzg72RzvglTls4S_A3LUuj1z0Jq7dVL4I';
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLEINT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function send_verification(uid, email, name) {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'ggreenr3@gmail.com',
            clientId: CLIENT_ID,
            clientSecret: CLEINT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
        },
    });
    const token = JWT.sign({
        uuid: uid
    }, 'the-key', {
        // expire in 5mins
        expiresIn: '300000'
    });
    console.log('sending email.......')
        //	Send email using google
    return transport.sendMail({
        to: email,
        from: 'Greenr',
        subject: `Verify your email`,
        html: `<img id="imgborder" class="logo" style="width: 85px;" src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fgreenr.com%2F&psig=AOvVaw18KgKxlV-Oge_QzYRqhiOW&ust=1675358920635000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCODqj7zs9PwCFQAAAAAdAAAAABAE">
		<hr>
		 <h1>Hello, ${name}</h1>
        <h5 class="text-muted mb-2">
		Thank you for
        choosing Greenr, to make
        full use of our
        features,
        verify your email address.
        Please verify in 5min!
        </h5>
        <a href="http://localhost:3000/email/verify/${token}"><button type="button" class="btn btn-dark">Verify Your Email</button></a>
		<br>
		<br>
		Or, copy and paste the following URL into your browser:
		<a href="http://localhost:3000/email/verify/${token}">http://localhost:3000/email/verify/${token}</a>
		`
    });
}
router.get("/email/verify/:token", verify_process);

async function verify_process(req, res) {
    const token = req.params.token;
    let uuid = null;
    try {
        const payload = JWT.verify(token, 'the-key');
        uuid = payload.uuid;
    } catch (error) {
        console.error(`The token is invalid`);
        console.error(error);
        return res.sendStatus(400).end();
    }
    try {
        const user = await User.findByPk(uuid);
        const update = await User.update({
            verify: true
        }, {
            where: {
                user_id: uuid
            }
        });
        console.log(user.FirstName);
        // user.verify()
        user.save();
        return res.render("user_views/verified", {
            name: user.FirstName
        });
    } catch (error) {
        console.error(`Failed to locate ${uuid}`);
        console.error(error);
        return res.sendStatus(500).end();
    }
}

module.exports = router;