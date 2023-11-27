// jest-utils.js
const fs = require('fs');
const path = require('path');

function getExamplePath(exampleFileName) {
    return {
        relativePath: path.join(process.env.MEDIA_UPLOAD_PATH, exampleFileName),
        fullPath: path.resolve(process.env.MEDIA_UPLOAD_PATH, exampleFileName),
    }
}

/**
 * Create an example file for testing purposes
 * @param {string} exampleFileName
 * @returns {Promise<{ exist: boolean, filename: string, relativePath: string, fullPath: string }>}
 * @example
 * const example = await createExampleFile("example.jpg")
 * // {
 * //     exist: true,
 * //     filename: 'example.jpg',
 * //     relativePath: 'public/uploads/example.jpg',
 * //     fullPath: '/Users/username/Sites/fiebre/fiebre-server/media/public/uploads/example.jpg'
 * // }
 */
async function createExampleFile(exampleFileName) {
    return new Promise(async (resolve, reject) => {
        try {
            // check if the directory exists
            if (process.env.MEDIA_UPLOAD_PATH && !fs.existsSync(process.env.MEDIA_UPLOAD_PATH)) {
                fs.mkdirSync(process.env.MEDIA_UPLOAD_PATH);
            }

            // create the file
            const examplePath = getExamplePath(exampleFileName);
            fs.writeFileSync(examplePath.relativePath, '');

            const exist = fs.existsSync(examplePath.relativePath);

            resolve({
                exist,
                filename: exampleFileName,
                ...examplePath
            });
        } catch (error) {
            reject({ error: error.message });
        }
    })
}

/**
 * Get an example file for testing purposes
 * @param {string} exampleFileName
 * @returns {Promise<string>}
 * @example
 * const example = await getExampleFile("example.jpg")
 */
async function getExampleFile(exampleFileName = "example.jpg") {
    return new Promise((resolve, reject) => {
        try {
            fs.readFile(`public/test/example/${exampleFileName}`, 'utf8', (err, data) => {
                if (err) {
                    console.error('An error occurred:', err);
                    return;
                }

                resolve(data);
            });
        } catch (error) {
            reject({ error: error.message });
        }
    })
}

// delete directly
// fs.rmdirSync(process.env.MEDIA_UPLOAD_PATH, { recursive: true });
/**
 * Delete an example file
 * @param {string} filename
 * @returns {Promise<void>}
 */
async function deleteExampleFile(filename) {
    const filePath = path.join(process.env.MEDIA_UPLOAD_PATH, filename)
    try {
        const exists = fs.existsSync(filePath);
        if (exists) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    throw new Error(`Error deleting file: ${err.message}`);
                }
            })
        }
    } catch (error) {
        return false;
    }
}

module.exports = {
    getExamplePath,
    getExampleFile,
    createExampleFile,
    deleteExampleFile,
};