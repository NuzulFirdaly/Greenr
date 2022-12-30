const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
// Load user model
const User = require('../models/User');
function localStrategy(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password,
        done) => {
            console.log("Inside Local Strategy");
            console.log(email);
        User.findOne({ where: { email: email }, raw:true })
            .then(user => {
                console.log(user)
                if (!user) {
                    return done(null, false, { message: 'Email does not exist' });
                }
                // Match password
                bcrypt.compare(password, user.Password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        console.log("user matched redirecting now");

                        return done(null, user);
                    } else {
                        console.log("Password Incorrect");

                        return done(null, false, {
                            message: 'Password incorrect'
                        });
                    }
                })
            })
    }));
    // Serializes (stores) user id into session upon successful
    // authentication
    passport.serializeUser((user, done) => {
        console.log("putting user inside session")
        done(null, user.user_id); // user.id is used to identify authenticated user
        console.log("success put")

    });

    //what is this, where is userID???
    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((userId, done) => {
        User.findByPk(userId)
            .then((user) => {
                done(null, user); // user object saved in req.session
            })
            .catch((done) => { // No user found, not stored in req.session
                console.log(done);
            });
    });
}
module.exports = { localStrategy };