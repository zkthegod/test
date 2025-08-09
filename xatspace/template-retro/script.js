setInterval(()=>{
  const h = document.querySelector('h1');
  h.style.visibility = (h.style.visibility === 'hidden') ? 'visible' : 'hidden';
}, 800);