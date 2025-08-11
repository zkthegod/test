const fileInput = document.getElementById('fileInput');
const shapeTrigger = document.getElementById('shapeTrigger');
const shapeMenu = document.getElementById('shapeMenu');
const shapeLabel = document.getElementById('shapeLabel');
const uploadBtn = document.getElementById('uploadBtn');
const thumb = document.querySelector('.thumb');
const stage = document.querySelector('.stage .imgwrap');
const dropOverlay = document.getElementById('dropOverlay');
const deck = document.getElementById('deck');
const resultsCard = document.getElementById('resultsCard');
const uploadCount = document.getElementById('uploadCount');
const deckPrev = document.getElementById('deckPrev');
const deckNext = document.getElementById('deckNext');
const progressBar = document.getElementById('progressBar');

let currentShape = 'rect';
let currentFile = null;

shapeTrigger.addEventListener('click', ()=>{
  shapeMenu.classList.toggle('open');
});
shapeMenu.addEventListener('click', (e)=>{
  const item = e.target.closest('.shape-item');
  if (!item) return;
  currentShape = item.dataset.shape;
  shapeLabel.textContent = `Shape: ${item.textContent}`;
  shapeMenu.classList.remove('open');
  updatePreview();
});

document.addEventListener('click', (e)=>{
  if (!shapeMenu.contains(e.target) && !shapeTrigger.contains(e.target)) {
    shapeMenu.classList.remove('open');
  }
});

fileInput.addEventListener('change', ()=>{
  const files = fileInput.files;
  if (!files || !files.length) return;
  currentFile = files[0];
  updatePreview();
});

// Drag & drop
['dragenter','dragover'].forEach(ev => {
  stage.addEventListener(ev, (e)=>{ e.preventDefault(); dropOverlay.classList.add('show'); });
});
['dragleave','drop'].forEach(ev => {
  stage.addEventListener(ev, (e)=>{ e.preventDefault(); if (ev === 'drop'){ handleDrop(e); } dropOverlay.classList.remove('show'); });
});

function handleDrop(e){
  const dt = e.dataTransfer;
  if (!dt) return;
  const files = Array.from(dt.files || []).filter(f => /image\/(gif|png|webp|jpeg)/.test(f.type));
  if (!files.length) return;
  fileInput.files = dt.files; // reflect
  currentFile = files[0];
  updatePreview();
}

function updatePreview(){
  thumb.className = 'thumb';
  if (currentShape === 'rounded') thumb.classList.add('shape-rounded');
  else if (currentShape === 'circle') thumb.classList.add('shape-circle');
  else if (currentShape === 'hex') thumb.classList.add('shape-hex');
  else thumb.classList.add('shape-rect');

  const ph = thumb.querySelector('.ph');
  if (currentFile){
    if (ph) ph.remove();
    let img = thumb.querySelector('img');
    if (!img){ img = document.createElement('img'); thumb.appendChild(img); }
    const url = URL.createObjectURL(currentFile);
    img.src = url;
  }
}

uploadBtn.addEventListener('click', async ()=>{
  const files = fileInput.files;
  if (!files || !files.length){ alert('Please choose image(s) first.'); return; }
  resultsCard.style.display = '';
  let done = 0;
  for (const f of files){
    if (f.size > 100 * 1024 * 1024){ alert(`${f.name} too large (max 100MB). Skipping.`); continue; }
    await uploadOne(f, (pct)=>{ progressBar.style.width = pct + '%'; });
    done++;
    uploadCount.textContent = `${done} item${done>1?'s':''}`;
  }
});

async function uploadOne(file, onProgress){
  const fd = new FormData();
  fd.append('image', file);
  fd.append('shape', currentShape);

  const xhr = new XMLHttpRequest();
  const p = new Promise((resolve) => {
    xhr.open('POST', '/api/upload');
    xhr.upload.onprogress = (e)=>{
      if (e.lengthComputable){
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress?.(pct);
      }
    };
    xhr.onreadystatechange = ()=>{
      if (xhr.readyState === 4){
        try{
          const res = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300){
            renderCard(res);
            resolve(true);
          } else {
            alert(res.error || 'Upload failed');
            resolve(false);
          }
        }catch{
          alert('Upload failed');
          resolve(false);
        }
      }
    };
  });
  xhr.send(fd);
  return p;
}

function renderCard(res){
  const url = res.url || res.directUrl || '';
  const cls = shapeToClass(res.shape || currentShape);
  const card = document.createElement('div');
  card.className = 'card-u';
  card.innerHTML = `
    <div class="shot embed-shape ${cls}"><img src="${url}" alt=""/></div>
    <div class="row"><div class="muted">Direct URL</div><div class="code">${url}</div><button class="copy">Copy</button></div>
    <div class="row"><div class="muted">BBCode</div><div class="code">[img]${url}[/img]</div><button class="copy">Copy</button></div>
    <div class="row"><div class="muted">HTML</div><div class="code">&lt;span class=\"embed-shape ${cls}\" style=\"display:inline-block;overflow:hidden\"&gt;&lt;img src=\"${url}\" alt=\"\" style=\"display:block;width:100%;height:auto\"/&gt;&lt;/span&gt;</div><button class="copy">Copy</button></div>
    <div class="row"><div class="muted">Plain URL</div><div class="code">${url}</div><button class="copy">Copy</button></div>
  `;
  deck.appendChild(card);
  wireCopyButtons(card);
}

function shapeToClass(s){
  if (s === 'rounded') return 'shape-rounded';
  if (s === 'circle') return 'shape-circle';
  if (s === 'hex') return 'shape-hex';
  return 'shape-rect';
}

function wireCopyButtons(scope){
  Array.from(scope.querySelectorAll('.copy')).forEach(btn => {
    btn.addEventListener('click', ()=>{
      const codeEl = btn.parentElement?.querySelector('.code');
      if (!codeEl) return;
      navigator.clipboard.writeText(codeEl.textContent || '').then(()=>{
        const old = btn.textContent; btn.textContent = 'Copied'; setTimeout(()=>btn.textContent=old, 1000);
      });
    });
  });
}

// Deck arrows
deckPrev?.addEventListener('click', ()=>{ deck.scrollBy({ left: -400, behavior: 'smooth' }); });
deckNext?.addEventListener('click', ()=>{ deck.scrollBy({ left:  400, behavior: 'smooth' }); });