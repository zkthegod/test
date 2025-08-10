const c = document.getElementById('universe');
const ctx = c.getContext('2d');
let w, h, dpr;
function resize(){ dpr = Math.min(2, window.devicePixelRatio||1); w = c.width = Math.floor(innerWidth*dpr); h = c.height = Math.floor(innerHeight*dpr); c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px'; }
window.addEventListener('resize', resize); resize();

// Blackhole parameters
let hole = { x: w/2, y: h*0.52, r: 70*dpr, targetX: w/2, targetY: h*0.52 };
let mouse = { x: w/2, y: h/2 };
window.addEventListener('pointermove', (e)=>{ mouse.x = e.clientX*dpr; mouse.y = e.clientY*dpr; hole.targetX = mouse.x; hole.targetY = mouse.y;});

// Stars
const NUM = 900;
const stars = Array.from({length:NUM}, ()=>({
  x: Math.random()*w,
  y: Math.random()*h,
  z: Math.random()*1 + 0.2,
  a: Math.random()*Math.PI*2,
  r: Math.random()*1.8 + 0.4,
  hue: 210 + Math.random()*60
}));

// Galactic dust particles
const DUST = Array.from({length:240}, ()=>({
  x: Math.random()*w,
  y: Math.random()*h,
  s: Math.random()*2 + 0.5,
  a: Math.random()*Math.PI*2,
  hue: 260 + Math.random()*120,
  o: Math.random()*0.12+0.03,
}));

// Satellites/junk
const sats = Array.from({length:14}, (_,i)=>({
  R: (90 + i*20)*dpr,
  a: Math.random()*Math.PI*2,
  s: (i%2?0.003:0.002) + Math.random()*0.002,
  size: 6 + (i%3)*4
}));

function blackholeGradient(){
  const grd = ctx.createRadialGradient(hole.x, hole.y, hole.r*0.2, hole.x, hole.y, hole.r*2.2);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.45, 'rgba(20,24,40,0.35)');
  grd.addColorStop(1, 'rgba(10,14,26,0)');
  return grd;
}

function vignette(){
  const g = ctx.createRadialGradient(w*0.5, h*0.5, Math.min(w,h)*0.2, w*0.5, h*0.5, Math.max(w,h)*0.7);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
}

function drawBackground(){
  // Subtle galaxy color wash
  const bg = ctx.createLinearGradient(0,0,w,h);
  bg.addColorStop(0, 'rgba(10,14,26,1)');
  bg.addColorStop(1, 'rgba(12,16,28,1)');
  ctx.fillStyle = bg; ctx.fillRect(0,0,w,h);

  // Dust clouds
  DUST.forEach(d => {
    d.a += 0.001;
    const ox = Math.cos(d.a)*8; const oy = Math.sin(d.a)*8;
    ctx.fillStyle = `hsla(${d.hue}, 80%, 70%, ${d.o})`;
    ctx.beginPath(); ctx.ellipse(d.x+ox, d.y+oy, d.s*20, d.s*8, d.a, 0, Math.PI*2); ctx.fill();
  });
}

function drawBlackhole(){
  ctx.globalCompositeOperation = 'screen';
  // Accretion ring glow
  ctx.strokeStyle = 'rgba(139,124,246,0.35)';
  ctx.lineWidth = 2*dpr;
  ctx.beginPath(); ctx.arc(hole.x, hole.y, hole.r*1.25, 0, Math.PI*2); ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';

  // Core gradient
  ctx.fillStyle = blackholeGradient();
  ctx.beginPath(); ctx.arc(hole.x, hole.y, hole.r*2.4, 0, Math.PI*2); ctx.fill();
}

function drawStars(){
  for (let s of stars){
    const dx = hole.x - s.x;
    const dy = hole.y - s.y;
    const dist = Math.hypot(dx, dy) + 0.001;
    const pull = Math.min(0.8, (hole.r*2.0) / (dist*85));
    const tang = 1.0 / (dist/200 + 1);

    s.x += dx * pull + (-dy) * tang * 0.012;
    s.y += dy * pull + (dx) * tang * 0.012;

    if (dist < hole.r*0.65){
      const edge = Math.random() < 0.5 ? 0 : 1;
      if (Math.random() < 0.5){ s.x = edge? w + 10: -10; s.y = Math.random()*h; }
      else { s.y = edge? h + 10: -10; s.x = Math.random()*w; }
      continue;
    }

    const tw = (Math.sin((s.x+s.y)*0.01)+1)/2 * 0.6 + 0.4;
    ctx.fillStyle = `hsla(${s.hue}, 80%, 85%, ${(0.55*s.z*tw).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r*s.z, 0, Math.PI*2); ctx.fill();
  }
}

function drawSats(){
  sats.forEach((sat,i)=>{
    sat.a += sat.s;
    const x = hole.x + Math.cos(sat.a)*sat.R;
    const y = hole.y + Math.sin(sat.a)*sat.R* (i%2? 0.7:1);
    ctx.save(); ctx.translate(x,y); ctx.rotate(sat.a*1.2);
    const grad = ctx.createLinearGradient(-sat.size, -sat.size, sat.size, sat.size);
    grad.addColorStop(0, 'rgba(124,255,214,.9)'); grad.addColorStop(1, 'rgba(234,240,255,.9)');
    ctx.fillStyle = grad; ctx.fillRect(-sat.size/2, -sat.size/2, sat.size, sat.size);
    ctx.restore();
  });
}

// Reactive floating name
const nameEl = document.querySelector('.float-name');
let nameTiltX = 0, nameTiltY = 0;
function updateName(){
  const nx = (mouse.x/dpr / innerWidth) * 2 - 1;
  const ny = (mouse.y/dpr / innerHeight) * 2 - 1;
  nameTiltX += ((-ny*10) - nameTiltX)*0.08;
  nameTiltY += ((nx*14) - nameTiltY)*0.08;
  const dz = Math.sin(Date.now()*0.001)*8;
  nameEl.style.transform = `translateX(-50%) translateZ(0) rotateX(${nameTiltX.toFixed(2)}deg) rotateY(${nameTiltY.toFixed(2)}deg) translateY(${dz.toFixed(1)}px)`;
  nameEl.style.textShadow = `0 0 20px rgba(139,124,246,.7), 0 0 40px rgba(0,245,212,.25), 0 0 ${12 + Math.abs(dz)/2}px rgba(139,124,246,.55)`;
}

function step(){
  hole.x += (hole.targetX - hole.x)*0.06;
  hole.y += (hole.targetY - hole.y)*0.06;

  drawBackground();
  drawStars();
  drawSats();
  drawBlackhole();
  vignette();
  updateName();
  requestAnimationFrame(step);
}
step();