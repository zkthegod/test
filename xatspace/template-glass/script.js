document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.grid-photos img').forEach(img => {
    const rect = img.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    img.style.transform = `rotateX(${(-dy*6).toFixed(2)}deg) rotateY(${(dx*6).toFixed(2)}deg)`;
    img.style.transition = 'transform .06s linear';
  });
});