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



// router.use(
//     fileUpload({
//         limits: {
//             fileSize: 10000000,
//         },
//         abortOnLimit: true,
//     })
// );

//For predicting with file
router.get('/modelfileresults', (req, res) => {
    console.log("Showing predicted results of fridge model")
    res.render('model/fileresults');
});

router.get('/modelfile', (req, res) => {
    console.log("Going into file upload page")
    res.render('model/fileupload');
});

router.post('/modelfile', upload.single('image'), async (req, res) => {
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
    fetch('http://greenr-fridge-model.e5hkcje3hpamb9cz.southeastasia.azurecontainer.io/filepredict', {
        method: 'POST',
        body: formData
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            // Send the prediction result back to the client
            // Redirects the response to client with the response body
            res.render('model/fileresults', { model: data.prediction.model });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error occurred while predicting the fridge model.');
        });
});



module.exports = router;