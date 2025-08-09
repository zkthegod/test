document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  const imgEl = lb.querySelector('img');
  document.getElementById('gallery').addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;
    imgEl.src = img.src.replace(/\/\d+\/\d+$/,'/1200/800');
    lb.style.display = 'flex';
  });
  lb.addEventListener('click', () => { lb.style.display = 'none'; imgEl.src=''; });
});