const c = document.getElementById('universe');
const ctx = c.getContext('2d');
let w, h, dpr;
function resize(){ dpr = Math.min(2, window.devicePixelRatio||1); w = c.width = Math.floor(innerWidth*dpr); h = c.height = Math.floor(innerHeight*dpr); c.style.width = innerWidth+'px'; c.style.height = innerHeight+'px'; }
window.addEventListener('resize', resize); resize();

// Blackhole parameters
let hole = { x: w/2, y: h*0.5, r: 60*dpr, targetX: w/2, targetY: h*0.5 };
let mouse = { x: w/2, y: h/2 };
window.addEventListener('pointermove', (e)=>{ mouse.x = e.clientX*dpr; mouse.y = e.clientY*dpr; hole.targetX = mouse.x; hole.targetY = mouse.y;});

// Stars
const NUM = 500;
const stars = Array.from({length:NUM}, ()=>({
  x: Math.random()*w,
  y: Math.random()*h,
  z: Math.random()*1 + 0.2,
  a: Math.random()*Math.PI*2,
  r: Math.random()*1.8 + 0.4
}));

// Satellites/junk
const sats = Array.from({length:10}, (_,i)=>({
  R: (80 + i*18)*dpr,
  a: Math.random()*Math.PI*2,
  s: (i%2?0.003:0.002) + Math.random()*0.002,
  size: 6 + (i%3)*4
}));

function drawBlackhole(){
  const grd = ctx.createRadialGradient(hole.x, hole.y, hole.r*0.2, hole.x, hole.y, hole.r*1.8);
  grd.addColorStop(0, 'rgba(0,0,0,1)');
  grd.addColorStop(0.5, 'rgba(10,14,26,0.2)');
  grd.addColorStop(1, 'rgba(10,14,26,0)');
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(hole.x, hole.y, hole.r*2.2, 0, Math.PI*2); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

function step(){
  // Ease hole toward target
  hole.x += (hole.targetX - hole.x)*0.06;
  hole.y += (hole.targetY - hole.y)*0.06;

  ctx.clearRect(0,0,w,h);

  // Background starfield
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0,0,w,h);

  // Stars affected by gravity + swirl
  for (let s of stars){
    // Vector to hole
    const dx = hole.x - s.x;
    const dy = hole.y - s.y;
    const dist = Math.hypot(dx, dy) + 0.001;

    // Gravitational pull strength
    const pull = Math.min(0.6, (hole.r*1.5) / (dist*80));

    // Swirl factor (tangential velocity)
    const tang = 0.9 / (dist/200 + 1);

    // Move star
    s.x += dx * pull + (-dy) * tang * 0.01;
    s.y += dy * pull + (dx) * tang * 0.01;

    // If swallowed, respawn at edge
    if (dist < hole.r*0.6){
      const edge = Math.random() < 0.5 ? 0 : 1;
      if (Math.random() < 0.5){ s.x = edge? w + 10: -10; s.y = Math.random()*h; }
      else { s.y = edge? h + 10: -10; s.x = Math.random()*w; }
      continue;
    }

    // Twinkle + draw
    const tw = (Math.sin((s.x+s.y)*0.01)+1)/2 * 0.6 + 0.4;
    ctx.fillStyle = `rgba(234,240,255,${(0.6*s.z*tw).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r*s.z, 0, Math.PI*2); ctx.fill();
  }

  // Accretion ring
  ctx.strokeStyle = 'rgba(139,124,246,0.35)';
  ctx.lineWidth = 2*dpr;
  ctx.beginPath(); ctx.arc(hole.x, hole.y, hole.r*1.2, 0, Math.PI*2); ctx.stroke();

  // Satellites / junk
  sats.forEach((sat,i)=>{
    sat.a += sat.s;
    const x = hole.x + Math.cos(sat.a)*sat.R;
    const y = hole.y + Math.sin(sat.a)*sat.R* (i%2? 0.7:1);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(sat.a*1.2);
    ctx.fillStyle = i%3===0 ? 'rgba(124,255,214,.9)' : 'rgba(234,240,255,.9)';
    ctx.fillRect(-sat.size/2, -sat.size/2, sat.size, sat.size);
    ctx.restore();
  });

  drawBlackhole();
  requestAnimationFrame(step);
}
step();