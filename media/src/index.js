const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const ansis = require('ansis');
const { isValidExtension, generateNewFilename, checkPublicDirectoryExist, deleteFile, getImageMetadata, getFileMetadata } = require('../utils/utils');
require('dotenv').config()

const PORT = process.env.MEDIA_INTERNAL_PORT || 2001;
const app = express();

// Middleware para analizar el cuerpo de las solicitudes (para el manejo de archivos)
app.use(bodyParser.json());

// Directory where files are stored
const PUBLIC_PATH = process.env.MEDIA_PUBLIC_PATH || 'public';
const UPLOAD_PATH = process.env.MEDIA_UPLOAD_PATH || 'public/uploads';

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
        if (file.originalname) {
            cb(null, generateNewFilename(file.originalname));
        } else {
            cb(new Error('Original-name is not defined'));
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
        fs.unlinkSync(path.join(UPLOAD_PATH, file.originalname))
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
    upload.array('files')(req, res, async (err) => {
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
                const metadata = getImageMetadata(path.join(UPLOAD_PATH, file.filename));

                result.push({
                    success: true,
                    status: 200,
                    file,
                    data: metadata,
                });
            } catch (error) {
                fs.unlink(file.filename)
                result.push({
                    success: false,
                    message: error.message,
                    filename: file.filename,
                    status: 400,
                });
                res.status(400);
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

        const metadata = getFileMetadata(filename);

        console.log({ metadata })

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
