const azure = require('azure-storage');
const config = require('./config');
const fs = require('fs');
const path = require('path');

const blobService = azure.createBlobService(config.AZURE_STORAGE_ACCOUNT_NAME, config.AZURE_STORAGE_ACCOUNT_KEY);

module.exports = {
  uploadFile: async (fileStream, filename) => {
    return new Promise((resolve, reject) => {
      const tempDir = path.join(__dirname, 'temp');
      const filePath = path.join(tempDir, filename);

      // Ensure the temp directory exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      fs.writeFileSync(filePath, fileStream);
      blobService.createBlockBlobFromLocalFile(config.CONTAINER_NAME, filename, filePath, (error, result, response) => {
        fs.unlinkSync(filePath); // Remove the temporary file
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  getFileUrl: (filename) => {
    return blobService.getUrl(config.CONTAINER_NAME, filename);
  },

  listFiles: () => {
    return new Promise((resolve, reject) => {
      blobService.listBlobsSegmented(config.CONTAINER_NAME, null, (error, result, response) => {
        if (error) {
          reject(error);
        } else {
          const fileList = result.entries.map(entry => ({ name: entry.name, url: blobService.getUrl(config.CONTAINER_NAME, entry.name) }));
          resolve(fileList);
        }
      });
    });
  },

  deleteFile: (filename) => { // Add deleteFile function
    return new Promise((resolve, reject) => {
      blobService.deleteBlob(config.CONTAINER_NAME, filename, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
  
};
