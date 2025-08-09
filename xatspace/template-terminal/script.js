document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('h2').forEach(h => {
    const txt = h.textContent;
    h.textContent = '';
    let i = 0;
    const tick = () => {
      h.textContent = txt.slice(0, i) + (i % 2 ? '_' : '');
      i++;
      if (i <= txt.length + 6) requestAnimationFrame(tick);
      else h.textContent = txt;
    };
    tick();
  });
});