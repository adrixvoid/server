const request = require('supertest');
const fs = require('fs');
const { app, server } = require('../src/index');
const { createExampleFile } = require('./jest-utils');

describe('Media server', () => {
    describe('GET /', () => {
        it('should return 200 OK', async () => {
            const res = await request(app)
                .get('/')
                .expect(200);

            expect(res.text).toBe('Media server ready!');
        });
    });

    describe('GET /metadata/:filename', () => {
        it('should return 404 Not Found', async () => {
            await request(app)
                .get('/metadata/exampleNotFound.jpg')
                .expect(404);
        });
    });

    describe('POST /upload', () => {
        it('should fail to upload a file if no file is attached', async () => {
            const res = await request(app)
                .post('/upload')
                .expect(400);

            expect(res.body.error).toBe('No file attached');
        });

        it('should upload a file', async () => {
            const response = await request(app)
                .post('/upload')
                .attach('files', 'public/test/example/example.jpg', 'example.jpg')
                .expect(200);

            expect(response.body[0].success).toBe(true);
        });

        it('should fail to upload a file with invalid extension', async () => {
            const response = await request(app)
                .post('/upload')
                .attach('files', 'public/test/example/example.invalid', 'example.invalid')
                .expect(400);

            expect(response.body.error).toBe('Invalid extension');
        });
    });

    describe('DELETE /file/:filename', () => {
        it('should delete a created file', async () => {
            const file = await createExampleFile('example.jpg');

            const response = await request(app)
                .delete(`/file/${file.filename}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(`File deleted successfully`);
        })
    });

    afterAll(() => {
        // remove all files created in the test
        const files = fs.readdirSync('public/test/uploads');
        files.forEach(file => {
            fs.unlinkSync(`public/test/uploads/${file}`);
        });

        server.close();
    });
});