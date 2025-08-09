document.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelector('.l1').style.transform = `translateY(${y * 0.15}px)`;
  document.querySelector('.l2').style.transform = `translateY(${y * 0.25}px)`;
});