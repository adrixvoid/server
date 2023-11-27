require('dotenv').config()
const multer = require('multer');
const { isValidExtension, generateNewFilename, checkPublicDirectoryExist } = require('./utils');
const { PUBLIC_PATH, UPLOAD_PATH } = require('./constants');

checkPublicDirectoryExist(PUBLIC_PATH)

// Configuration of Multer for file handling
const storage = multer.diskStorage({
    destination: UPLOAD_PATH,
    filename: function (req, file, cb) {
        cb(null, generateNewFilename(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    try {
        if (!file) {
            throw new Error('No file attached');
        }

        if (!isValidExtension(file.originalname)) {
            throw new Error('Invalid extension');
        }

        cb(null, true);
    } catch (error) {
        cb(error, false);
    }
};

const upload = multer({
    storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: process.env.MEDIA_UPLOAD_MAX_SIZE,
    },
});

module.exports = {
    multer: upload,
};
