const fs = require('fs');
const path = require('path');
const { multer } = require('./multer');

const { UPLOAD_PATH } = require('./constants');
const { isValidExtension, deleteFile, getFileMetadata } = require('./utils');

const rootController = (req, res) => {
    res.send('Media server ready!');
}

const uploadController = (req, res) => {
    multer.any()(req, res, async (err) => {
        if (err) {
            res.status(400).json({ success: false, error: err.message });
            return;
        }

        if (!req.files || req.files.length === 0) {
            res.status(400).json({ success: false, error: 'No file attached' });
            return;
        }

        const result = [];
        const files = req.files;

        for (const file of files) {
            try {
                const metadata = getFileMetadata(file);

                result.push({
                    success: true,
                    status: 200,
                    file,
                    metadata: metadata,
                });
            } catch (error) {
                result.push({
                    success: false,
                    message: error.message,
                    status: 400,
                    file,
                });
            }
        }

        res.json(result);
    });
}

const metadataController = (req, res) => {
    try {
        const filename = req.params.filename;

        if (!isValidExtension(filename)) {
            throw new Error('Invalid file extension');
        }

        const file = fs.readFileSync(path.join(UPLOAD_PATH, filename));

        const metadata = getFileMetadata(file);

        res.json({ success: true, metadata });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

const deleteController = (req, res) => {
    try {
        const filename = req.params.filename;

        if (!isValidExtension(filename)) {
            throw new Error('Invalid file extension');
        }

        const filepath = path.join(UPLOAD_PATH, filename);

        if (!fs.existsSync(filepath)) {
            throw new Error('File not found');
        }

        deleteFile(filepath);

        res.json({ success: true, message: `File deleted successfully` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

exports.rootController = rootController;
exports.uploadController = uploadController;
exports.metadataController = metadataController;
exports.deleteController = deleteController;