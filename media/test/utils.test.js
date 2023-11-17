const fs = require('fs');
const sizeOf = require('image-size');
const { getExtension, isValidExtension, isImageExtension, generateNewFilename, renameFile, getImageMetadata } = require('../utils/utils');

jest.mock('image-size');
jest.mock('fs');

describe('Utils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getExtension', () => {
        it('should return empty string if no file name is passed', () => {
            const extension = getExtension();
            expect(extension).toBe('');
        });

        it('should return empty string if the file name does not have an extension', () => {
            const extension = getExtension('filename');
            expect(extension).toBe('');
        });

        it('should return the file extension', () => {
            const extension = getExtension('filename.txt');
            expect(extension).toBe('.txt');
        });
    });

    describe('isValidExtension', () => {
        it('should return false if no file name is passed', () => {
            const isValid = isValidExtension();
            expect(isValid).toBe(false);
        });

        it('should return false if the file name does not have an extension', () => {
            const isValid = isValidExtension('filename');
            expect(isValid).toBe(false);
        });

        it('should return false if the file extension is not valid', () => {
            const isValid = isValidExtension('filename.txt');
            expect(isValid).toBe(false);
        });

        it('should return true if the file extension is valid', () => {
            const isValid = isValidExtension('filename.jpg');
            expect(isValid).toBe(true);
        });
    });

    describe('isImageExtension', () => {
        it('should return false if no file name is passed', () => {
            const isValid = isImageExtension();
            expect(isValid).toBe(false);
        });

        it('should return false if the file name does not have an extension', () => {
            const isValid = isImageExtension('filename');
            expect(isValid).toBe(false);
        });

        it('should return false if the file extension is not valid', () => {
            const isValid = isImageExtension('filename.txt');
            expect(isValid).toBe(false);
        });

        it('should return true if the file extension is valid', () => {
            const isValid = isImageExtension('filename.jpg');
            expect(isValid).toBe(true);
        });
    });

    describe('generateNewFilename', () => {
        it('should return the same file name if the extension is valid', () => {
            const fileName = generateNewFilename('filename.jpg');
            expect(fileName).not.toBe('filename.jpg');
        });
    });

    describe('renameFile', () => {
        it('should return an error if no file is passed', async () => {
            fs.rename = jest.fn((oldPath, newPath, callback) => {
                callback(new Error('Some error'));
            });

            try {
                await renameFile();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });

        it('should return the new file name and path', async () => {
            fs.rename = jest.fn((oldPath, newPath, callback) => {
                callback(null);
            });

            const result = await renameFile({
                originalname: 'filename.jpg',
                path: process.env.MEDIA_UPLOAD_PATH
            });

            expect(result).toEqual({
                fileName: expect.any(String),
                src: expect.any(String)
            });
        });
    });

    describe('getImageMetadata', () => {
        it('should return null if no file path is passed', () => {
            const metadata = getImageMetadata();
            expect(metadata).toBe(undefined);
        })

        it('should return null if the file does not exist', () => {
            const metadata = getImageMetadata('non-existing-file.png')
            expect(metadata).toBe(undefined);
        });

        it('should return the image metadata', async () => {
            sizeOf.mockReturnValue({
                width: 100,
                height: 100,
                type: 'jpg',
            });

            const metadata = getImageMetadata('path/to/file.jpg');
            console.log("metadata", metadata)

            expect(metadata).toEqual({
                width: 100,
                height: 100,
                type: 'jpg'
            });
        });
    });
});