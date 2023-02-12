const express = require('express');
const { buildCheckFunction } = require('express-validator');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fileUpload = require('express-fileupload');
const fetch = require('node-fetch'); // Add this line to import the fetch API

const FormData = require("form-data")
const form = new FormData()
const fs = require('fs');
const { response } = require('express');


router.get('/fileorcamera', (req, res) => {
    console.log("going into the file or camera page")
    res.render('fridge/fileorcamera');
});

//For predicting with file
router.get('/fileresults', (req, res) => {
    console.log("Showing predicted results")
    res.render('fridge/fileresults');
});

router.get('/file', (req, res) => {
    console.log("Going into file upload page")
    res.render('fridge/fileupload');
});

router.post('/file', upload.single('image'), async (req, res) => {
    console.log('Uploading file to predict');

    // Get the file from the request
    const file = req.file;

    // checking what is the file
    console.log('file', file)

    // checking if file is invalid
    if (!file) {
        console.error('Invalid file:', file);
        return res.status(400).send('Invalid file');
    }

    const formData = new FormData();
    formData.append('image', file.buffer, { filename: file.originalname });

    // Send the file to the prediction server
    fetch('http://greenr-fridge-brand.ceadcbb5fbbwbbc5.southeastasia.azurecontainer.io/filepredict', {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            // Send the prediction result back to the client
            // Redirects the response to client with the response body
            res.render('fridge/fileresults', { brand: data.prediction.brand });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error occurred while predicting the fridge brand.');
        });
});


// For predicting with camera
router.get('/cameraresults', (req, res) => {
    res.render('fridge/cameraresults');
});

router.get('/camera', (req, res) => {
    console.log("going into camera page")
    res.render('fridge/camerastream');
});


router.post('/camera', async (req, res) => {
    console.log("Using camera image to predict");
    const image_b64 = req.body.image_b64;

    try {
        const response = await fetch("http://greenr-fridge-brand.ceadcbb5fbbwbbc5.southeastasia.azurecontainer.io/camerapredict", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 'image_b64': image_b64 })
        });
        const data = await response.json();
        console.log(data);
        // Send the prediction result back to the client
        // Redirects the response to client with the response body
        res.json({ brand: data.prediction.brand });
        //res.render('fridge/cameraresults', { brand: data.prediction.brand });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error occurred while predicting the fridge brand.' });
    }
});


module.exports = router;

