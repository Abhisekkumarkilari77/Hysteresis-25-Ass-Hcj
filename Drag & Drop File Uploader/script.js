const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const uploadBtn = document.getElementById('upload-btn');
const clearBtn = document.getElementById('clear-btn');

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'video/mp4'];

let files = [];
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('active');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('active');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('active');
  handleFiles(e.dataTransfer.files);
});

dropZone.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});
function handleFiles(newFiles) {
  Array.from(newFiles).forEach(file => {
    if (!validateFile(file)) return;
    
    const fileObj = {
      id: Date.now() + Math.random(),
      file: file,
      status: 'pending',
      progress: 0
    };
    
    files.push(fileObj);
    renderFile(fileObj);
  });
  
  updateButtons();
}
function validateFile(file) {
  if (files.some(f => f.file.name === file.name && f.file.size === file.size)) {
    showError('Duplicate file: ' + file.name);
    return false;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    showError(`File too large: ${file.name} (max 5MB)`);
    return false;
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    showError(`Invalid file type: ${file.name}`);
    return false;
  }
  
  return true;
}
function renderFile(fileObj) {
  const card = document.createElement('div');
  card.className = 'file-card';
  card.dataset.id = fileObj.id;
  
  const preview = createPreview(fileObj.file);
  const info = document.createElement('div');
  info.className = 'file-info';
  info.innerHTML = `
    <div class="file-name">${fileObj.file.name}</div>
    <div class="file-size">${formatFileSize(fileObj.file.size)}</div>
  `;
  
  const progress = document.createElement('div');
  progress.className = 'file-progress';
  progress.innerHTML = `
    <div class="progress-bar">
      <div class="progress-fill" style="width: 0%"></div>
    </div>
    <div class="progress-text">Ready</div>
  `;
  
  const status = document.createElement('span');
  status.className = 'status pending';
  status.textContent = 'Pending';
  
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.innerHTML = '✕';
  removeBtn.onclick = () => removeFile(fileObj.id);
  
  card.appendChild(preview);
  card.appendChild(info);
  card.appendChild(progress);
  card.appendChild(status);
  card.appendChild(removeBtn);
  
  fileList.appendChild(card);
}
function createPreview(file) {
  const container = document.createElement('div');
  
  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    const reader = new FileReader();
    reader.onload = (e) => img.src = e.target.result;
    reader.readAsDataURL(file);
    container.className = 'file-preview';
    container.appendChild(img);
  } else {
    container.className = 'file-icon';
    const ext = file.name.split('.').pop().toUpperCase();
    container.textContent = ext;
  }
  
  return container;
}
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
function removeFile(id) {
  files = files.filter(f => f.id !== id);
  const card = document.querySelector(`[data-id="${id}"]`);
  card.remove();
  updateButtons();
}
clearBtn.addEventListener('click', () => {
  files = [];
  fileList.innerHTML = '';
  updateButtons();
});
uploadBtn.addEventListener('click', () => {
  files.forEach(fileObj => {
    if (fileObj.status === 'pending') {
      uploadFile(fileObj);
    }
  });
  uploadBtn.disabled = true;
});
function uploadFile(fileObj) {
  const card = document.querySelector(`[data-id="${fileObj.id}"]`);
  const progressFill = card.querySelector('.progress-fill');
  const progressText = card.querySelector('.progress-text');
  const status = card.querySelector('.status');
  
  fileObj.status = 'uploading';
  status.className = 'status uploading';
  status.textContent = 'Uploading';
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 100) progress = 100;
    
    fileObj.progress = progress;
    progressFill.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      fileObj.status = 'complete';
      progressFill.classList.add('complete');
      status.className = 'status complete';
      status.textContent = 'Complete';
      progressText.textContent = 'Done';
    }
  }, 200);
}
function updateButtons() {
  const hasPendingFiles = files.some(f => f.status === 'pending');
  uploadBtn.disabled = !hasPendingFiles;
  clearBtn.disabled = files.length === 0;
}
function showError(message) {
  const existing = document.querySelector('.error-message');
  if (existing) existing.remove();
  
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = message;
  dropZone.parentElement.insertBefore(error, dropZone.nextSibling);
  
  setTimeout(() => error.remove(), 4000);
}
