const express = require('express');
const session = require('express-session');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); //to retrieve req.body
const Sequelize = require('sequelize');
const paypal = require('paypal-rest-sdk');
const template_helpers = require('./helpers/helpers.js');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXO5V1rlutZynF0Ki1rO2imjUeM8bI1RE5duaqKPKaaptEE97kMhkMpu2IIWBZ30H09LCyUheBlDI6dC',
    'client_secret': 'EDjmtzb5OjJTZBmkEoCea9WykI5XnUTBtqgk57w8RfLcOON_I0G0Y--mXIyQdJodkkM_Z3BUzoDzw9gJ'
})

const Handlebars = require('handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')



// Messaging Libraries
const flash = require('connect-flash');
const FlashMessenger = require('flash-messenger');


const passport = require('passport')


//Routes
const mainRoute = require('./routes/main');
const SellerOnboardingRoute = require('./routes/seller_onboarding');
const courseRoute = require("./routes/course");
const scheduleRoute = require("./routes/schedule");
const userRoute = require("./routes/user");
const shopRoute = require("./routes/shop");
const rateRoute = require("./routes/ratereview");
const paymentRoute = require('./routes/payment');
const admin = require('./routes/admin.js');


//mysql init
const tutorhubDB = require('./config/DBConnection');
tutorhubDB.setUpDB(false) //notice that to use setupDB we need to type vidjotDB and access its methods, we get this by exporting the module with {}
const MySQLStore = require('express-mysql-session');
const db = require('./config/db'); // db.js config file for session


// Passport Config
const authenticate = require('./config/passport');
const { username } = require('./config/db');

authenticate.localStrategy(passport);

//App
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

//MiddleWares
// Body parser middleware to parse HTTP body in order to read HTTP data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// HandleBar middlewares
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        loopcourse: function(value, options) {
            return options.fn({ test: value })
        },
        template_helpers,
        ifEquals(a, b, options) {
            // console.log("helper function")
            // console.log(a)
            // console.log(b)
            if (a == b) {
                // console.log("Printing ifEquals helper")
                // console.log(this)
                return options.fn(this)
            } else {
                return options.inverse(this) //hide this
            }
        },
        ifSameReturn(a, b, options) {
            if (a == b) {
                // console.log("Printing ifEquals helper")
                // console.log(this)
                return options.fn(this)
            }
        },
        ifSame(a, b) {
            return a == b
        },
        format(date) {
            date = new Date(Date.parse(date));
            console.log(Date.parse(date.getFullYear(), date.getMonth(), date.getDate()));
            dateParsed = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();
            // return `${dateParsed.getFullYear()} - ${(dateParsed.getMonth() + 1)} - ${dateParsed.getDate()}`
            return dateParsed
        },
        ifNotEquals(a, b) {
            return a != b;
        },
        forloop(from, to, incr, block) {
            var accum = ''
            for (var i = from; i < to; i += incr) {
                block.data.index = i;
                accum += block.fn(i);
            }
            return accum;
        },
        ifInBetween(a, b, c) {
            return a >= b && a <= c;
        },
        ifGreater(a, b) {
            return a > b;
        },
        lengthMoreThan(a, b, options) {
            // console.log("this is a", a)
            // console.log("this is b", b)
            if (a) {
                if (a.length >= b) {
                    return options.fn(this)
                }
                return options.inverse(this)
            }
            return options.inverse(this)
        },
        printToConsole(a) {
            console.log("this is print to console", a)
        },
        takeLast3(notification) {
            var slicednoti = notification.slice(notification.length - 3, notification.length).reverse()
                // console.log("slicednoti", slicednoti)
            toreturn = ''
            for (i in slicednoti) {
                toreturn += `<div class="notifi__item notifiitem${parseInt(i) + 1}"><div class="bg-c1 img-cir img-40"><i class="zmdi zmdi-email-open"></i></div><div class="content"><h5>You got a notification from <strong>${slicednoti[i].SenderEmail}</strong></h5><span class="date">${slicednoti[i].notificationmsg.DateSent}</span></div></div>`
            }
            return toreturn
                // return notification.slice(notification.length - 3, notification.length).reverse()
        },
        takeLast4(notification) {
            var slicednoti = notification.slice(notification.length - 4, notification.length).reverse()
                // console.log("slicednoti", slicednoti)
            toreturn = ''
            for (i in slicednoti) {
                toreturn += `<div class="au-task__item au-task__item--primary"><div class="au-task__item-inner"><h5 class="task"><strong>${slicednoti[i].notificationmsg.Subject}</strong></h5><h6 class="task">${slicednoti[i].notificationmsg.Message}</h6><br><span class="time">From: &nbsp; ${slicednoti[i].SenderEmail}</span><br><span class="time">Date Sent: &nbsp; ${slicednoti[i].notificationmsg.DateSent}</span><button class="btn btn-danger btn-sm float-right delmynoti" id="${slicednoti[i].notificationmsgContentID}" value="${slicednoti[i].userUserId}" data-toggle="tooltip" data-placement="top" title="Delete"><i class="zmdi zmdi-delete"></i></button></div></div>`
            }
            return toreturn
                // return notification.slice(notification.length - 3, notification.length).reverse()
        },
        takeAllExceptLast4(notification) {
            var slicednoti = notification.slice(0, notification.length - 4).reverse()
            toreturn = ''
            for (i in slicednoti) {
                toreturn += `<div class="au-task__item au-task__item--primary js-load-item"><div class="au-task__item-inner"><h5 class="task"><strong>${slicednoti[i].notificationmsg.Subject}</strong></h5><h6 class="task">${slicednoti[i].notificationmsg.Message}</h6><br><span class="time">From: &nbsp; ${slicednoti[i].SenderEmail}</span><br><span class="time">Date Sent: &nbsp; ${slicednoti[i].notificationmsg.DateSent}</span><button class="btn btn-danger btn-sm float-right delmynoti" id="${slicednoti[i].notificationmsgContentID}" value="${slicednoti[i].userUserId}" data-toggle="tooltip" data-placement="top" title="Delete"><i class="zmdi zmdi-delete"></i></button></div></div>`
            }
            return toreturn
        },
        takeLast4s(notification) {
            var slicednoti = notification.slice(notification.length - 4, notification.length).reverse()
                // console.log("slicednoti", slicednoti)
            toreturn = ''
            for (i in slicednoti) {
                toreturn += `<div class="au-task__item au-task__item--primary"><div class="au-task__item-inner"><h5 class="task"><strong>${slicednoti[i].notificationmsg.Subject}</strong></h5><h6 class="task">${slicednoti[i].notificationmsg.Message}</h6><br><span class="time">From: &nbsp; ${slicednoti[i].SenderEmail}</span><br><span class="time">Date Sent: &nbsp; ${slicednoti[i].notificationmsg.DateSent}</span><button class="btn btn-danger btn-sm float-right delnoti" id="${slicednoti[i].notificationmsgContentID}" value="${slicednoti[i].userUserId}" data-toggle="tooltip" data-placement="top" title="Delete"><i class="zmdi zmdi-delete"></i></button></div></div>`
            }
            return toreturn
                // return notification.slice(notification.length - 3, notification.length).reverse()
        },
        takeAllExceptLast4s(notification) {
            var slicednoti = notification.slice(0, notification.length - 4).reverse()
            toreturn = ''
            for (i in slicednoti) {
                toreturn += `<div class="au-task__item au-task__item--primary js-load-item"><div class="au-task__item-inner"><h5 class="task"><strong>${slicednoti[i].notificationmsg.Subject}</strong></h5><h6 class="task">${slicednoti[i].notificationmsg.Message}</h6><br><span class="time">From: &nbsp; ${slicednoti[i].SenderEmail}</span><br><span class="time">Date Sent: &nbsp; ${slicednoti[i].notificationmsg.DateSent}</span><button class="btn btn-danger btn-sm float-right delnoti" id="${slicednoti[i].notificationmsgContentID}" value="${slicednoti[i].userUserId}" data-toggle="tooltip" data-placement="top" title="Delete"><i class="zmdi zmdi-delete"></i></button></div></div>`
            }
            return toreturn
        },
        // return notification.slice(notification.length - 3, notification.length).reverse()
        timestampFormat(date) {
            var date = new Date(Date.parse(date));
            console.log('Date', date);

            var year = date.getFullYear();
            console.log('YEARS', year);
            var month = date.getMonth();
            console.log('month', month);
            var day = date.getDate();
            console.log('day', day);

            var hours = date.getHours();
            console.log('HOURS', hours);
            var minutes = date.getMinutes();
            console.log('MINUTES', minutes);
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = day + "/" + month + "/" + year + " " + hours + ':' + minutes + ' ' + ampm;
            console.log('Date', strTime);
            return strTime
        },
        ifAllSame(a, b, c, d, e, f) {
            if (a == b && b == c && c == d && d == e && e == f) {
                return true
            } else {
                return false
            }
        },
        ifElementInList(a, b, c) {
            console.log(a);
            console.log(b);
            var boolans;
            for (const [key, value] of Object.entries(b)) {
                console.log("This is the key: ", key);
                console.log("This is the value: ", value);
                console.log(value[c]);
                if (value[c] == a) {
                    boolans = true;
                    break
                } else {
                    boolans = false
                }
            }
            return boolans
        }


    },
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');



// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public'))); // serve images, CSS files, and JavaScript files in a directory named public

app.use(methodOverride('_method'));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// Express session middleware - uses MySQL to store session
app.use(session({
    key: 'tutorhub_session',
    secret: 'nuzulfirdaly',
    store: new MySQLStore({
        host: db.host,
        port: 3306,
        user: db.username,
        password: db.password,
        database: db.database,
        clearExpired: true,
        // How frequently expired sessions will be cleared; milliseconds:
        checkExpirationInterval: 900000,
        // The maximum age of a valid session; milliseconds:
        expiration: 900000,
    }),
    resave: false,
    saveUninitialized: false
}));


//All this middleware functions needs session to store it in

// Initilize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash Middleware
app.use(flash());
app.use(FlashMessenger.middleware);
//WAS MISSING THIS WHAT IS THIS
app.use(async function(req, res, next) {
    // console.log("THHIS is fuCking local")
    // console.log("savnig to local")

    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    if (req.user) {
        res.locals.user = req.user.dataValues;
        console.log("this is req.user in next", req.user.user_id)
    }
    //setup framework
    await next();
});
// Place to define global variables - not used in practical 1
// app.use(function (req, res, next) {
// 	next();
// });



//Routes
app.use("/", mainRoute); // mainRoute is declared to point to routes/main.js
app.use('/seller_onboarding', SellerOnboardingRoute);
app.use("/course", courseRoute);
app.use("/myschedule", scheduleRoute);
app.use("/user", userRoute);
app.use("/shop", shopRoute);
app.use("/rate", rateRoute);
app.use("/admin", admin);
app.use("/payment", paymentRoute);




// // Method override middleware to use other HTTP methods such as PUT and DELETE
// app.use(methodOverride('_method'));


app.set('port', (process.env.PORT || 3000));

io.on('connection', function(client) {
    console.log('Client connected...');
    client.on('join', function(data) {
        console.log(data);
        client.on('messages', function(data) {
            client.emit('createnotification', data);
            client.broadcast.emit('createnotification', data);
        });
    });
});

//Initializing app with this port number
http.listen(app.get('port'), function() {
    console.log(`Server started on port ${app.get('port')}`)
});
