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

// Replace square "bubbles" with polygonal debris and tiny sprite dots
const debris = Array.from({length:22}, (_,i)=>({
  R: (110 + i*22)*dpr,
  a: Math.random()*Math.PI*2,
  s: 0.0015 + Math.random()*0.0025,
  sides: 3 + (i%5),
  size: 5 + Math.random()*8,
  hue: 210 + Math.random()*120
}));

const comets = Array.from({length:6}, ()=>({
  x: Math.random()*w, y: Math.random()*h,
  vx: -0.5*dpr + Math.random()*dpr, vy: -0.2*dpr + Math.random()*0.4*dpr,
  life: 400 + Math.random()*400
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
    const dirx = dx / dist, diry = dy / dist;
    // Inverse-square-like soft pull
    const pull = Math.min(1.2, (hole.r*hole.r*0.6) / (dist*dist + 2000));
    // Tangential swirl diminishing with distance
    const tang = Math.min(0.8, (hole.r*0.4) / (dist + 200));
    // Update velocity components for smooth motion
    s.vx = (s.vx||0) * 0.96 + (dirx * pull + -diry * tang) * 1.4;
    s.vy = (s.vy||0) * 0.96 + (diry * pull +  dirx * tang) * 1.4;
    s.x += s.vx; s.y += s.vy;

    if (dist < hole.r*0.65){
      const edge = Math.random() < 0.5 ? 0 : 1;
      if (Math.random() < 0.5){ s.x = edge? w + 10: -10; s.y = Math.random()*h; }
      else { s.y = edge? h + 10: -10; s.x = Math.random()*w; }
      s.vx = s.vy = 0;
      continue;
    }

    const tw = (Math.sin((s.x+s.y)*0.01)+1)/2 * 0.6 + 0.4;
    ctx.fillStyle = `hsla(${s.hue}, 80%, 85%, ${(0.5*(s.z||1)*tw).toFixed(3)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r*(s.z||1), 0, Math.PI*2); ctx.fill();
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

function drawRock(cx, cy, baseR, seed){
  // Generate irregular outline
  const points = 24; const rands = [];
  for(let i=0;i<points;i++){ rands.push((Math.sin(i*12.9898+seed)*43758.5453)%1); }
  ctx.beginPath();
  for(let i=0;i<points;i++){
    const t = (i/points)*Math.PI*2;
    const rr = baseR * (0.75 + rands[i]*0.6);
    const x = cx + Math.cos(t)*rr; const y = cy + Math.sin(t)*rr*0.9;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.closePath();
  // Shading
  const lx = 0.6, ly = -0.8; // light dir
  const grad = ctx.createRadialGradient(cx - lx*baseR*0.6, cy - ly*baseR*0.6, baseR*0.2, cx, cy, baseR*1.2);
  grad.addColorStop(0, 'rgba(180,190,210,0.9)');
  grad.addColorStop(1, 'rgba(80,90,110,0.9)');
  ctx.fillStyle = grad; ctx.fill();
}

function drawDebris(){
  debris.forEach((d,i)=>{
    d.a += d.s;
    const x = hole.x + Math.cos(d.a)*d.R;
    const y = hole.y + Math.sin(d.a)*(i%2? d.R*0.7 : d.R);
    ctx.save(); ctx.translate(x,y); ctx.rotate(d.a*0.8);
    drawRock(0,0, (d.size||8)*dpr, i*13.37);
    ctx.restore();
  });

  // tiny sprite stars
  for (let i=0;i<18;i++){
    const a = Date.now()*0.0002 + i; const R = (140 + i*10)*dpr;
    const x = hole.x + Math.cos(a)*R; const y = hole.y + Math.sin(a)*R* (i%2? 0.6:1);
    ctx.fillStyle = 'rgba(234,240,255,.8)'; ctx.fillRect(x, y, 1*dpr, 1*dpr);
  }
}

function drawComets(){
  comets.forEach(c=>{
    c.x += c.vx; c.y += c.vy; c.life -= 1;
    if (c.x < -20 || c.y < -20 || c.x > w+20 || c.y > h+20 || c.life <= 0){
      c.x = Math.random()*w; c.y = Math.random()*h; c.vx = -0.5*dpr + Math.random()*dpr; c.vy = -0.2*dpr + Math.random()*0.4*dpr; c.life = 400 + Math.random()*400;
    }
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1*dpr; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x - c.vx*12, c.y - c.vy*12); ctx.stroke();
  });
}

// Reactive floating name
const nameEl = document.querySelector('.float-name');
let nameTiltX = 0, nameTiltY = 0;
let nameBaseY = 0, nameTime = 0;
function updateName(){
  nameTime += 0.016;
  const nx = (mouse.x/dpr / innerWidth) * 2 - 1;
  const ny = (mouse.y/dpr / innerHeight) * 2 - 1;
  nameTiltX += ((-ny*10) - nameTiltX)*0.08;
  nameTiltY += ((nx*14) - nameTiltY)*0.08;
  nameBaseY = Math.sin(nameTime*0.6)*8 + Math.cos(nameTime*0.3)*4;
  const dz = nameBaseY;
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
  drawDebris();
  drawComets();
  requestAnimationFrame(step);
}
step();