const request = require('supertest');
const { app, server } = require('../src/index');
const fs = require('fs');
const { createExampleFile } = require('../utils/test-utils');

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
                .get('/metadata/example.jpg')
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

        it('should fail to upload a file with invalid extension', async () => {
            const example = await createExampleFile("example.notvalid")

            const response = await request(app)
                .post('/upload')
                .attach('files', example.relativePath)
                .expect(400);

            expect(response.body.error).toBe('Invalid extension');
        });

        it('should upload a file', async () => {
            const example = await createExampleFile("example.png")

            const response = await request(app)
                .post('/upload')
                .attach('files', example.filepath, example.filename)
                .attach('files', 'public/uploads/example.gif')
                .expect(200);

            expect(response.body[0].success).toBe(true);
        });
    });

    describe('DELETE /file/:filename', () => {
        it('should delete a created file', async () => {
            const example = await createExampleFile("example.jpg")

            const response = await request(app)
                .delete('/file/' + example.filename)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(`File deleted successfully`);
        })
    });

    afterAll(() => {
        fs.rm(process.env.MEDIA_UPLOAD_PATH, { recursive: true })
        server.close();
    });
});