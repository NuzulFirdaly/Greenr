const express = require('express');
const router = express.Router();
var bcrypt = require('bcryptjs');
const Sequelize = require('sequelize');

/* models */
const Course = require('../models/CoursesListing');
const User = require('../models/User')
const RateReview = require('../models/RateReview');
const OrderDetails = require('../models/OrderDetails')
const Orders = require('../models/Orders')


const alertMessage = require('../helpers/messenger');
const { session } = require('passport');
const CourseListing = require('../models/CoursesListing');

const { body, validationResult } = require('express-validator');

router.post('/giveRating/:type/:id', async(req, res) => {
    type = req.params.type;
    id = req.params.id;
    let courseOwned = {}

    //check the user owns the product in
    await Orders.findOne({ where: { BuyerId: req.user.dataValues.user_id }, include: { model: OrderDetails, where: { course_id: id } }, raw: true })
        .then((data) => {
            courseOwned = data
            console.log("this is give rating data", data)
        })
    if (courseOwned) {
        let { rating, review } = req.body;
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;

        console.log("this is review", review)
        aspectslist = []
        let aspect_extract_service = process.env.aspect_extract_service_address
        let absa_service = process.env.absa_service_address
        fetch(aspect_extract_service, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: review })
            }).then((smth) => {
                return smth.json()
            })
            .then(async(aspects) => {
                console.log('this is aspects', aspects)
                if (aspects.length >= 1) {
                    aspectslist = aspects
                        // console.log('i wonder what this is ', data.json())
                    fetch(absa_service, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ text: review, aspects: aspectslist })
                        }).then((response) => {
                            // responseClone = response.clone(); // 2
                            return response.json();
                        })
                        .then((data2) => {
                            console.log('extract-sentiment - i wonder what this is ', data2)

                            aspect_sentiment_object = data2
                            console.log('extract-sentiment - i wonder what this is ', aspect_sentiment_object)

                            // convToJson = JSON.stringify(sentiments)
                            RateReview.create({ Rating: rating, Review: review, Date: today, CourseId: id, UserId: req.user.dataValues.user_id, Aspect_Sentiments: JSON.stringify(aspect_sentiment_object) })
                                .then(ratereview => {
                                    //fetch request to extract aspects and another to extract sentiments, store inside Aspect_Sentiments
                                    alertMessage(res, 'success', 'Review added.', 'fas fa-plus', true);
                                    res.redirect(`/course/viewcourse/${id}`);
                                })
                                .catch(err => console.log(err));

                        })
                } else {
                    RateReview.create({ Rating: rating, Review: review, Date: today, CourseId: id, UserId: req.user.dataValues.user_id })
                        .then(ratereview => {
                            //fetch request to extract aspects and another to extract sentiments, store inside Aspect_Sentiments
                            alertMessage(res, 'success', 'Review added.', 'fas fa-plus', true);
                            res.redirect(`/course/viewcourse/${id}`);
                        })
                        .catch(err => console.log(err));

                }

            })
            //get sentiments

        // aspects = ['ice maker', 'defroster', 'warranty']
        // sentiments = [{
        //         "aspect": "Cooling",
        //         "sentiment": "Positive"
        //     },
        //     {
        //         "aspect": "refrigerator",
        //         "sentiment": "Neutral"
        //     },
        //     {
        //         "aspect": "warranty",
        //         "sentiment": "Negative"
        //     },
        //     {
        //         "aspect": "defroster",
        //         "sentiment": "Negative"
        //     },
        //     {
        //         "aspect": "icemaker",
        //         "sentiment": "Negative"
        //     }
        // ]

    } else {
        alertMessage(res, 'danger', 'You have to own the product to make a review', 'fas fa-times', true);
        res.redirect("/course/viewcourse/" + id)
    }


})

router.post('/editRating/:type/:id', (req, res) => {
    console.log("we are in editrating")
    type = req.params.type;
    id = req.params.id;
    let { rating, review } = req.body;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    let aspect_extract_service = process.env.aspect_extract_service_address
    let absa_service = process.env.absa_service_address
    fetch(aspect_extract_service, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: review })
        }).then((smth) => {
            return smth.json()
        })
        .then(async(aspects) => {
            console.log("we have extracted aspects", aspects)
            if (aspects.length >= 1) {
                aspectslist = aspects
                    // console.log('i wonder what this is ', data.json())
                fetch(absa_service, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ text: review, aspects: aspectslist })
                    }).then((response) => {
                        responseClone = response.clone(); // 2
                        return response.json();
                    })
                    .then((data2) => {
                        console.log('extract-sentiment - i wonder what this is ', data2)

                        aspect_sentiment_object = data2
                        console.log('extract-sentiment - i wonder what this is ', aspect_sentiment_object)

                        // convToJson = JSON.stringify(sentiments)
                        // RateReview.create({ Rating: rating, Review: review, Date: today, CourseId: id, UserId: req.user.dataValues.user_id, })
                        //     .then(ratereview => {
                        //         //fetch request to extract aspects and another to extract sentiments, store inside Aspect_Sentiments
                        //         alertMessage(res, 'success', 'Review added.', 'fas fa-plus', true);
                        //         res.redirect(`/course/viewcourse/${id}`);
                        //     })
                        //     .catch(err => console.log(err));
                        RateReview.findOne({ where: { UserId: req.user.user_id } })
                            .then(yourRateReview => {
                                alertMessage(res, 'success', 'Review updated.', 'fas fa-plus', true);

                                yourRateReview.update({ Rating: rating, Review: review, Date: today, Aspect_Sentiments: JSON.stringify(aspect_sentiment_object) })
                                res.redirect(`/course/viewcourse/${id}`);
                            })
                            .catch(err => console.log(err));

                    }, function(rejectionReason) { // 3
                        console.log('Error parsing JSON from response:', rejectionReason, responseClone); // 4
                        responseClone.text() // 5
                            .then(function(bodyText) {
                                console.log('Received the following instead of valid JSON:', bodyText); // 6
                            });
                    })
            } else {
                RateReview.findOne({ where: { UserId: req.user.user_id } })
                    .then(yourRateReview => {
                        alertMessage(res, 'success', 'Review updated.', 'fas fa-plus', true);

                        yourRateReview.update({ Rating: rating, Review: review, Date: today, Aspect_Sentiments: JSON.stringify({}) })
                        res.redirect(`/course/viewcourse/${id}`);
                    })
                    .catch(err => console.log(err));

            }

        })

})

router.post('/deleteRating/:type/:id', (req, res) => {
    RateReview.destroy({ where: { UserId: req.user.user_id } }).then(res.redirect(`/course/viewcourse/${req.params.id}`))
})

module.exports = router;