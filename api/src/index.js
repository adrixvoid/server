import express from 'express';
import bodyParser from 'body-parser';
import { createPool } from 'mysql2/promise';
import { config } from 'dotenv';
config()

const PORT_FALLBACK = 2000;

const app = express();

const pool = createPool({
    // localhost is for non-container environment
    // host: 'localhost',
    // mysqldb is for container environment, the name given in docker-compose.yml
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASSWORD,
    // 3307 is the default port outside docker
    // 3306 is the default port for MySQL in Docker
    port: process.env.MYSQL_DB_INTERNAL_PORT
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Api server ready!');
});

app.get('/ping', async (_, res) => {
    const result = await pool.query('SELECT NOW()');
    res.json(result[0]);
});

app.listen(process.env.API_INTERNAL_PORT || PORT_FALLBACK, () => {
    console.log('\x1b[32m%s\x1b[0m', 'listening on port', process.env.API_INTERNAL_PORT || PORT_FALLBACK);
    console.log('\x1b[32m%s\x1b[0m', 'external port', process.env.API_EXTERNAL_PORT);
});