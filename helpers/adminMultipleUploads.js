const multer = require('multer');
const path = require('path');

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === "profile_pic") {
            cb(null, './public/admin/images/adminProfilePictures/')
        } else if (file.fieldname === "background_img") {
            cb(null, './public/admin/images/adminBackgroundPictures/');
        } else if (file.fieldname === "certificate") {
            cb(null, './public/admin/images/adminCertificates/')
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === "profile_pic") {
            cb(null, req.user.user_id + '-' + Date.now() + path.extname(file.originalname));
        } else if (file.fieldname === "background_img") {
            cb(null, req.user.user_id + '-' + Date.now() + path.extname(file.originalname));
        } else if (file.fieldname === "certificate") {
            cb(null, req.user.user_id + '-' + Date.now() + path.extname(file.originalname));
        }
    }
});
const uploads = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).fields(
    [{
            name: 'profile_pic',
            maxCount: 1
        },
        {
            name: 'background_img',
            maxCount: 1
        },
        {
            name: 'certificate'
        }
    ]
);

function checkFileType(file, cb) {
    if (file.fieldname === "background_img" || file.fieldname === "profile_pic" || file.fieldname === "certificate") {
        if (
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg' ||
            fiel.mimetype === 'image/gif'
        ) { // check file type to be png, jpeg, or jpg
            cb(null, true);
        } else {
            cb(null, false); // else fails
        }
    }
}

module.exports = uploads;