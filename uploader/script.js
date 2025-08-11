const fileInput = document.getElementById('fileInput');
const shapeTrigger = document.getElementById('shapeTrigger');
const shapeMenu = document.getElementById('shapeMenu');
const shapeLabel = document.getElementById('shapeLabel');
const uploadBtn = document.getElementById('uploadBtn');
const thumb = document.querySelector('.thumb');
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
  const f = fileInput.files && fileInput.files[0];
  if (!f) return;
  currentFile = f;
  updatePreview();
});

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
  if (!currentFile){ alert('Please choose an image first.'); return; }
  if (currentFile.size > 100 * 1024 * 1024){ alert('File too large (max 100MB).'); return; }

  const fd = new FormData();
  fd.append('image', currentFile);
  fd.append('shape', currentShape);

  // Use XHR for progress
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/upload');
  xhr.upload.onprogress = (e)=>{
    if (e.lengthComputable){
      const pct = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = pct + '%';
    }
  };
  xhr.onreadystatechange = ()=>{
    if (xhr.readyState === 4){
      try{
        const res = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300){
          renderResults(res);
        } else {
          alert(res.error || 'Upload failed');
        }
      }catch{
        alert('Upload failed');
      }
    }
  };
  xhr.send(fd);
});

function renderResults(res){
  const d = document.getElementById('directUrl');
  const b = document.getElementById('bbcode');
  const h = document.getElementById('htmlcode');
  const p = document.getElementById('plain');

  const url = res.url || res.directUrl || '';
  const cls = shapeToClass(res.shape || currentShape);
  d.textContent = url;
  p.textContent = url;
  b.textContent = `[img]${url}[/img]`;
  h.textContent = `<span class="embed-shape ${cls}" style="display:inline-block;overflow:hidden"><img src="${url}" alt="" style="display:block;width:100%;height:auto"/></span>`;
}

function shapeToClass(s){
  if (s === 'rounded') return 'shape-rounded';
  if (s === 'circle') return 'shape-circle';
  if (s === 'hex') return 'shape-hex';
  return 'shape-rect';
}

// Copy buttons
Array.from(document.querySelectorAll('.copy')).forEach(btn => {
  btn.addEventListener('click', ()=>{
    const id = btn.dataset.copy;
    const el = document.getElementById(id);
    navigator.clipboard.writeText(el.textContent || '').then(()=>{
      const old = btn.textContent; btn.textContent = 'Copied'; setTimeout(()=>btn.textContent=old, 1000);
    });
  });
});