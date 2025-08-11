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

fileInput.addEventListener('change', ()=> { if (fileInput.files && fileInput.files[0]) uploadOne(fileInput.files[0]); });

// Drag & drop (full page)
['dragenter','dragover'].forEach(ev => { window.addEventListener(ev, (e)=>{ e.preventDefault(); dropFull.classList.add('show'); }); });
['dragleave','drop'].forEach(ev => { window.addEventListener(ev, (e)=>{ e.preventDefault(); if (ev === 'drop'){ handleDrop(e); } dropFull.classList.remove('show'); }); });

function handleDrop(e){
  const dt = e.dataTransfer;
  if (!dt) return;
  const f = Array.from(dt.files || []).find(f => /image\/(gif|png|webp|jpeg)/.test(f.type));
  if (!f) return;
  uploadOne(f);
}

uploadCta.addEventListener('click', ()=> fileInput.click());

async function uploadOne(file){
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
            // redirect to viewer page for single upload
            const id = res.id;
            if (id) location.href = `./view.html?id=${encodeURIComponent(id)}`;
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

function shapeToClass(s){
  if (s === 'rounded') return 'shape-rounded';
  if (s === 'circle') return 'shape-circle';
  if (s === 'hex') return 'shape-hex';
  return 'shape-rect';
}