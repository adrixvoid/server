const request = require('supertest');
const { app, server } = require('../src/index.js');

describe('GET /', () => {
    afterAll(() => {
        server.close();
    });

    it('responds with "Media server ready!"', done => {
        request(app)
            .get('/')
            .expect(200)
            .expect('Media server ready!', done);
    });
});