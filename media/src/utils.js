const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');
const { PUBLIC_PATH } = require('./constants');

const IMAGE_EXTENSION = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
// Video/image/audio extensions
const ALLOWED_EXTENSIONS = [...IMAGE_EXTENSION];

/**
 * On this version, I used the path.extname() function to get the extension of the file.
 * @param {string} filename
 * @returns {string}
 * @see https://nodejs.org/api/path.html#path_path_extname_path
 */
function getExtension(filePath) {
    try {
        if (!filePath) {
            throw new Error('File is required');
        }

        return path.extname(filePath).toLowerCase();
    } catch (error) {
        return '';
    }
}

function isValidExtension(filePath) {
    return ALLOWED_EXTENSIONS.includes(getExtension(filePath));
}

/**
 * Función para verificar si un archivo es una imagen
 * Function to check if a file is an image
 * @param {string} filename
 * @returns {boolean}
 */
function isImageExtension(filename) {
    try {
        const ext = path.extname(filename).toLowerCase();
        return IMAGE_EXTENSION.includes(ext);
    } catch (error) {
        return false;
    }
}

// Check if the directory exists
function checkPublicDirectoryExist(directoryPath) {
    if (!fs.existsSync(directoryPath)) {
        try {
            // Create the directory if it doesn't exist
            fs.mkdirSync(directoryPath, { recursive: true });
            return { success: true, message: 'Directory created', path: directoryPath };
        } catch (error) {
            return { success: false, message: 'Error creating directory', path: directoryPath };
        }
    }
}


/**
 * On this version, I used the new Date().toISOString() function to get the current date and time in ISO format,
 * Then, I used the path.parse() function to get the name and extension of the file.
 * Finally, I used the String.concat() function to concatenate the timestamp, the name of the file and its extension.
 * With this configuration, when you upload a file, it will be renamed using the format you specified
 * (for example, "20231103214715_name-of-the-file.jpg").
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
 * @param {string} oldName
 * @returns {string}
 */
function generateNewFilename(originalName) {
    try {
        // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
        const parsedName = path.parse(originalName).name;
        const extension = path.extname(originalName);
        return `${timestamp}_${parsedName}${extension}`;
    } catch (error) {
        return originalName;
    }
}

/**
 * Rename a file
 * @param {{ originalname: string, path: string }} file
 * @returns {Promise<boolean>}
 * @see https://nodejs.org/api/fs.html#fs_fs_rename_oldpath_newpath_callback
 */
function renameFile(file) {
    const newFilename = generateNewFilename(file.originalname);
    const savePath = path.join(path.dirname(file.path), newFilename);

    return new Promise((resolve, reject) => {
        fs.rename(file.path, savePath, (err) => {
            if (err) {
                reject(new Error(`
                    Error renaming file: ${err.message}
                    original path: ${file.path}
                    new path: ${newFilename}
                `));
            } else {
                resolve({
                    fileName: newFilename,
                    src: savePath
                });
            }
        });
    })
}

/**
 * Delete a file from the file system passing the file path
 * @param {string} filePath
 * @returns {boolean}
 */
function deleteFile(filePath) {
    try {
        if (!filePath) {
            return false;
        }
        fs.rmSync(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Get the metadata of an image
 * @param {string} filePath
 * @returns {{ width: number, height: number, type: string }}
 */
function getImageMetadata(filePath) {
    return sizeOf(filePath);
}

/**
 * Get the metadata of a file
 * @param {string} filepath
 * @returns {{ src: string, width?: number, height?: number, type?: string }}
 * @see https://www.npmjs.com/package/image-size
 * type file: {
        fieldname: 'files',
        originalname: 'example.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/test/uploads',
        filename: '20231124190354458_example.jpg',
        path: 'public/test/uploads/20231124190354458_example.jpg',
        size: 1056
    },
 */
function getFileMetadata(file) {
    const metadata = {
        path: file.path?.replace(PUBLIC_PATH, '')
    };

    if (isImageExtension(file.filename)) {
        const imageMetadata = getImageMetadata(file.path);
        Object.assign(metadata, imageMetadata);
    }

    return metadata;
}

exports.getExtension = getExtension;
exports.isValidExtension = isValidExtension;
exports.isImageExtension = isImageExtension;
exports.checkPublicDirectoryExist = checkPublicDirectoryExist;
exports.generateNewFilename = generateNewFilename;
exports.renameFile = renameFile;
exports.deleteFile = deleteFile;
exports.getImageMetadata = getImageMetadata;
exports.getFileMetadata = getFileMetadata;
