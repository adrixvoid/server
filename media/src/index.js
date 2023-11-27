require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ansis = require('ansis');
const { PUBLIC_PATH } = require('./constants');
const { rootController, uploadController, metadataController, deleteController } = require('./controllers');

const PORT = process.env.MEDIA_INTERNAL_PORT || 2001;
const app = express();

// Middleware for analyze the body of the requests (for file handling)
app.use(bodyParser.json());
app.get('/', rootController);
// serve public path
app.use(express.static(PUBLIC_PATH));
// Route to upload a file
app.post('/upload', uploadController);
// Route to get the full URL of a file with its metadata
app.get('/metadata/:filename', metadataController);
// Route to delete a specific file
app.delete('/file/:filename', deleteController);

const server = app.listen(PORT, () => {
    console.log(ansis.green(`Media server is listening on port http://localhost:${PORT}`));
    console.log(ansis.cyan(`external port http://localhost:${process.env.MEDIA_EXTERNAL_PORT}`));
    console.log('public path:', PUBLIC_PATH);
});

exports.server = server;
exports.app = app;
