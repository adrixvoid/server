import express from 'express';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
config()

const PORT_FALLBACK = 2001;

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Media server ready!');
});

app.get('/ping', async (_, res) => {
    return res.json({ message: 'pong' });
});

app.listen(process.env.MEDIA_INTERNAL_PORT || PORT_FALLBACK, () => {
    console.log('\x1b[32m%s\x1b[0m', 'listening on port', process.env.MEDIA_INTERNAL_PORT || PORT_FALLBACK);
    console.log('\x1b[32m%s\x1b[0m', 'external port', process.env.MEDIA_EXTERNAL_PORT);
});