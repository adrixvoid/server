import express from 'express';
import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
config();

const PORT_FALLBACK = 2000;
const PORT = process.env.API_INTERNAL_PORT || PORT_FALLBACK;

const app = express();
app.use(express.json());

const pool = createPool({
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASSWORD,
    port: process.env.MYSQL_DB_INTERNAL_PORT
});

app.get('/', (req, res) => {
    res.send('Api server ready!');
});

app.get('/ping', async (req, res) => {
    const result = await pool.query('SELECT NOW()');
    res.json(result[0]);
});

app.post('/post/create', async (req, res) => {
    const QUERY = `INSERT INTO webapp_db.Post (id, title, content, createdAt, updatedAt) VALUES (NULL, "${req.body.project}", "${req.body.description}", NOW(), NOW())`;
    const result = await pool.query(QUERY);

    res.status(200).json({
        success: false,
        result,
        body: req.body
    });
});

app.listen(PORT, () => {
    console.log('\x1b[32m%s\x1b[0m', `API server listening on port http://locahost:${PORT}`);
    console.log('\x1b[32m%s\x1b[0m', 'external port', process.env.API_EXTERNAL_PORT);
});