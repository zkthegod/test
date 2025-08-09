const c = document.getElementById('bg');
const ctx = c.getContext('2d');
let w, h, t = 0;
function resize(){ w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
window.addEventListener('resize', resize); resize();
function draw(){
  t += 0.02; ctx.clearRect(0,0,w,h); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(108,92,231,0.35)';
  const gap = 28; for(let y = -gap; y < h + gap; y += gap){
    ctx.beginPath(); for(let x = -gap; x < w + gap; x += gap){
      const yy = y + Math.sin((x*0.02)+t)*8 + Math.cos((y*0.02)+t)*8;
      if (x === -gap) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    } ctx.stroke();
  }
  requestAnimationFrame(draw);
} draw();