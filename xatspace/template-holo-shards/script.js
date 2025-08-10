// WebGL guard + friendly overlay
(function(){
  const ok = (function(){ try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); } catch(e){ return false; } })();
  if (!ok) {
    const overlay = document.createElement('div');
    overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.display='grid'; overlay.style.placeItems='center'; overlay.style.background='linear-gradient(180deg,#0f1220,#111425)'; overlay.style.color='#eaf0ff'; overlay.style.fontFamily='Inter,system-ui,sans-serif'; overlay.style.zIndex='10';
    overlay.innerHTML = '<div style="text-align:center;max-width:540px;padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:#14182b;">WebGL not available. Please update your browser or enable hardware acceleration to view the Holo Shards experience.</div>';
    document.body.appendChild(overlay);
    return;
  }
})();

const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
} catch(e) {
  console.error('Failed to init WebGLRenderer', e);
}
if (!renderer) { throw new Error('Renderer init failed'); }

renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
camera.position.set(0, 0, 18);

const light = new THREE.DirectionalLight(0xffffff, 1.0); light.position.set(5,10,8); scene.add(light);
scene.add(new THREE.AmbientLight(0x8899ff, 0.5));

const shards = [];
const shardGeo = new THREE.IcosahedronGeometry(1, 0);
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
const texUrls = [
  'https://picsum.photos/seed/tex1/512/512',
  'https://picsum.photos/seed/tex2/512/512',
  'https://picsum.photos/seed/tex3/512/512',
  'https://picsum.photos/seed/tex4/512/512',
  'https://picsum.photos/seed/tex5/512/512'
];
const textures = texUrls.map(u => loader.load(u));

function createShard() {
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.6,
    roughness: 0.25,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
  });
  // assign a random texture to hint at mysterious images
  const tx = textures[Math.floor(Math.random()*textures.length)];
  if (tx) {
    tx.wrapS = tx.wrapT = THREE.MirroredRepeatWrapping;
    tx.repeat.set(0.6 + Math.random()*0.8, 0.6 + Math.random()*0.8);
    tx.offset.set(Math.random(), Math.random());
    mat.map = tx;
    mat.needsUpdate = true;
  }

  const m = new THREE.Mesh(shardGeo, mat);
  m.position.set((Math.random()-0.5)*20, (Math.random()-0.5)*12, (Math.random()-0.5)*18);
  m.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  const s = 0.6 + Math.random()*1.4; m.scale.set(s,s,s);
  m.userData.v = new THREE.Vector3((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02);
  return m;
}

for (let i=0;i<50;i++){
  const m = createShard();
  scene.add(m); shards.push(m);
}

function resize(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w/h; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize); resize();

let mx = 0, my = 0;
document.addEventListener('mousemove', (e)=>{
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1;
  mx = x; my = y;
});

let ticking = true;
function animate(){
  if (!ticking) return;
  requestAnimationFrame(animate);
  camera.position.x += ((mx*2) - camera.position.x) * 0.04;
  camera.position.y += ((-my*1.2) - camera.position.y) * 0.04;
  camera.lookAt(0,0,0);
  shards.forEach(s=>{
    s.rotation.x += 0.004; s.rotation.y += 0.003;
    s.position.add(s.userData.v);
    ['x','y','z'].forEach(k=>{ if (s.position[k] > 12) s.position[k] = -12; if (s.position[k] < -12) s.position[k] = 12; });
  });
  renderer.render(scene, camera);
}
animate();

// UI / Transitions
const startUI = document.getElementById('startUI');
const sectionA = document.getElementById('sectionA');
const sectionB = document.getElementById('sectionB');

function showSection(sec){ sectionA.classList.remove('active'); sectionB.classList.remove('active'); if (sec) sec.classList.add('active'); }

function fallTransition(){
  // accelerate shards towards camera to simulate dive
  gsap.to(shards.map(s=>s.position), { z: "+= -120", duration: 1.6, ease: "expo.in" });
  gsap.to(shards.map(s=>s.material), { opacity: 0.45, duration: 1.6, ease: "expo.in" });
  gsap.to(camera, { z: 5, duration: 1.6, ease: "expo.in", onComplete: ()=>{
    ticking = false; renderer.render(scene,camera); startUI.style.display='none'; showSection(sectionA);
  }});
}

function portalTransition(){
  // explode shards outward and fade, then reform
  gsap.to(shards, { duration: 1.0, ease: "power3.out", onUpdate: function(){
    shards.forEach(s=>{ s.position.multiplyScalar(1.05); s.rotation.x += 0.08; s.rotation.y += 0.06; });
  }, onComplete: ()=>{
    gsap.to(shards.map(s=>s.material), { opacity: 0, duration: 0.5, onComplete: ()=>{
      // pause and show section
      ticking = false; renderer.render(scene,camera); startUI.style.display='none'; showSection(sectionB);
    }});
  }});
}

function returnToStart(){
  showSection(null);
  // reset scene
  shards.forEach(s=>{
    s.material.opacity = 0.75;
    s.position.set((Math.random()-0.5)*20, (Math.random()-0.5)*12, (Math.random()-0.5)*18);
  });
  camera.position.set(0,0,18);
  startUI.style.display='block'; ticking = true; animate();
}

document.getElementById('btnFall').addEventListener('click', fallTransition);
document.getElementById('btnPortal').addEventListener('click', portalTransition);
Array.from(document.querySelectorAll('[data-return]')).forEach(b=> b.addEventListener('click', returnToStart));