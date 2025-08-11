const fileInput = document.getElementById('fileInput');
const shapeTrigger = document.getElementById('shapeTrigger');
const shapeMenu = document.getElementById('shapeMenu');
const uploadBtn = document.getElementById('uploadBtn');
const dropFull = document.getElementById('dropFull');

let currentShape = 'rect';

// Shape dropdown functionality
shapeTrigger.addEventListener('click', (e)=>{
  console.log('Shape trigger clicked');
  e.stopPropagation();
  e.preventDefault();
  const isOpen = shapeMenu.classList.contains('open');
  console.log('Menu currently open:', isOpen);
  shapeMenu.classList.toggle('open');
  const newState = shapeMenu.classList.contains('open');
  console.log('Menu now open:', newState);
  shapeTrigger.setAttribute('aria-expanded', String(newState));
});

// Prevent mousedown from interfering
shapeTrigger.addEventListener('mousedown', (e)=> {
  e.stopPropagation();
  e.preventDefault();
});

shapeMenu.addEventListener('click', (e)=>{
  const item = e.target.closest('.shape-item');
  if (!item) return;
  
  // Remove active class from all items
  document.querySelectorAll('.shape-item').forEach(i => {
    i.classList.remove('active');
    i.setAttribute('aria-selected', 'false');
  });
  
  currentShape = item.dataset.shape;
  item.classList.add('active');
  item.setAttribute('aria-selected', 'true');
  shapeMenu.classList.remove('open');
  shapeTrigger.setAttribute('aria-expanded', 'false');
  
  // Update the trigger text to show selected shape
  const shapeText = item.querySelector('span:last-child').textContent;
  shapeTrigger.querySelector('.shape-text').textContent = shapeText;
  shapeTrigger.title = `Selected: ${shapeText}`;
});

document.addEventListener('click', (e)=>{
  if (!shapeMenu.contains(e.target) && !shapeTrigger.contains(e.target)) {
    shapeMenu.classList.remove('open');
    shapeTrigger.setAttribute('aria-expanded', 'false');
  }
});

// Upload button functionality
uploadBtn.addEventListener('click', (e)=>{
  fileInput.click();
});

// File input change handler
fileInput.addEventListener('change', (e)=> { 
  if (fileInput.files && fileInput.files.length > 0) {
    console.log('Files selected:', fileInput.files.length);
    uploadMultiple(Array.from(fileInput.files));
  }
});

// Also prevent the file input from being triggered by the CTA's children
fileInput.addEventListener('click', (e) => {
  e.stopPropagation();
});

// Drag & drop (full page) with debounce to avoid flicker
let dragCounter = 0; 
let overlayTimer = 0;

['dragenter','dragover'].forEach(ev => { 
  window.addEventListener(ev, (e)=>{ 
    e.preventDefault(); 
    dragCounter++; 
    clearTimeout(overlayTimer); 
    dropFull.classList.add('show'); 
  }); 
});

['dragleave'].forEach(ev => { 
  window.addEventListener(ev, (e)=>{ 
    e.preventDefault(); 
    dragCounter = Math.max(0, dragCounter-1); 
    if (dragCounter===0){
      overlayTimer = setTimeout(()=> dropFull.classList.remove('show'), 60); 
    } 
  }); 
});

['drop'].forEach(ev => { 
  window.addEventListener(ev, (e)=>{ 
    e.preventDefault(); 
    dragCounter=0; 
    dropFull.classList.remove('show'); 
    handleDrop(e); 
  }); 
});

// Toast helper
function showToast(msg, isError=true){
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<div>${msg}</div><div class="bar"></div>`;
  wrap.appendChild(el);
  let w = 100;
  const int = setInterval(()=>{ w -= 2; el.querySelector('.bar').style.width = w + '%'; if (w<=0){ clearInterval(int); el.remove(); } }, 80);
}

function handleDrop(e){
  const dt = e.dataTransfer;
  if (!dt) return;
  
  const files = Array.from(dt.files || []).filter(f => /image\/(gif|png|webp|jpeg)/.test(f.type));
  if (files.length === 0) { 
    showToast('No supported image files found'); 
    return; 
  }
  
  console.log('Files dropped:', files.length);
  uploadMultiple(files);
}

// Mock upload system for testing (remove this when you have real backend)
const MOCK_IMAGES = [
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2', 
  'https://picsum.photos/400/300?random=3',
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5',
  'https://picsum.photos/400/300?random=6',
  'https://picsum.photos/400/300?random=7',
  'https://picsum.photos/400/300?random=8'
];

const MOCK_SHAPES = ['rect', 'circle', 'rounded', 'hex'];

function generateMockUploadResult(file, shape) {
  const randomImage = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
  const randomId = Math.random().toString(36).substr(2, 9);
  
  return {
    id: randomId,
    filename: file.name,
    shape: shape,
    url: `./view.html?id=${randomId}`,
    directUrl: randomImage,
    size: file.size,
    uploadedAt: new Date().toISOString()
  };
}

async function uploadMultiple(files) {
  if (files.length === 0) return;
  
  // Show loading state
  const uploadLabel = uploadBtn.querySelector('span');
  const originalText = uploadLabel.textContent;
  uploadBtn.style.pointerEvents = 'none';
  uploadBtn.style.opacity = '0.7';
  uploadLabel.textContent = 'Uploading...';
  
  showToast(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`, false);
  
  const results = [];
  let successCount = 0;
  
  try {
    // Simulate upload delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    for (const file of files) {
      if (file.size > 100 * 1024 * 1024) {
        showToast(`${file.name} is too large (max 100MB)`);
        continue;
      }
      
      try {
        // Use mock upload for testing
        const result = generateMockUploadResult(file, currentShape);
        results.push(result);
        successCount++;
      } catch (error) {
        console.error('Upload error:', error);
        showToast(`Failed to upload ${file.name}`);
      }
    }
    
    if (successCount > 0) {
      showResults(results);
      showToast(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}!`, false);
    }
  } finally {
    // Restore button state
    uploadBtn.style.pointerEvents = 'auto';
    uploadBtn.style.opacity = '1';
    uploadLabel.textContent = originalText;
  }
}

// Remove this when you have real backend
async function uploadOne(file) {
  // Mock upload - remove this function when you have real backend
  return generateMockUploadResult(file, currentShape);
}

function showResults(results) {
  const resultsCard = document.getElementById('resultsCard');
  const deck = document.getElementById('deck');
  const uploadCount = document.getElementById('uploadCount');
  
  if (!resultsCard || !deck || !uploadCount) return;
  
  // Update count
  uploadCount.textContent = `${results.length} item${results.length > 1 ? 's' : ''}`;
  
  // Clear previous results
  deck.innerHTML = '';
  
  // Add each result with beautiful design
  results.forEach((result, index) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-header">
        <div class="result-meta">
          <h3 class="result-title">${result.filename}</h3>
          <div class="result-details">
            <span class="result-shape ${shapeToClass(result.shape)}">${result.shape}</span>
            <span class="result-size">${formatFileSize(result.size)}</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="action-btn copy-btn" data-url="${result.directUrl}" title="Copy direct link">
            <i class="fas fa-copy"></i>
          </button>
          <button class="action-btn share-btn" data-url="${result.url}" title="Copy share link">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
      </div>
      
      <div class="result-image-container">
        <img src="${result.directUrl}" alt="${result.filename}" loading="lazy" class="result-image">
        <div class="image-overlay">
          <a href="${result.url}" class="view-btn" target="_blank">
            <i class="fas fa-external-link-alt"></i>
            <span>View</span>
          </a>
        </div>
      </div>
      
      <div class="result-links">
        <div class="link-group">
          <label class="link-label">Direct Link:</label>
          <div class="link-input-group">
            <input type="text" value="${result.directUrl}" readonly class="link-input direct-link">
            <button class="copy-link-btn" data-url="${result.directUrl}">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div class="link-group">
          <label class="link-label">Share Link:</label>
          <div class="link-input-group">
            <input type="text" value="${result.url}" readonly class="link-input share-link">
            <button class="copy-link-btn" data-url="${result.url}">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    
    deck.appendChild(card);
  });
  
  // Show results section with smooth animation
  resultsCard.style.display = 'block';
  resultsCard.style.opacity = '0';
  resultsCard.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    resultsCard.style.transition = 'all 0.4s ease-out';
    resultsCard.style.opacity = '1';
    resultsCard.style.transform = 'translateY(0)';
  }, 100);
  
  // Add copy functionality for all copy buttons
  document.querySelectorAll('.copy-link-btn, .copy-btn, .share-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.url;
      try {
        await navigator.clipboard.writeText(url);
        showCopySuccess(btn);
      } catch (err) {
        showToast('Failed to copy link');
      }
    });
  });
  
  // Handle deck navigation
  const deckPrev = document.getElementById('deckPrev');
  const deckNext = document.getElementById('deckNext');
  
  if (deckPrev && deckNext) {
    let currentIndex = 0;
    const totalCards = results.length;
    
    function updateNavigation() {
      deckPrev.style.opacity = currentIndex === 0 ? '0.3' : '1';
      deckNext.style.opacity = currentIndex === totalCards - 1 ? '0.3' : '1';
      
      deckPrev.disabled = currentIndex === 0;
      deckNext.disabled = currentIndex === totalCards - 1;
      
      // Smooth scroll to current card
      const cards = deck.querySelectorAll('.result-card');
      if (cards[currentIndex]) {
        cards[currentIndex].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center'
        });
      }
    }
    
    deckPrev.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateNavigation();
      }
    });
    
    deckNext.addEventListener('click', () => {
      if (currentIndex < totalCards - 1) {
        currentIndex++;
        updateNavigation();
      }
    });
    
    updateNavigation();
  }
}

function showCopySuccess(button) {
  const originalHTML = button.innerHTML;
  button.innerHTML = '<i class="fas fa-check"></i>';
  button.classList.add('copied');
  
  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.classList.remove('copied');
  }, 2000);
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function shapeToClass(s){
  if (s === 'rounded') return 'shape-rounded';
  if (s === 'circle') return 'shape-circle';
  if (s === 'hex') return 'shape-hex';
  return 'shape-rect';
}