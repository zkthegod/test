const fileInput = document.getElementById('fileInput');
const shapeTrigger = document.getElementById('shapeTrigger');
const shapeMenu = document.getElementById('shapeMenu');
const uploadCta = document.getElementById('uploadCta');
const dropFull = document.getElementById('dropFull');

let currentShape = 'rect';

shapeTrigger.addEventListener('click', (e)=>{
  e.stopPropagation();
  shapeMenu.classList.toggle('open');
  shapeTrigger.setAttribute('aria-expanded', String(shapeMenu.classList.contains('open')));
});
// prevent caret from triggering file input
shapeTrigger.addEventListener('mousedown', (e)=> e.stopPropagation());

shapeMenu.addEventListener('click', (e)=>{
  const item = e.target.closest('.shape-item');
  if (!item) return;
  currentShape = item.dataset.shape;
  shapeMenu.classList.remove('open');
  shapeTrigger.setAttribute('aria-expanded', 'false');
});

document.addEventListener('click', (e)=>{
  if (!shapeMenu.contains(e.target) && !shapeTrigger.contains(e.target)) {
    shapeMenu.classList.remove('open');
    shapeTrigger.setAttribute('aria-expanded', 'false');
  }
});

// Clicking CTA opens file dialog
uploadCta.addEventListener('click', (e)=>{ if (e.target === shapeTrigger) return; fileInput.click(); });

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

fileInput.addEventListener('change', ()=> { if (fileInput.files && fileInput.files[0]) uploadOne(fileInput.files[0]); });

function handleDrop(e){
  const dt = e.dataTransfer;
  if (!dt) return;
  const f = Array.from(dt.files || []).find(f => /image\/(gif|png|webp|jpeg)/.test(f.type));
  if (!f) { showToast('Unsupported file type'); return; }
  uploadOne(f);
}

async function uploadOne(file){
  if (file.size > 100 * 1024 * 1024){ showToast('File too large (max 100MB)'); return; }
  const fd = new FormData();
  fd.append('image', file);
  fd.append('shape', currentShape);

  const xhr = new XMLHttpRequest();
  const p = new Promise((resolve) => {
    xhr.open('POST', '/api/upload');
    xhr.onreadystatechange = ()=>{
      if (xhr.readyState === 4){
        try{
          const res = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300){
            const id = res.id;
            if (id) location.href = `./view.html?id=${encodeURIComponent(id)}`;
            resolve(true);
          } else {
            showToast(res.error || 'Upload failed');
            resolve(false);
          }
        }catch{
          showToast('Upload failed');
          resolve(false);
        }
      }
    };
  });
  xhr.send(fd);
  return p;
}

function shapeToClass(s){
  if (s === 'rounded') return 'shape-rounded';
  if (s === 'circle') return 'shape-circle';
  if (s === 'hex') return 'shape-hex';
  return 'shape-rect';
}