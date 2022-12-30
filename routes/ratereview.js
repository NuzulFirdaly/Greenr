const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');

/* models */
const Course = require('../models/CoursesListing');
const User = require('../models/User')
const RateReview = require('../models/RateReview');

const alertMessage = require('../helpers/messenger');
const { session } = require('passport');
const CourseListing = require('../models/CoursesListing');

const { body, validationResult } = require('express-validator');

router.post('/giveRating/:type/:id', (req, res) => {
    type = req.params.type;
    id = req.params.id;
    let { rating, review } = req.body;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    RateReview.create({ Rating: rating, Review: review, Date: today, CourseId: id, UserId: req.user.dataValues.user_id })
        .then(ratereview => {
            alertMessage(res, 'success', 'Review added.', 'fas fa-plus', true);
            res.redirect(`/course/viewcourse/${id}`);
        })
        .catch(err => console.log(err));
})

router.post('/editRating/:type/:id', (req, res) => {
    type = req.params.type;
    id = req.params.id;
    let { rating, review } = req.body;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    RateReview.findOne({ where: { UserId: req.user.user_id } })
        .then(yourRateReview => {
            yourRateReview.update({ Rating: rating, Review: review, Date: today })
            res.redirect(`/course/viewcourse/${id}`);
        })
        .catch(err => console.log(err));
})

router.post('/deleteRating/:type/:id', (req, res) => {
    RateReview.destroy({ where: { UserId: req.user.user_id } }).then(res.redirect(`/course/viewcourse/${req.params.id}`))
})

module.exports = router;