const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const azureStorage = require('./azureStorage');
const bodyParser = require('body-parser');
const app = express();

app.use(fileUpload());
app.use(bodyParser.json()); // Parse JSON-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('node_modules/bootstrap/dist'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/files', async (req, res) => {
  try {
    const fileList = await azureStorage.listFiles();
    res.json(fileList);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Error listing files.' });
  }
});

app.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const uploadedFile = req.files.file;
  const filename = uploadedFile.name;

  try {
    await azureStorage.uploadFile(uploadedFile.data, filename);
    const fileUrl = azureStorage.getFileUrl(filename);
    res.send(`File uploaded successfully. Access it <a href="${fileUrl}">here</a>.`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file.');
  }
});


app.post('/delete', async (req, res) => {
    const filename = req.body.filename; // Retrieve filename from request body
    if (!filename) {
      return res.status(400).send('Filename is required.');
    }
  
    try {
      await azureStorage.deleteFile(filename);
      res.send('File deleted successfully.');
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).send('Error deleting file.');
    }
  });

app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).send('Filename is required.');
    }
  
    try {
      const fileUrl = azureStorage.getFileUrl(filename);
      res.redirect(fileUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).send('Error downloading file.');
    }
  });

  app.post('/delete', async (req, res) => {
    const filename = req.body.filename;
    if (!filename) {
      return res.status(400).send('Filename is required.');
    }
  
    try {
      await azureStorage.deleteFile(filename);
      res.send('File deleted successfully.');
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).send('Error deleting file.');
    }
  });
  app.get('/preview/:filename', async (req, res) => {
    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).send('Filename is required.');
    }
  
    try {
      const fileUrl = azureStorage.getFileUrl(filename);
      res.redirect(fileUrl);
    } catch (error) {
      console.error('Error previewing file:', error);
      res.status(500).send('Error previewing file.');
    }
  });
  
  app.get('/share/:filename', async (req, res) => {
    const filename = req.params.filename;
    if (!filename) {
      return res.status(400).send('Filename is required.');
    }
  
    try {
      const fileUrl = azureStorage.getFileUrl(filename);
      res.send(fileUrl);
    } catch (error) {
      console.error('Error getting shareable link:', error);
      res.status(500).send('Error getting shareable link.');
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
