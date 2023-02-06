
const express = require('express');
const JWT = require('jsonwebtoken');
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

//login
router.get('/login', (req, res) => {
    console.log("going into login page");
    res.render('user_views/login')
    console.log("login page rendered");
});

// login with email

router.get('/login/email', (req, res) => {
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
], (req, res) => { //when press the submit button listen to post action
    // console.log(req.body);
    let errors = [];
    let { FirstName, LastName, Username, Email, Password, ConfirmPassword, Audio } = req.body;

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
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(Password, salt, function (err, hash) {
                            // Store hash in your password DB.
                            if (err) {
                                throw err;
                            } else {
                                hashedpassword = hash;
                                console.log("This is hashed pasword \n", hashedpassword);
                                var verify_code = Math.random().toString().substr(2, 6)
                                console.log(verify_code);
                                // Create new user record
                                User.create({ FirstName, LastName, Username, Email, Password: hashedpassword, Audio, code: verify_code})
                                    .then(user => {
                                        send_verification(user.user_id,Email, FirstName)
                                        alertMessage(res, 'success', user.Username + ' added.Please Verify Your email', 'fas fa-sign-in-alt', true);
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

router.post('/voice', function (req, res) {
    request.post('http://127.0.0.1:5000/predict',{ json: { file: '' } }, 
    function (error, response, body) {
        console.error('error:', error); // Print the error
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the data received
        res.send(body); //Display the response on the website
    });
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

    
    // async function send_verification(code, email, name) {
    //     const accessToken = await oAuth2Client.getAccessToken();
    //     const transport = nodemailer.createTransport({
    //         service: 'gmail',
    //         auth: {
    //             type: 'OAuth2',
    //             user: 'ggreenr3@gmail.com',
    //             clientId: CLIENT_ID,
    //             clientSecret: CLEINT_SECRET,
    //             refreshToken: REFRESH_TOKEN,
    //             accessToken: accessToken,
    //         },
    //     });

    //     //	Send email using google
    //     return transport.sendMail({
    //         to: email,
    //         from: 'Greenr',
    //         subject: `Verify your email`,
    //         html: `<img id="imgborder" class="logo" style="width: 85px;" src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fgreenr.com%2F&psig=AOvVaw18KgKxlV-Oge_QzYRqhiOW&ust=1675358920635000&source=images&cd=vfe&ved=0CBAQjRxqFwoTCODqj7zs9PwCFQAAAAAdAAAAABAE">
	// 	<hr>
	// 	 <h1>Hello, ${name}</h1>
    //     <h5 class="text-muted mb-2">
	// 	Thank you for
    //     choosing Greenr, to make
    //     full use of our
    //     features,
    //     verify your email address.
    //     Verfication code: ${code}
    //    `
    //     });
    // }
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
    }
    catch (error) {
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
    }
    catch (error) {
        console.error(`Failed to locate ${uuid}`);
        console.error(error);
        return res.sendStatus(500).end();
    }
}


//     alertMessage(res, 'success', user.name + ' added.Please login', 'fas fa-sign-in-alt', true);

// router.get('/email', (req, res) => {
//     const nodemailer = require('nodemailer');
//     const { google } = require('googleapis');

//     // These id's and secrets should come from .env file.
//     const CLIENT_ID = '288378853501-ma7eu9kd529v7ttoa2q4oo4q0uoiq914.apps.googleusercontent.com';
//     const CLEINT_SECRET = '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';
//     const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
//     const REFRESH_TOKEN = '1//04GTcJVcVlA1qCgYIARAAGAQSNwF-L9IrOrpPxfwmzjJB7ryuTVaubJYu66iGdSNskSjzg72RzvglTls4S_A3LUuj1z0Jq7dVL4I';

//     const oAuth2Client = new google.auth.OAuth2(
//         CLIENT_ID,
//         CLEINT_SECRET,
//         REDIRECT_URI
//     );
//     oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

//     async function sendMail() {
//         try {
//             const accessToken = await oAuth2Client.getAccessToken();

//             const transport = nodemailer.createTransport({
//                 service: 'gmail',
//                 auth: {
//                     type: 'OAuth2',
//                     user: 'ggreenr3@gmail.com',
//                     clientId: CLIENT_ID,
//                     clientSecret: CLEINT_SECRET,
//                     refreshToken: REFRESH_TOKEN,
//                     accessToken: accessToken,
//                 },
//             });

//             const mailOptions = {
//                 from: 'ggreenr3@gmail.com',
//                 to: 'tiwor69202@brandoza.com',
//                 subject: 'Hello from gmail using API',
//                 text: 'Hello from gmail email using API',
//                 html: '<h1>hello saran here!!!!</h1>',
//             };

    

//             const result = await transport.sendMail(mailOptions);
//             return result;
//         } catch (error) {
//             return error;
//         }
//     }

//     sendMail()
//         .then((result) => console.log('Email sent...', result))
//         .catch((error) => console.log(error.message));
// });
module.exports = router;