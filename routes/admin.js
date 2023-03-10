const express = require('express');
const router = express.Router();
const ModelUser = require('../models/User');
const pendingseller = require('../models/PendingSeller');
const fs = require('fs');
const ORM = require('sequelize');
const runInContext = require('vm');
const PendingSeller = require('../models/PendingSeller');
const { Sequelize, DataTypes, Model, Op } = ORM;
module.exports = router;
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { notification } = require('paypal-rest-sdk');
router.get("/users", users);
const alertMessage = require('../helpers/messenger');
// console.log("Retrieved flash");
const passport = require('passport');
const { cookie } = require('express-validator');
//express validator
const { body, validationResult } = require('express-validator');
const { use } = require('passport');
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


async function users(req, res) {
    try {
        if (req.user.AccountTypeID != 2) {
            res.render('404')
        }
        
        
        
            // const total = await ModelUser.count({
            //     raw: true
            // });
            const customer = await ModelUser.findAndCountAll({
                where: {
                    AccountTypeID:0
                }
            });
            const seller = await ModelUser.findAndCountAll({
                where: {
                    AccountTypeID:1
                }
            });
            const manager = await ModelUser.findAndCountAll({
                where: {
                    AccountTypeID:2
                }
            });
        const users = await ModelUser.findAll({
            raw: true
        });
            return res.render("admin/users", {
             
                customer: customer.count,
                seller: seller.count,
                manager: manager.count,
                users
            })
            
    }
    catch (error) {
        console.log(error)
        return res.render("404");
    };

}

router.get("/email", email);
async function email(req, res) {
    try {
        if(req.user.AccountTypeID != 2){
            res.render("404")
        }
        // let user = req.user.user_id;
        // console.log(user);
        // if (req.user.role == 'manager') {
        req.user.AccountTypeID =2;
        
        const total = await ModelUser.count({
            raw: true
        });
        const customer = await ModelUser.findAndCountAll({
            where: {
                role: "customer"
            }
        });
        const manager = await ModelUser.findAndCountAll({
            where: {
                role: "admin"
            }
        });
        const users = await ModelUser.findAll({
            raw: true
        });
        return res.render("admin/email_user", {
            total: total,
            customer: customer.count,
            manager: manager.count,
            user: users
        })
      
    }
    catch (error) {
        console.log(error)
        return res.render('404');;
    };
}

router.get('/approve', async function (req, res) {
    try{
    if (req.user.AccountTypeID != 2) {
        res.render('404')
    }
     pendingseller.count({ raw: true }).then(total => {
        // console.log(pInstList)
        pendingseller.findAll({ raw: true }).then(seller => {
            res.render('admin/approve', {
                
                seller,
                total
            })
        });
    });
}
    catch (error) {
        console.log(error)
        return res.render('404');;
    };
});
router.get('/approve/delete/:uuid', async function (req, res) {
    if (req.user.AccountTypeID != 2) {
        res.render('404')
    }
        // console.log(pInstList)
        const id = req.params.uuid;
    const user = await ModelUser.findByPk(id);
    console.log('hhajda');
    console.log(req.params.uuid);
    console.log(user);
    var name = user.FirstName + ' ' + user.LastName;
    send_delete(name, user.Email);
    pendingseller.findOne({
        where: {
            userUserId: req.params.uuid
        },
    }).then((option) => {
        if (option != null) {
            pendingseller.destroy({
                where: {
                    userUserId: req.params.uuid
                }
                
            });
            
            return res.redirect("/admin/approve");
        }
        
    });
    
});
async function send_delete(name, email ) {
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


    console.log("Notification for not approving...")
    return transport.sendMail({
        to: email,
        from: 'Greenr',
        subject: `Approval Error Notification`,
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
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Hello ${name}</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                           Sorry to inform that your approval to be a seller is being rejected. 
                                           Please Contact us for further Questions.
                                        </p>
                                    
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
router.get("/approve/:uuid", async function (req, res) {
    // console.log(pInstList)
    const id = req.params.uuid;
    const user = await ModelUser.findByPk(id);
    console.log(req.params.uuid);
    console.log(user);
    var name = user.FirstName + ' ' + user.LastName;
    const update = await user.update({
        AccountTypeID : 1
    }, {
        where: {
            user_id: id
        }
    });
    user.save();
    notify_seller(name, user.Email);
    pendingseller.findOne({
        where: {
            userUserId: req.params.uuid
        },
    }).then((option) => {
        if (option != null) {
            pendingseller.destroy({
                where: {
                    userUserId: req.params.uuid
                }

            });

            return res.redirect("/admin/approve");
        }

    });
});

async function notify_seller(name, email) {
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


    console.log("Notification for approving...")
    return transport.sendMail({
        to: email,
        from: 'Greenr',
        subject: `Approval to be a seller`,
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
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Hello ${name}</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                          We are pleased to inform you that your request to be a seller is being approved. 
                                        </p>
                                    
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

router.get('/Users/Delete/:uuid', async function (req, res) {
    // console.log(pInstList)
    const id = req.params.uuid;
    const user = await ModelUser.findByPk(id);
    console.log(req.params.uuid);
    console.log(user);
    var name = user.FirstName + ' ' + user.LastName;
    send_delete_user(name, user.Email);
    ModelUser.findOne({
        where: {
            user_id: req.params.uuid
        },
    }).then((option) => {
        if (option != null) {
            ModelUser.destroy({
                where: {
                    user_Id: req.params.uuid
                }
            });
            return res.redirect("/admin/users");
        }
    });

});

async function send_delete_user(name, email) {
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


    console.log("Notification for not approving...")
    return transport.sendMail({
        to: email,
        from: 'Greenr',
        subject: `Your account is removed`,
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
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Hello ${name}</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                           Sorry to inform that your account has been removed from Greenr!
                                           Please contact our customer service or Email us for further details. 
                                        </p>
                                    
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
router.get('/email/:uuid', async function (req, res) {
    
    const id = req.params.uuid;
    const user = await ModelUser.findByPk(id);
    console.log(req.params.uuid);
    console.log(user);
    var name = user.FirstName + ' ' + user.LastName;
    return res.render("admin/email_user", {
        name:name,
        email: user.Email
    })

});
router.post('/email', async function (req, res) {
    // console.log(pInstList)
    // const id = req.params.uuid;
    // const user = await ModelUser.findByPk();
    // console.log(req.params.uuid);
   
    const user = await ModelUser.findOne({ where: { Email:req.body.email }, raw: true });
    console.log(user);
    console.log(req.body);
    var name = user.FirstName + ' ' + user.LastName;
    send_email_user(name, user.Email, req.body.subject, req.body.input);
    return res.redirect("/admin/users");
});
async function send_email_user(name, email, subject, msg) {
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


    console.log("Notification for not approving...")
    return transport.sendMail({
        to: email,
        from: 'Greenr',
        subject: `${subject}`,
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
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Hello ${name}</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                        ${msg}
                                        </p>
                                    
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