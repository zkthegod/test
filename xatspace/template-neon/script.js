document.addEventListener('DOMContentLoaded', () => {
  const lb = document.getElementById('lightbox');
  const imgEl = lb.querySelector('img');
  document.getElementById('gallery').addEventListener('click', (e) => {
    const img = e.target.closest('img');
    if (!img) return;
    imgEl.src = img.src.replace(/\/\d+\/\d+$/, '/1200/800');
    lb.style.display = 'flex';
  });
  lb.addEventListener('click', () => { lb.style.display = 'none'; imgEl.src=''; });

  const wrap = document.querySelector('.neon-wrap');
  function onMove(e){
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    wrap.style.setProperty('--mx', x.toFixed(3));
    wrap.style.setProperty('--my', (-y).toFixed(3));
  }
  window.addEventListener('pointermove', onMove, { passive: true });
});