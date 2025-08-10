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

// Global variables
const canvas = document.getElementById('scene');
const particlesContainer = document.getElementById('particles');
let renderer, scene, camera;
let shards = [];
let particles = [];
let mouseX = 0, mouseY = 0;
let isAnimating = false;
let currentSection = null;

// Initialize Three.js
function initThree() {
  try {
    renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true
    });
  } catch(e) {
    console.error('Failed to init WebGLRenderer', e);
    return false;
  }

  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x04060f, 10, 50);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 25);

  // Lighting setup
  const ambientLight = new THREE.AmbientLight(0x8899ff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(10, 10, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const pointLight1 = new THREE.PointLight(0x6c5ce7, 1, 50);
  pointLight1.position.set(-10, 5, 10);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x00d4aa, 1, 50);
  pointLight2.position.set(10, -5, -10);
  scene.add(pointLight2);

  return true;
}

// Create shard geometry
function createShardGeometry() {
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const vertices = geometry.attributes.position.array;
  
  // Distort the geometry to make it more shard-like
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i] += (Math.random() - 0.5) * 0.3;
    vertices[i + 1] += (Math.random() - 0.5) * 0.3;
    vertices[i + 2] += (Math.random() - 0.5) * 0.3;
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

// Create holographic material
function createHolographicMaterial() {
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.8,
    roughness: 0.1,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });

  // Add holographic texture
  const textureLoader = new THREE.TextureLoader();
  const holographicTexture = textureLoader.load('data:image/svg+xml;base64,' + btoa(`
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="holographic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6c5ce7;stop-opacity:0.8"/>
          <stop offset="50%" style="stop-color:#00d4aa;stop-opacity:0.6"/>
          <stop offset="100%" style="stop-color:#8b7cf6;stop-opacity:0.8"/>
        </linearGradient>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" stroke="url(#holographic)" stroke-width="1" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    </svg>
  `));

  material.map = holographicTexture;
  material.needsUpdate = true;

  return material;
}

// Create individual shard
function createShard() {
  const geometry = createShardGeometry();
  const material = createHolographicMaterial();
  
  const shard = new THREE.Mesh(geometry, material);
  
  // Random position and rotation
  shard.position.set(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 30,
    (Math.random() - 0.5) * 40
  );
  
  shard.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );
  
  const scale = 0.5 + Math.random() * 1.5;
  shard.scale.set(scale, scale, scale);
  
  // Animation properties
  shard.userData = {
    originalPosition: shard.position.clone(),
    originalRotation: shard.rotation.clone(),
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    ),
    rotationSpeed: new THREE.Vector3(
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    ),
    pulsePhase: Math.random() * Math.PI * 2
  };
  
  return shard;
}

// Create particle system
function createParticles() {
  const particleCount = 200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

    colors[i * 3] = Math.random() * 0.5 + 0.5;
    colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
    colors[i * 3 + 2] = 1;

    sizes[i] = Math.random() * 2 + 1;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  particles.push(particleSystem);
}

// Initialize shards
function initShards() {
  const shardCount = 80;
  
  for (let i = 0; i < shardCount; i++) {
    const shard = createShard();
    scene.add(shard);
    shards.push(shard);
  }
}

// Mouse movement handler
function handleMouseMove(event) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Resize handler
function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height, false);
}

// Animation loop
function animate() {
  if (isAnimating) return;
  
  requestAnimationFrame(animate);
  
  const time = Date.now() * 0.001;
  
  // Camera movement based on mouse
  camera.position.x += (mouseX * 8 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);
  
  // Animate shards
  shards.forEach((shard, index) => {
    const userData = shard.userData;
    
    // Gentle floating motion
    shard.position.y += Math.sin(time + index * 0.1) * 0.002;
    
    // Rotation
    shard.rotation.x += userData.rotationSpeed.x;
    shard.rotation.y += userData.rotationSpeed.y;
    shard.rotation.z += userData.rotationSpeed.z;
    
    // Pulse effect
    const pulse = Math.sin(time * 2 + userData.pulsePhase) * 0.1 + 1;
    shard.scale.setScalar(pulse);
    
    // Holographic shimmer
    shard.material.opacity = 0.6 + Math.sin(time * 3 + index) * 0.2;
  });
  
  // Animate particles
  particles.forEach(particleSystem => {
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + i) * 0.01;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.rotation.y += 0.001;
  });
  
  renderer.render(scene, camera);
}

// Transition animations
function fallTransition() {
  isAnimating = true;
  
  // Create dramatic falling effect
  const tl = gsap.timeline({
    onComplete: () => {
      showSection('sectionA');
      isAnimating = false;
    }
  });
  
  // Shards fall past camera
  tl.to(shards.map(s => s.position), {
    z: '-= 100',
    duration: 2,
    ease: 'power2.in',
    stagger: 0.01
  }, 0);
  
  // Shards fade and blur
  tl.to(shards.map(s => s.material), {
    opacity: 0.2,
    duration: 2,
    ease: 'power2.in'
  }, 0);
  
  // Camera moves forward rapidly
  tl.to(camera.position, {
    z: 5,
    duration: 2,
    ease: 'power2.in'
  }, 0);
  
  // Add motion blur effect
  tl.to(camera, {
    fov: 90,
    duration: 1,
    ease: 'power2.in',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 0);
  
  // Return camera to normal
  tl.to(camera, {
    fov: 60,
    duration: 1,
    ease: 'power2.out',
    onUpdate: () => camera.updateProjectionMatrix()
  }, 1);
}

function portalTransition() {
  isAnimating = true;
  
  const tl = gsap.timeline({
    onComplete: () => {
      showSection('sectionB');
      isAnimating = false;
    }
  });
  
  // Shards explode outward
  tl.to(shards, {
    duration: 1.5,
    ease: 'power3.out',
    onUpdate: function() {
      shards.forEach(shard => {
        shard.position.multiplyScalar(1.02);
        shard.rotation.x += 0.1;
        shard.rotation.y += 0.08;
        shard.rotation.z += 0.06;
      });
    }
  });
  
  // Shards fade out
  tl.to(shards.map(s => s.material), {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.in'
  }, 0.7);
  
  // Camera spins
  tl.to(camera.rotation, {
    y: Math.PI * 2,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 0);
}

function warpTransition() {
  isAnimating = true;
  
  const tl = gsap.timeline({
    onComplete: () => {
      showSection('sectionC');
      isAnimating = false;
    }
  });
  
  // Shards converge to center
  tl.to(shards.map(s => s.position), {
    x: 0,
    y: 0,
    z: 0,
    duration: 1.5,
    ease: 'power3.inOut',
    stagger: 0.02
  });
  
  // Shards merge and distort
  tl.to(shards, {
    duration: 1.5,
    ease: 'power3.inOut',
    onUpdate: function() {
      shards.forEach((shard, index) => {
        shard.scale.setScalar(0.1 + Math.sin(Date.now() * 0.01 + index) * 0.05);
        shard.material.opacity = 0.3 + Math.sin(Date.now() * 0.005 + index) * 0.2;
      });
    }
  }, 0);
  
  // Camera zooms in
  tl.to(camera.position, {
    z: 2,
    duration: 1.5,
    ease: 'power3.inOut'
  }, 0);
  
  // Shards fade to white
  tl.to(shards.map(s => s.material), {
    color: 0xffffff,
    duration: 1.5,
    ease: 'power2.inOut'
  }, 0);
}

// Show/hide sections
function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Hide start UI
  document.getElementById('startUI').style.display = 'none';
  
  // Show target section
  if (sectionId) {
    const section = document.getElementById(sectionId);
    section.classList.add('active');
    currentSection = sectionId;
  }
}

function returnToStart() {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show start UI
  document.getElementById('startUI').style.display = 'block';
  currentSection = null;
  
  // Reset shards
  shards.forEach(shard => {
    shard.material.opacity = 0.7;
    shard.material.color.setHex(0xffffff);
    shard.position.copy(shard.userData.originalPosition);
    shard.rotation.copy(shard.userData.originalRotation);
    shard.scale.setScalar(1);
  });
  
  // Reset camera
  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 25,
    duration: 1,
    ease: 'power2.out'
  });
  
  gsap.to(camera.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration: 1,
    ease: 'power2.out'
  });
  
  // Resume animation
  isAnimating = false;
  animate();
}

// Initialize everything
function init() {
  if (!initThree()) {
    console.error('Failed to initialize Three.js');
    return;
  }
  
  initShards();
  createParticles();
  
  // Event listeners
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('resize', handleResize);
  
  // Button event listeners
  document.getElementById('btnFall').addEventListener('click', fallTransition);
  document.getElementById('btnPortal').addEventListener('click', portalTransition);
  document.getElementById('btnWarp').addEventListener('click', warpTransition);
  
  document.querySelectorAll('[data-return]').forEach(btn => {
    btn.addEventListener('click', returnToStart);
  });
  
  // Hide loading screen
  setTimeout(() => {
    document.getElementById('loading').classList.add('hidden');
  }, 1500);
  
  // Start animation loop
  animate();
}

// Start when everything is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}