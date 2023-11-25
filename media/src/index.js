require('dotenv').config()
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const ansis = require('ansis');
const { isValidExtension, generateNewFilename, checkPublicDirectoryExist, deleteFile, getFileMetadata } = require('./utils');
const { PUBLIC_PATH, UPLOAD_PATH } = require('./constants');

const PORT = process.env.MEDIA_INTERNAL_PORT || 2001;
const app = express();

// Middleware para analizar el cuerpo de las solicitudes (para el manejo de archivos)
app.use(bodyParser.json());

checkPublicDirectoryExist(PUBLIC_PATH)

app.get('/', (req, res) => {
    res.send('Media server ready!');
});

app.use(express.static(PUBLIC_PATH));

// Configuration of Multer for file handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_PATH);
    },
    filename: (req, file, cb) => {
        try {
            if (!file) {
                throw new Error('No file attached');
            }

            if (file.originalname) {
                cb(null, generateNewFilename(file.originalname));
            } else {
                throw new Error('Original-name is not defined')
            }
        } catch (error) {
            cb(error);
        }
    },
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

// Route to upload a file
app.post('/upload', (req, res) => {
    return upload.array('files')(req, res, async (err) => {
        if (err) {
            res.status(400).json({ success: false, error: err.message });
            return;
        }

        if (!req.files || req.files.length === 0) {
            res.status(400).json({ success: false, error: 'No file attached' });
            return;
        }

        const files = req.files;
        const result = [];

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
                // fs.unlink(file.path)
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
});

// Route to get the full URL of a file with its metadata
app.get('/metadata/:filename', (req, res) => {
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
});

// Route to delete a specific file
app.delete('/file/:filename', (req, res) => {
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
});

const server = app.listen(PORT, () => {
    console.log(ansis.green(`Media server is listening on port http://localhost:${PORT}`));
    console.log(ansis.cyan(`external port http://localhost:${process.env.MEDIA_EXTERNAL_PORT}`));
    console.log('public path:', PUBLIC_PATH);
});

exports.server = server;
exports.app = app;
