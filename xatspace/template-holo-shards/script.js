const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio||1));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
camera.position.set(0, 0, 18);

const light = new THREE.DirectionalLight(0xffffff, 1.0); light.position.set(5,10,8); scene.add(light);
scene.add(new THREE.AmbientLight(0x8899ff, 0.5));

const shards = [];
const shardGeo = new THREE.IcosahedronGeometry(1, 0);
const shardMat = new THREE.MeshStandardMaterial({
  color: 0x99bbff,
  metalness: 0.7,
  roughness: 0.2,
  transparent: true,
  opacity: 0.65,
  envMapIntensity: 1.2,
});
for (let i=0;i<40;i++){
  const m = new THREE.Mesh(shardGeo, shardMat.clone());
  m.position.set((Math.random()-0.5)*20, (Math.random()-0.5)*12, (Math.random()-0.5)*18);
  m.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  const s = 0.6 + Math.random()*1.4; m.scale.set(s,s,s);
  m.userData.v = new THREE.Vector3((Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02);
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
  gsap.to(shards.map(s=>s.position), { z: "+= -80", duration: 1.6, ease: "expo.in" });
  gsap.to(camera, { z: 6, duration: 1.6, ease: "expo.in", onComplete: ()=>{
    ticking = false; renderer.render(scene,camera); startUI.style.display='none'; showSection(sectionA);
  }});
}

function portalTransition(){
  // explode shards outward and fade
  gsap.to(shards, { duration: 1.2, ease: "power3.out", onUpdate: function(){
    shards.forEach(s=>{ s.position.multiplyScalar(1.04); s.rotation.x += 0.06; s.rotation.y += 0.04; });
  }, onComplete: ()=>{
    gsap.to(shards.map(s=>s.material), { opacity: 0, duration: 0.5, onComplete: ()=>{
      ticking = false; renderer.render(scene,camera); startUI.style.display='none'; showSection(sectionB);
    }});
  }});
}

function returnToStart(){
  showSection(null);
  // reset scene
  shards.forEach(s=>{ s.material.opacity = 0.65; s.position.set((Math.random()-0.5)*20, (Math.random()-0.5)*12, (Math.random()-0.5)*18); });
  camera.position.set(0,0,18);
  startUI.style.display='block'; ticking = true; animate();
}

document.getElementById('btnFall').addEventListener('click', fallTransition);
document.getElementById('btnPortal').addEventListener('click', portalTransition);
Array.from(document.querySelectorAll('[data-return]')).forEach(b=> b.addEventListener('click', returnToStart));