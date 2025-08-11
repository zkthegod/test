const fileInput = document.getElementById('fileInput');
const shapeTrigger = document.getElementById('shapeTrigger');
const shapeMenu = document.getElementById('shapeMenu');
const uploadCta = document.getElementById('uploadCta');
const dropFull = document.getElementById('dropFull');

let currentShape = 'rect';

// Prevent shape trigger from opening file dialog
shapeTrigger.addEventListener('click', (e)=>{
  e.stopPropagation();
  e.preventDefault();
  shapeMenu.classList.toggle('open');
  shapeTrigger.setAttribute('aria-expanded', String(shapeMenu.classList.contains('open')));
});

// Prevent mousedown from triggering file input
shapeTrigger.addEventListener('mousedown', (e)=> {
  e.stopPropagation();
  e.preventDefault();
});

shapeMenu.addEventListener('click', (e)=>{
  const item = e.target.closest('.shape-item');
  if (!item) return;
  
  // Remove active class from all items
  document.querySelectorAll('.shape-item').forEach(i => i.classList.remove('active'));
  
  currentShape = item.dataset.shape;
  item.classList.add('active');
  shapeMenu.classList.remove('open');
  shapeTrigger.setAttribute('aria-expanded', 'false');
  
  // Update the trigger text to show selected shape
  const shapeText = item.textContent;
  shapeTrigger.textContent = shapeText.charAt(0).toLowerCase();
  shapeTrigger.title = `Selected: ${shapeText}`;
});

document.addEventListener('click', (e)=>{
  if (!shapeMenu.contains(e.target) && !shapeTrigger.contains(e.target)) {
    shapeMenu.classList.remove('open');
    shapeTrigger.setAttribute('aria-expanded', 'false');
  }
});

// Clicking CTA opens file dialog (but not when clicking shape trigger)
uploadCta.addEventListener('click', (e)=>{
  if (e.target === shapeTrigger || shapeTrigger.contains(e.target)) return;
  fileInput.click();
});

// Drag & drop (full page) with debounce to avoid flicker
let dragCounter = 0; let overlayTimer = 0;
['dragenter','dragover'].forEach(ev => { window.addEventListener(ev, (e)=>{ e.preventDefault(); dragCounter++; clearTimeout(overlayTimer); dropFull.classList.add('show'); }); });
['dragleave'].forEach(ev => { window.addEventListener(ev, (e)=>{ e.preventDefault(); dragCounter = Math.max(0, dragCounter-1); if (dragCounter===0){ overlayTimer = setTimeout(()=> dropFull.classList.remove('show'), 60); } }); });
['drop'].forEach(ev => { window.addEventListener(ev, (e)=>{ e.preventDefault(); dragCounter=0; dropFull.classList.remove('show'); handleDrop(e); }); });

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

fileInput.addEventListener('change', ()=> { 
  if (fileInput.files && fileInput.files.length > 0) {
    uploadMultiple(Array.from(fileInput.files));
  }
});

function handleDrop(e){
  const dt = e.dataTransfer;
  if (!dt) return;
  const files = Array.from(dt.files || []).filter(f => /image\/(gif|png|webp|jpeg)/.test(f.type));
  if (files.length === 0) { 
    showToast('No supported image files found'); 
    return; 
  }
  uploadMultiple(files);
}

async function uploadMultiple(files) {
  if (files.length === 0) return;
  
  // Show loading state
  const uploadLabel = uploadCta.querySelector('.label');
  const originalText = uploadLabel.innerHTML;
  uploadCta.style.pointerEvents = 'none';
  uploadCta.style.opacity = '0.7';
  uploadLabel.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
  
  showToast(`Uploading ${files.length} file${files.length > 1 ? 's' : ''}...`, false);
  
  const results = [];
  let successCount = 0;
  
  try {
    for (const file of files) {
      if (file.size > 100 * 1024 * 1024) {
        showToast(`${file.name} is too large (max 100MB)`);
        continue;
      }
      
      try {
        const result = await uploadOne(file);
        if (result) {
          results.push(result);
          successCount++;
        }
      } catch (error) {
        showToast(`Failed to upload ${file.name}`);
      }
    }
    
    if (successCount > 0) {
      showResults(results);
      showToast(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}!`, false);
    }
  } finally {
    // Restore button state
    uploadCta.style.pointerEvents = 'auto';
    uploadCta.style.opacity = '1';
    uploadLabel.innerHTML = originalText;
  }
}

async function uploadOne(file){
  const fd = new FormData();
  fd.append('image', file);
  fd.append('shape', currentShape);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.onreadystatechange = ()=>{
      if (xhr.readyState === 4){
        try{
          const res = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300){
            const id = res.id;
            if (id) {
              resolve({
                id: id,
                filename: file.name,
                shape: currentShape,
                url: `./view.html?id=${encodeURIComponent(id)}`,
                directUrl: res.url || `./view.html?id=${encodeURIComponent(id)}`
              });
            } else {
              resolve(null);
            }
          } else {
            showToast(res.error || 'Upload failed');
            resolve(null);
          }
        }catch{
          showToast('Upload failed');
          resolve(null);
        }
      }
    };
    xhr.send(fd);
  });
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
  
  // Add each result
  results.forEach((result, index) => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-image">
        <img src="${result.directUrl}" alt="${result.filename}" loading="lazy">
        <div class="shape-badge ${shapeToClass(result.shape)}">${result.shape}</div>
      </div>
      <div class="result-info">
        <h3>${result.filename}</h3>
        <div class="result-links">
          <a href="${result.url}" class="btn btn-primary" target="_blank">
            <i class="fas fa-external-link-alt"></i> View
          </a>
          <button class="btn btn-secondary copy-link" data-url="${result.directUrl}">
            <i class="fas fa-copy"></i> Copy Link
          </button>
        </div>
      </div>
    `;
    
    deck.appendChild(card);
  });
  
  // Show results section
  resultsCard.style.display = 'block';
  
  // Add copy link functionality
  document.querySelectorAll('.copy-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      navigator.clipboard.writeText(url).then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
        }, 2000);
      }).catch(() => {
        showToast('Failed to copy link');
      });
    });
  });
  
  // Handle deck navigation
  const deckPrev = document.getElementById('deckPrev');
  const deckNext = document.getElementById('deckNext');
  
  if (deckPrev && deckNext) {
    let currentIndex = 0;
    const totalCards = results.length;
    
    function updateNavigation() {
      deckPrev.style.opacity = currentIndex === 0 ? '0.5' : '1';
      deckNext.style.opacity = currentIndex === totalCards - 1 ? '0.5' : '1';
      
      // Scroll to current card
      const cards = deck.querySelectorAll('.result-card');
      if (cards[currentIndex]) {
        cards[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

function shapeToClass(s){
  if (s === 'rounded') return 'shape-rounded';
  if (s === 'circle') return 'shape-circle';
  if (s === 'hex') return 'shape-hex';
  return 'shape-rect';
}