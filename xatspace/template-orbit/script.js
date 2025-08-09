const center = document.querySelector('.center');
const rings = [140, 180, 220];
const nodes = [];
for (let i=0;i<9;i++){
  const n = document.createElement('div');
  n.className = 'node';
  const img = document.createElement('img');
  img.src = `https://i.pravatar.cc/32?img=${10+i}`;
  n.appendChild(img);
  center.appendChild(n);
  nodes.push({el:n, r:rings[i%rings.length]/2, a:Math.random()*Math.PI*2, s: (i%2?0.008:0.012) });
}
function layout(){
  const rect = center.getBoundingClientRect();
  const cx = rect.width/2, cy = rect.height/2;
  nodes.forEach(n => {
    n.a += n.s; const x = cx + Math.cos(n.a)*n.r; const y = cy + Math.sin(n.a)*n.r;
    n.el.style.position='absolute'; n.el.style.left = (x-16)+'px'; n.el.style.top = (y-16)+'px';
  });
  requestAnimationFrame(layout);
}
layout();