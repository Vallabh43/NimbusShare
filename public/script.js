document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('fileInput');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
  
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
  
      const result = await response.text();
      document.getElementById('message').innerHTML = result;
      await listFiles(); // Refresh the file list after uploading
    } catch (error) {
      console.error('Error uploading file:', error);
      document.getElementById('message').innerHTML = 'Error uploading file.';
    }
  });
  

async function listFiles() {
    try {
      const response = await fetch('/files');
      const files = await response.json();
      const fileList = document.getElementById('fileList');
      fileList.innerHTML = '';
      files.forEach(file => {
        const fileItem = document.createElement('div');
        const icon = getIcon(file.name);
        const img = document.createElement('img');
        img.src = icon;
        img.alt = file.name;
        img.classList.add('file-icon');
        const fileName = document.createElement('span');
        fileName.textContent = file.name;
        fileName.classList.add('file-name');
  
        // Buttons for download, preview, delete, and get shareable link
        const downloadBtn = document.createElement('button');
        downloadBtn.setAttribute('type', 'button');
        downloadBtn.classList.add('btn', 'btn-outline-success');
        downloadBtn.textContent = 'Download';
        downloadBtn.addEventListener('click', () => downloadFile(file.name));
  
        // const previewBtn = document.createElement('button');
        // previewBtn.textContent = 'Preview';
        // previewBtn.addEventListener('click', () => previewFile(file.name));
  
        const deleteBtn = document.createElement('button');
        deleteBtn.setAttribute('type', 'button');
        deleteBtn.classList.add('btn', 'btn-outline-danger');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteFile(file.name));
  
        const shareBtn = document.createElement('button');
        shareBtn.setAttribute('type', 'button');
        shareBtn.classList.add('btn', 'btn-outline-info');
        shareBtn.textContent = 'Share';
        shareBtn.addEventListener('click', () => getShareableLink(file.name));
  
        const btnContainer = document.createElement('div');
        btnContainer.appendChild(downloadBtn);
        // btnContainer.appendChild(previewBtn);
        btnContainer.appendChild(deleteBtn);
        btnContainer.appendChild(shareBtn);
  
        fileItem.appendChild(img);
        fileItem.appendChild(fileName);
        fileItem.appendChild(btnContainer);
  
        fileList.appendChild(fileItem);
      });
    } catch (error) {
      console.error('Error fetching file list:', error);
    }
  }
  
  async function downloadFile(filename) {
    try {
      const link = document.createElement('a');
      link.href = `/download/${filename}`;
      link.download = filename;
      link.click();
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  }
  
  
//   async function previewFile(filename) {
//     try {
//       const response = await fetch(`/preview/${filename}`);
//       // Handle preview logic, e.g., open in a new window or modal
//     } catch (error) {
//       console.error('Error previewing file:', error);
//     }
//   }
  
  async function deleteFile(filename) {
    try {
      const response = await fetch('/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename }) // Send filename in request body
      });
      const result = await response.text();
      console.log(result);
      await listFiles(); // Refresh the file list after deletion
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
  
  
  async function getShareableLink(filename) {
    try {
      const response = await fetch(`/share/${filename}`);
      const link = await response.text();
      const shareLinkContainer = document.getElementById('shareLinkContainer');
      shareLinkContainer.innerHTML = `<p>Shareable Link: <a href="${link}" target="_blank">${link}</a></p>`;
    } catch (error) {
      console.error('Error getting shareable link:', error);
    }
  }
  
  
  
  function getIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'icons/pdf-icon.png';
      case 'doc':
      case 'docx':
        return 'icons/word-icon.png';
      case 'xls':
      case 'xlsx':
        return 'icons/excel-icon.png';
      case 'ppt':
      case 'pptx':
        return 'icons/powerpoint-icon.png';
      case 'txt':
        return 'icons/text-icon.png';
      default:
        return 'icons/file-icon.png';
    }
  }
  
  // Initial file list retrieval
  listFiles();
  