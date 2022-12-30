const multer = require("multer");
const path = require('path');

const storageForUploads = multer.diskStorage({
    destination: './public/images/Institutionpictures/banner',
    filename: function(req, file, cb) {
        cb(null, req.user.user_id + '-' + file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storageForUploads,
    limits: { fileSize: 10000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('institutionBannerUpload')

function checkFileType(file, cb) {

    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!')
    }

};


module.exports = upload;