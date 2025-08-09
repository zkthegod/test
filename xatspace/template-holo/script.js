document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.card').forEach(card => {
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width/2; const cy = r.top + r.height/2;
    const dx = (e.clientX - cx)/r.width; const dy = (e.clientY - cy)/r.height;
    card.style.setProperty('--rx', `${(-dy*6).toFixed(2)}deg`);
    card.style.setProperty('--ry', `${(dx*8).toFixed(2)}deg`);
  });
});