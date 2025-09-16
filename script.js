document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    if (currentTheme === 'dark') {
        themeToggle.checked = true;
    }
    
    themeToggle.addEventListener('change', function() {
        let theme = 'light';
        if (this.checked) {
            theme = 'dark';
        }
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });
    
    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href') || '';
            
            // Allow normal navigation to external pages (e.g., uploader/index.html)
            if (!href.startsWith('#')) {
                // best-effort ensure top on next page
                try { window.scrollTo(0,0); } catch {}
                return; // Let the browser handle external navigation
            }
            
            e.preventDefault();
            const targetId = href;
            
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all pages
            pages.forEach(page => page.classList.remove('active'));
            
            // Show target page
            if (targetId && targetId.startsWith('#')) {
                const targetEl = document.querySelector(targetId);
                if (targetEl) targetEl.classList.add('active');
                
                // Update URL hash without scrolling
                history.replaceState(null, '', targetId);
                // Ensure we start at the top of the page after switching sections
                window.scrollTo(0, 0);
            }
        });
    });

    // Activate initial hash on load
    (function(){
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const tabMap = {
            'home': '#home',
            'chat-embedder': '#chat-embedder',
            'name-effects': '#name-effects',
            'xatspace-templates': '#xatspace-templates',
            'simpsons-avatars': '#simpsons-avatars'
        };
        const desiredHash = tabMap[tab] || (location.hash && document.querySelector(location.hash) ? location.hash : '#home');
        const targetLink = Array.from(navLinks).find(a => (a.getAttribute('href')||'') === desiredHash);
        if (targetLink) {
            targetLink.click();
        } else {
            // Fallback: show default
            pages.forEach(page => page.classList.remove('active'));
            const el = document.querySelector(desiredHash) || document.querySelector('#home');
            if (el) el.classList.add('active');
        }
        // Normalize URL: drop ?tab and set hash
        try {
            const url = new URL(location.href);
            if (url.searchParams.has('tab')) url.searchParams.delete('tab');
            url.hash = desiredHash;
            history.replaceState(null, '', url.toString());
        } catch {}
        // Ensure top
        window.scrollTo(0, 0);
    })();
    
    // Chat embedder functionality (revamped)
    const embedChatBtn = document.getElementById('embedChat');
    const chatNameInput = document.getElementById('chatName');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');

    const chatDesktop = document.getElementById('chatDesktop');

    // Global/desktop settings controls
    const saveSettingsBtn = document.getElementById('applyDesktopSettings');
    const chatWidthInput = document.getElementById('chatWidth');
    const chatHeightInput = document.getElementById('chatHeight');
    const sizeScaleInput = document.getElementById('sizeScale');
    const sizeOut = document.getElementById('sizeOut');
    const desktopBgColor = document.getElementById('desktopBgColor');
    const desktopBgImage = document.getElementById('desktopBgImage');
    const clearAllBtn = document.getElementById('clearAllChats');

    // Alignment tools
    const alignCascadeBtn = document.getElementById('alignCascade');
    const alignTileBtn = document.getElementById('alignTile');
    const alignLeftBtn = document.getElementById('alignLeft');
    const alignRightBtn = document.getElementById('alignRight');
    const alignTopBtn = document.getElementById('alignTop');
    const alignBottomBtn = document.getElementById('alignBottom');
    const alignCenterBtn = document.getElementById('alignCenter');
    const resizeAllBtn = document.getElementById('resizeAll');

    // State
    let zCounter = 10;

    const defaultDesktopSettings = {
        width: 730,
        height: 495,
        bgColor: getComputedStyle(document.documentElement).getPropertyValue('--bg')?.trim() || '#0e0f12',
        bgImage: '',
        applyBackground: false
    };

    function loadDesktopSettings() {
        const saved = JSON.parse(localStorage.getItem('desktopSettings')) || defaultDesktopSettings;
        chatWidthInput.value = saved.width;
        chatHeightInput.value = saved.height;
        if (sizeScaleInput && sizeOut) {
            sizeScaleInput.value = '1';
            sizeOut.textContent = `${saved.width}x${saved.height}`;
        }
        desktopBgColor.value = saved.bgColor || defaultDesktopSettings.bgColor;
        desktopBgImage.value = saved.bgImage || '';
        applyDesktopSettings(saved);
    }

    function saveDesktopSettings() {
        const themeBg = getComputedStyle(document.documentElement).getPropertyValue('--bg')?.trim();
        const color = desktopBgColor.value || themeBg || defaultDesktopSettings.bgColor;
        const image = desktopBgImage.value || '';
        const shouldApply = !!image || (color && color !== themeBg);
        const newSettings = {
            width: clamp(parseInt(chatWidthInput.value) || defaultDesktopSettings.width, 280, 1600),
            height: clamp(parseInt(chatHeightInput.value) || defaultDesktopSettings.height, 220, 1400),
            bgColor: color,
            bgImage: image,
            applyBackground: shouldApply
        };
        localStorage.setItem('desktopSettings', JSON.stringify(newSettings));
        applyDesktopSettings(newSettings);
        // Update size output to reflect saved base
        if (sizeOut) sizeOut.textContent = `${newSettings.width}x${newSettings.height}`;
    }

    function applyDesktopSettings(settings) {
        // Save and re-evaluate background for current tab
        updatePageBackgroundForActiveTab(settings);
    }

    function getDesktopSettings() {
        return JSON.parse(localStorage.getItem('desktopSettings')) || defaultDesktopSettings;
    }

    function isChatTabActive() {
        return document.getElementById('chat-embedder')?.classList.contains('active');
    }

    // Effects minimal overlays
    const effectsType = document.getElementById('effectsType');
    const effectsLayerId = 'effectsLayer';
    const effectsSelect = document.getElementById('effectsSelect');
    const effectsMenu = document.getElementById('effectsMenu');
    // Build custom effects menu from native select
    if (effectsType && effectsMenu && effectsSelect) {
        effectsMenu.innerHTML = '';
        Array.from(effectsType.options).forEach(opt => {
            const item = document.createElement('div');
            item.className = 'effects-option';
            item.textContent = opt.textContent || opt.value;
            item.dataset.value = opt.value;
            if (opt.selected) item.classList.add('active');
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                // set native select for persistence
                effectsType.value = opt.value;
                // update label
                const label = effectsSelect.querySelector('.label');
                if (label) label.textContent = item.textContent;
                // set active
                Array.from(effectsMenu.children).forEach(c => c.classList.remove('active'));
                item.classList.add('active');
                // render
                renderEffects(effectsType.value);
                effectsMenu.classList.remove('open');
            });
            effectsMenu.appendChild(item);
        });
        const lbl = effectsSelect.querySelector('.label');
        if (lbl) {
            const sel = effectsType.selectedOptions?.[0]?.textContent || effectsType.value || 'None';
            lbl.textContent = sel;
        }
        effectsSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            effectsMenu.classList.toggle('open');
        });
        document.addEventListener('click', () => { effectsMenu.classList.remove('open'); });
        // Close when clicking elsewhere inside the settings panel too
        if (settingsPanel) {
            settingsPanel.addEventListener('click', (e) => {
                if (!effectsSelect.contains(e.target) && !effectsMenu.contains(e.target)) {
                    effectsMenu.classList.remove('open');
                }
            });
        }
    }

    function ensureEffectsLayer() {
        let layer = document.getElementById(effectsLayerId);
        if (!layer) {
            layer = document.createElement('div');
            layer.id = effectsLayerId;
            layer.style.position = 'fixed';
            layer.style.pointerEvents = 'none';
            layer.style.inset = '0';
            layer.style.zIndex = '0'; // behind content; content raised via CSS
            document.body.appendChild(layer);
        }
        return layer;
    }

    function clearEffects() {
        const layer = document.getElementById(effectsLayerId);
        if (layer) layer.innerHTML = '';
    }

    function renderEffects(type) {
        clearEffects();
        if (!effectsType || type === 'none') return;
        const layer = ensureEffectsLayer();
        if (type === 'snow') {
            for (let i = 0; i < 40; i++) {
                const flake = document.createElement('div');
                flake.style.position = 'absolute';
                flake.style.top = `${Math.random() * -50}px`;
                flake.style.left = `${Math.random() * 100}%`;
                flake.style.width = flake.style.height = `${Math.random() * 3 + 1}px`;
                flake.style.borderRadius = '50%';
                flake.style.background = 'rgba(255,255,255,0.7)';
                flake.style.animation = `fall ${6 + Math.random() * 6}s linear ${Math.random() * 6}s infinite`;
                layer.appendChild(flake);
            }
        } else if (type === 'sparkles') {
            for (let i = 0; i < 30; i++) {
                const s = document.createElement('div');
                s.style.position = 'absolute';
                s.style.top = `${Math.random() * 100}%`;
                s.style.left = `${Math.random() * 100}%`;
                s.style.width = s.style.height = '2px';
                s.style.background = 'rgba(255,255,255,0.6)';
                s.style.boxShadow = '0 0 6px rgba(255,255,255,0.8)';
                s.style.animation = `twinkle ${1 + Math.random()}s ease-in-out ${Math.random() * 1.5}s infinite alternate`;
                layer.appendChild(s);
            }
        } else if (type === 'bokeh') {
            for (let i = 0; i < 18; i++) {
                const b = document.createElement('div');
                b.style.position = 'absolute';
                b.style.top = `${Math.random() * 100}%`;
                b.style.left = `${Math.random() * 100}%`;
                const size = 8 + Math.random() * 20;
                b.style.width = b.style.height = `${size}px`;
                b.style.borderRadius = '50%';
                b.style.background = 'rgba(255,255,255,0.08)';
                b.style.filter = 'blur(2px)';
                layer.appendChild(b);
            }
        } else if (type === 'stars') {
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.style.position = 'absolute';
                star.style.top = `${Math.random() * 100}%`;
                star.style.left = `${Math.random() * 100}%`;
                star.style.width = star.style.height = '1px';
                star.style.background = 'rgba(255,255,255,0.9)';
                layer.appendChild(star);
            }
        } else if (type === 'confetti') {
            for (let i = 0; i < 25; i++) {
                const c = document.createElement('div');
                c.style.position = 'absolute';
                c.style.top = `${Math.random() * -60}px`;
                c.style.left = `${Math.random() * 100}%`;
                c.style.width = '4px';
                c.style.height = '8px';
                c.style.background = `hsl(${Math.random()*360},80%,60%)`;
                c.style.transform = `rotate(${Math.random()*360}deg)`;
                c.style.animation = `fall ${5 + Math.random()*4}s linear ${Math.random()*2}s infinite`;
                layer.appendChild(c);
            }
        } else if (type === 'meteor') {
            for (let i = 0; i < 6; i++) {
                const m = document.createElement('div');
                m.style.position = 'absolute';
                m.style.top = `${Math.random() * 30}%`;
                m.style.left = `${Math.random() * 100}%`;
                m.style.width = '2px'; m.style.height = '80px';
                m.style.background = 'linear-gradient(transparent, rgba(255,255,255,0.8))';
                m.style.transform = `rotate(45deg)`;
                m.style.animation = `fall ${2 + Math.random()*2}s linear ${Math.random()}s infinite`;
                layer.appendChild(m);
            }
        } else if (type === 'rainbow-rays') {
            for (let i = 0; i < 12; i++) {
                const r = document.createElement('div');
                r.style.position = 'absolute';
                r.style.top = '0'; r.style.left = '50%';
                r.style.width = '2px'; r.style.height = '100%';
                r.style.background = `linear-gradient(${i*30}deg, transparent, hsla(${i*30},80%,60%,0.4))`;
                r.style.transform = `rotate(${i*30}deg)`;
                layer.appendChild(r);
            }
        } else if (type === 'nebula') {
            for (let i = 0; i < 8; i++) {
                const n = document.createElement('div');
                n.style.position = 'absolute';
                n.style.top = `${Math.random()*100}%`; n.style.left = `${Math.random()*100}%`;
                const s = 80 + Math.random()*120; n.style.width = n.style.height = `${s}px`;
                n.style.borderRadius = '50%'; n.style.filter = 'blur(20px)';
                n.style.background = `radial-gradient(circle, hsla(${Math.random()*360},70%,60%,0.18), transparent 60%)`;
                layer.appendChild(n);
            }
        } else if (type === 'aurora') {
            const a = document.createElement('div');
            a.style.position = 'absolute'; a.style.inset = '0';
            a.style.background = 'linear-gradient(120deg, rgba(0,255,150,0.15), transparent, rgba(150,80,255,0.15))';
            a.style.filter = 'blur(8px)';
            layer.appendChild(a);
        } else if (type === 'rain') {
            for (let i = 0; i < 80; i++) {
                const drop = document.createElement('div');
                drop.style.position = 'absolute';
                drop.style.top = `${Math.random() * -80}px`;
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.width = '1px'; drop.style.height = '12px';
                drop.style.background = 'rgba(255,255,255,0.35)';
                drop.style.animation = `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`;
                layer.appendChild(drop);
            }
        } else if (type === 'grid-glow') {
            for (let i=0; i<20; i++) {
                const line = document.createElement('div');
                line.style.position = 'absolute';
                line.style.top = `${i*5}%`; line.style.left='0';
                line.style.width='100%'; line.style.height='1px';
                line.style.background='rgba(255,255,255,0.05)';
                layer.appendChild(line);
            }
        } else if (type === 'constellations') {
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth; canvas.height = window.innerHeight;
            canvas.style.width = '100%'; canvas.style.height = '100%';
            layer.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            const stars = Array.from({length: 120}, () => ({
                x: Math.random()*canvas.width,
                y: Math.random()*canvas.height,
                r: Math.random()*1.5+0.5
            }));
            let mouse = {x:-9999,y:-9999};
            canvas.addEventListener('mousemove', (e)=>{
                const rect = canvas.getBoundingClientRect();
                mouse = { x: e.clientX-rect.left, y: e.clientY-rect.top };
            });
            function draw(){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                stars.forEach(s=>{ ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); });
                // connect near mouse
                ctx.strokeStyle = 'rgba(255,255,255,0.25)';
                for(let i=0;i<stars.length;i++){
                    const a = stars[i];
                    const dx = a.x - mouse.x; const dy = a.y - mouse.y;
                    if (dx*dx+dy*dy < 150*150){
                        for(let j=i+1;j<stars.length;j++){
                            const b = stars[j];
                            const d2 = (a.x-b.x)**2 + (a.y-b.y)**2;
                            if (d2 < 120*120){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
                        }
                    }
                }
                requestAnimationFrame(draw);
            }
            draw();
        } else if (type === 'emoji-cloud') {
            const cloud = document.createElement('div');
            cloud.style.position='absolute'; cloud.style.inset='0'; cloud.style.perspective='800px';
            const emojis = ['✨','🚀','🌌','🪐','⭐','🌟','💫','🌈'];
            for(let i=0;i<36;i++){
                const e = document.createElement('div');
                e.textContent = emojis[i%emojis.length];
                e.style.position='absolute';
                const angle = (i/36)*360;
                const radius = 160;
                e.style.transform = `translate3d(${Math.cos(angle*Math.PI/180)*radius}px, ${Math.sin(angle*Math.PI/180)*radius}px, ${-100+Math.random()*200}px)`;
                e.style.left='50%'; e.style.top='50%'; e.style.fontSize='22px';
                cloud.appendChild(e);
            }
            cloud.style.animation = 'spinCloud 30s linear infinite';
            layer.appendChild(cloud);
        } else if (type === 'zoom-tunnel') {
            for(let i=0;i<12;i++){
                const ring = document.createElement('div');
                ring.style.position='absolute'; ring.style.left='50%'; ring.style.top='50%';
                ring.style.width = ring.style.height = `${80 + i*80}px`;
                ring.style.border = '1px solid rgba(255,255,255,0.15)'; ring.style.borderRadius='50%';
                ring.style.transform='translate(-50%,-50%)';
                ring.style.animation = `zoomIn ${6+i*0.2}s linear ${i*0.4}s infinite`;
                layer.appendChild(ring);
            }
        } else if (type === 'code-rain') {
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth; canvas.height = window.innerHeight;
            canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            const cols = Math.floor(canvas.width/14);
            const ypos = Array(cols).fill(0);
            const color = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6c5ce7';
            function draw(){
                ctx.fillStyle='rgba(0,0,0,0.05)'; ctx.fillRect(0,0,canvas.width,canvas.height);
                ctx.fillStyle=color; ctx.font='14px monospace';
                ypos.forEach((y, ind)=>{ const text = String.fromCharCode(0x30A0 + Math.random()*96);
                    const x = ind*14; ctx.fillText(text, x, y);
                    if (y > canvas.height && Math.random()>0.975) ypos[ind]=0; else ypos[ind]=y+14; });
                requestAnimationFrame(draw);
            }
            draw();
        } else if (type === 'glass-orbs') {
            for(let i=0;i<10;i++){
                const orb = document.createElement('div');
                const s = 40 + Math.random()*80; orb.style.width=orb.style.height=`${s}px`;
                orb.style.position='absolute'; orb.style.left=`${Math.random()*100}%`; orb.style.top=`${Math.random()*100}%`;
                orb.style.borderRadius='50%'; orb.style.backdropFilter='blur(8px)';
                orb.style.background='radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0.05))';
                orb.style.boxShadow='0 10px 30px rgba(0,0,0,0.15)';
                layer.appendChild(orb);
            }
        } else if (type === 'galaxy') {
            const canvas = document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight;
            canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            const particles = Array.from({length: 600}, (_,i)=>({
                angle: Math.random()*Math.PI*2,
                radius: 40 + Math.random()* (Math.min(canvas.width,canvas.height)/2 - 40),
                speed: 0.0005 + Math.random()*0.0015,
            }));
            function draw(){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.save(); ctx.translate(canvas.width/2, canvas.height/2);
                ctx.fillStyle='rgba(255,255,255,0.7)';
                particles.forEach(p=>{ p.angle += p.speed; const x=Math.cos(p.angle)*p.radius; const y=Math.sin(p.angle)*p.radius; ctx.fillRect(x,y,1,1); });
                ctx.restore(); requestAnimationFrame(draw);
            }
            draw();
        } else if (type === 'holo-net') {
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth; canvas.height = window.innerHeight;
            canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            let t = 0;
            function draw(){
                t += 0.01; ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.strokeStyle = 'rgba(108,92,231,0.35)'; ctx.lineWidth = 1;
                const cols = 18, rows = 12;
                for(let r=0;r<=rows;r++){
                    ctx.beginPath();
                    for(let c=0;c<=cols;c++){
                        const x = (c/cols)*canvas.width;
                        const y = (r/rows)*canvas.height + Math.sin((c/cols)*Math.PI*2 + t + r*0.3)*12;
                        if(c===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
                    }
                    ctx.stroke();
                }
                requestAnimationFrame(draw);
            }
            draw();
        } else if (type === 'blackhole') {
            const hole = document.createElement('div');
            hole.style.position='absolute'; hole.style.left='50%'; hole.style.top='50%';
            hole.style.transform='translate(-50%,-50%)';
            hole.style.width='60vmin'; hole.style.height='60vmin'; hole.style.borderRadius='50%';
            hole.style.background='radial-gradient(circle at 50% 50%, rgba(0,0,0,0.0), rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,1) 70%)';
            hole.style.filter='blur(4px)';
            const lens = document.createElement('div');
            lens.style.position='absolute'; lens.style.inset='-20%'; lens.style.borderRadius='50%';
            lens.style.backdropFilter='blur(4px) saturate(1.05)';
            lens.style.maskImage='radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 75%)';
            hole.appendChild(lens); layer.appendChild(hole);
        } else if (type === 'water-refraction') {
            const glass = document.createElement('div');
            glass.style.position='absolute'; glass.style.inset='0'; glass.style.backdropFilter='blur(3px)';
            glass.style.background='radial-gradient(circle, rgba(255,255,255,0.04), rgba(255,255,255,0))';
            glass.style.opacity='0.8';
            glass.style.maskImage='repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,1) 0 2px, rgba(0,0,0,0) 4px)';
            layer.appendChild(glass);
        } else if (type === 'aurora-lines') {
            const canvas = document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight;
            canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            let t=0; function draw(){ t+=0.01; ctx.clearRect(0,0,canvas.width,canvas.height);
                for(let i=0;i<10;i++){
                    const x = (i/10)*canvas.width;
                    const h = (Math.sin(t+i)*0.5+0.5)*canvas.height*0.6 + canvas.height*0.2;
                    const grad = ctx.createLinearGradient(x,0,x,canvas.height);
                    grad.addColorStop(0,'rgba(150,80,255,0)'); grad.addColorStop(0.5,'rgba(150,80,255,0.15)'); grad.addColorStop(1,'rgba(0,0,0,0)');
                    ctx.fillStyle=grad; ctx.fillRect(x-2,canvas.height-h,4,h);
                }
                requestAnimationFrame(draw);
            } draw();
        } else if (type === 'dim-starfield') {
            for(let i=0;i<120;i++){
                const s=document.createElement('div'); s.style.position='absolute';
                s.style.left=`${Math.random()*100}%`; s.style.top=`${Math.random()*100}%`;
                s.style.width=s.style.height='1px'; s.style.background='rgba(255,255,255,0.5)';
                s.style.opacity=String(0.2+Math.random()*0.5);
                s.style.animation=`twinkle ${1.5+Math.random()*2}s ease-in-out ${Math.random()}s infinite alternate`;
                layer.appendChild(s);
            }
        } else if (type === 'quote-dust') {
            const words=['Dream','Create','Inspire','Shine','Believe','Explore','Imagine','Build','Focus','Evolve'];
            for(let i=0;i<40;i++){
                const p=document.createElement('div'); p.textContent = Math.random()>0.9 ? words[Math.floor(Math.random()*words.length)] : '•';
                p.style.position='absolute'; p.style.left=`${Math.random()*100}%`; p.style.top=`${Math.random()*100}%`;
                p.style.fontSize='10px'; p.style.color='rgba(255,255,255,0.35)'; p.style.letterSpacing='1px';
                p.style.animation=`floatUp ${6+Math.random()*6}s ease-in-out ${Math.random()*3}s infinite alternate`;
                layer.appendChild(p);
            }
        } else if (type === 'grad-mesh') {
            const mesh=document.createElement('div'); mesh.style.position='absolute'; mesh.style.inset='0';
            mesh.style.background='radial-gradient(circle at 20% 30%, rgba(108,92,231,0.25), transparent 40%), radial-gradient(circle at 80% 70%, rgba(46,213,115,0.25), transparent 40%), radial-gradient(circle at 50% 50%, rgba(255,159,67,0.18), transparent 40%)';
            mesh.style.filter='blur(20px)'; layer.appendChild(mesh);
        } else if (type === 'glow-matrix') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight;
            canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d');
            const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const cols=Math.floor(canvas.width/16); const drops=Array(cols).fill(0);
            function draw(){
                ctx.fillStyle='rgba(0,0,0,0.08)'; ctx.fillRect(0,0,canvas.width,canvas.height);
                for(let i=0;i<drops.length;i++){
                    const x=i*16; const y=drops[i]*16;
                    const ch=letters[Math.floor(Math.random()*letters.length)];
                    const hue = 260 + Math.sin((i + drops[i])*0.05)*40; // purple/cyan range
                    ctx.fillStyle=`hsla(${hue}, 90%, 60%, 0.85)`; ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=8;
                    ctx.fillText(ch,x,y);
                    if (y>canvas.height && Math.random()>0.98) drops[i]=0; else drops[i]++;
                }
                requestAnimationFrame(draw);
            }
            ctx.font='16px monospace'; draw();
        } else if (type === 'neon-grid') {
            const grid=document.createElement('div'); grid.style.position='absolute'; grid.style.inset='0'; grid.style.background='linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)'; grid.style.backgroundSize='40px 40px';
            grid.style.boxShadow='inset 0 0 80px rgba(108,92,231,0.15)'; layer.appendChild(grid);
        } else if (type === 'sine-rings') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d'); let t=0; function draw(){ t+=0.01; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.strokeStyle='rgba(255,255,255,0.25)'; for(let r=0;r<12;r++){ ctx.beginPath(); const rad=40+r*40 + Math.sin(t+r)*8; ctx.arc(canvas.width/2, canvas.height/2, rad, 0, Math.PI*2); ctx.stroke(); } requestAnimationFrame(draw);} draw();
        } else if (type === 'particle-swirl') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d'); const pts=Array.from({length:800},()=>({a:Math.random()*Math.PI*2,r:20+Math.random()*260,s:0.002+Math.random()*0.006})); function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.save(); ctx.translate(canvas.width/2, canvas.height/2); ctx.fillStyle='rgba(255,255,255,0.6)'; pts.forEach(p=>{ p.a+=p.s; const x=Math.cos(p.a)*p.r; const y=Math.sin(p.a)*p.r; ctx.fillRect(x,y,1,1); }); ctx.restore(); requestAnimationFrame(draw);} draw();
        } else if (type === 'soft-bokeh') {
            for(let i=0;i<24;i++){ const b=document.createElement('div'); const s=20+Math.random()*60; b.style.position='absolute'; b.style.left=`${Math.random()*100}%`; b.style.top=`${Math.random()*100}%`; b.style.width=b.style.height=`${s}px`; b.style.borderRadius='50%'; b.style.background='rgba(255,255,255,0.06)'; b.style.filter='blur(3px)'; layer.appendChild(b);}        
        } else if (type === 'geo-tiles') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d'); let t=0; function draw(){ t+=0.01; ctx.clearRect(0,0,canvas.width,canvas.height); const size=50; for(let y=0;y<canvas.height;y+=size){ for(let x=0;x<canvas.width;x+=size){ const off=Math.sin((x+y)*0.01+t)*10; ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.strokeRect(x+off*0.2,y+off*0.2,size-off*0.4,size-off*0.4); } } requestAnimationFrame(draw);} draw();
        } else if (type === 'ink-clouds') {
            const fog=document.createElement('div'); fog.style.position='absolute'; fog.style.inset='0'; fog.style.background='radial-gradient(circle at 30% 30%, rgba(0,0,0,0.15), transparent 50%), radial-gradient(circle at 70% 60%, rgba(0,0,0,0.15), transparent 50%)'; fog.style.filter='blur(10px)'; layer.appendChild(fog);
        } else if (type === 'sunbeams') {
            for(let i=0;i<10;i++){ const beam=document.createElement('div'); beam.style.position='absolute'; beam.style.left='50%'; beam.style.top='0'; beam.style.width='2px'; beam.style.height='100%'; beam.style.transform=`rotate(${(i-5)*5}deg)`; beam.style.background='linear-gradient(transparent, rgba(255,255,255,0.18), transparent)'; layer.appendChild(beam);}        
        } else if (type === 'dust-waves') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d'); let t=0; function draw(){ t+=0.01; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle='rgba(255,255,255,0.2)'; for(let i=0;i<80;i++){ const x=Math.random()*canvas.width; const y=(Math.sin(t + i)*0.5+0.5)*canvas.height; ctx.globalAlpha=0.06; ctx.fillRect(x,y,1,1);} requestAnimationFrame(draw);} draw();
        } else if (type === 'pulse-grid') {
            const grid=document.createElement('div'); grid.style.position='absolute'; grid.style.inset='0'; grid.style.background='linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'; grid.style.backgroundSize='60px 60px'; grid.style.animation='pulseGrid 4s ease-in-out infinite'; layer.appendChild(grid);
        } else if (type === 'soft-orbs') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d');
            const orbs=Array.from({length:18},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:40+Math.random()*120,vx:(Math.random()-0.5)*0.2,vy:(Math.random()-0.5)*0.2,alpha:0.08+Math.random()*0.08}));
            function draw(){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.globalCompositeOperation='lighter';
                orbs.forEach(o=>{
                    o.x+=o.vx; o.y+=o.vy;
                    if (o.x< -o.r) o.x=canvas.width+o.r; if (o.x> canvas.width+o.r) o.x=-o.r;
                    if (o.y< -o.r) o.y=canvas.height+o.r; if (o.y> canvas.height+o.r) o.y=-o.r;
                    const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,o.r);
                    g.addColorStop(0,`rgba(108,92,231,${o.alpha})`);
                    g.addColorStop(1,'rgba(108,92,231,0)');
                    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill();
                });
                ctx.globalCompositeOperation='source-over';
                requestAnimationFrame(draw);
            } draw();
        } else if (type === 'slow-ripples') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d'); let t=0;
            function draw(){ t+=0.01; ctx.clearRect(0,0,canvas.width,canvas.height);
                for(let i=0;i<8;i++){
                    const y= (i+1)/(8+1)*canvas.height;
                    ctx.beginPath();
                    for(let x=0;x<=canvas.width;x+=6){ const yy=y+Math.sin((x*0.008)+t+i*0.4)*10; if(x===0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy); }
                    const hue=260 + i*6 + Math.sin(t*0.3+i)*10; ctx.strokeStyle=`hsla(${hue},60%,60%,0.25)`; ctx.lineWidth=2; ctx.stroke();
                }
                requestAnimationFrame(draw);
            } draw();
        } else if (type === 'grass') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d'); let t=0; const blades=600; const h=canvas.height;
            const baseY=h*0.98;
            function draw(){ t+=0.02; ctx.clearRect(0,0,canvas.width,canvas.height);
                ctx.strokeStyle='rgba(90,200,120,0.35)'; ctx.lineWidth=1;
                for(let i=0;i<blades;i++){
                    const x=(i/blades)*canvas.width; const len = 40+Math.sin(i*0.2+t)*10; const sway=Math.sin(t+i*0.05)*10;
                    ctx.beginPath(); ctx.moveTo(x,baseY); ctx.quadraticCurveTo(x+sway*0.4,baseY-len*0.5, x+sway, baseY-len); ctx.stroke();
                }
                requestAnimationFrame(draw);
            } draw();
        } else if (type === 'feathers') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d');
            const parts = Array.from({length:80},()=>({
                x: Math.random()*canvas.width,
                y: Math.random()*-canvas.height*0.5,
                vx: (Math.random()*0.4-0.2) + 0.2, // slight right drift
                vy: 0.25 + Math.random()*0.35,
                r: 6 + Math.random()*10,
                a: Math.random()*Math.PI*2,
                av: (Math.random()*0.02 - 0.01),
                alpha: 0.18 + Math.random()*0.2
            }));
            function draw(){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                parts.forEach(p=>{
                    p.x += p.vx; p.y += p.vy; p.a += p.av;
                    // wrap
                    if (p.y > canvas.height + 30) { p.y = -20; p.x = Math.random()*canvas.width; }
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.a);
                    ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
                    ctx.beginPath();
                    // feather-like ellipse
                    ctx.ellipse(0,0,p.r*0.6,p.r,0,0,Math.PI*2);
                    ctx.fill();
                    ctx.restore();
                });
                requestAnimationFrame(draw);
            } draw();
        } else if (type === 'smoke-trails') {
            const canvas=document.createElement('canvas'); canvas.width=window.innerWidth; canvas.height=window.innerHeight; canvas.style.width='100%'; canvas.style.height='100%'; layer.appendChild(canvas);
            const ctx=canvas.getContext('2d');
            const particles = [];
            function spawn(){
                for(let i=0;i<4;i++){
                    particles.push({
                        x: canvas.width*0.5 + (Math.random()*160-80),
                        y: canvas.height + 10,
                        vx: 0.2 + Math.random()*0.8, // diagonal drift to right
                        vy: -0.8 - Math.random()*0.8, // rising
                        life: 0,
                        max: 220 + Math.random()*220,
                        r: 6 + Math.random()*10
                    });
                }
            }
            function colorFor(t){ // t in [0,1]
                if (t<0.2) return `rgba(255,120,60,${0.35*(1-t/0.2)+0.15})`; // warm near source
                if (t<0.6) return `rgba(200,200,200,${0.22})`;
                return `rgba(140,140,140,${0.12*(1-(t-0.6)/0.4)})`;
            }
            function draw(){
                ctx.clearRect(0,0,canvas.width,canvas.height);
                spawn();
                for(let i=particles.length-1;i>=0;i--){
                    const p=particles[i]; p.life++;
                    p.x += p.vx + Math.sin(p.life*0.05)*0.2; // mild curl
                    p.y += p.vy;
                    const t = p.life/p.max;
                    const rr = p.r + t*14; // bigger as it ages
                    ctx.fillStyle = colorFor(t);
                    ctx.beginPath(); ctx.arc(p.x,p.y,rr,0,Math.PI*2); ctx.fill();
                    if (t>=1) particles.splice(i,1);
                }
                requestAnimationFrame(draw);
            } draw();
        }
    }

    if (effectsType) effectsType.addEventListener('change', () => renderEffects(effectsType.value));

    // High-contrast overlay for extreme wallpapers
    function applyContrastMask(enabled) {
        const id = 'contrastMask';
        let mask = document.getElementById(id);
        // Never show mask on Chat Embedder page
        if (!enabled || isChatTabActive()) {
            if (mask) mask.remove();
            return;
        }
        if (!mask) {
            mask = document.createElement('div');
            mask.id = id;
            mask.style.position = 'fixed';
            mask.style.inset = '0';
            mask.style.pointerEvents = 'none';
            mask.style.zIndex = '1'; // below main content
            document.body.appendChild(mask);
        }
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        mask.style.background = theme === 'dark'
            ? 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25))'
            : 'linear-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.25))';
    }

    function updatePageBackgroundForActiveTab(inlineSettings) {
        const settings = inlineSettings || getDesktopSettings();
        if (settings.applyBackground && isChatTabActive()) {
            document.body.style.backgroundColor = settings.bgColor || '';
            document.body.style.backgroundImage = settings.bgImage ? `url('${settings.bgImage}')` : 'none';
            document.body.style.backgroundSize = settings.bgImage ? 'cover' : '';
            document.body.style.backgroundPosition = settings.bgImage ? 'center center' : '';
            document.body.style.backgroundRepeat = settings.bgImage ? 'no-repeat' : '';
            document.body.style.backgroundAttachment = settings.bgImage ? 'fixed' : '';
            applyContrastMask(true);
            renderEffects(effectsType?.value || 'none');
        } else {
            // Clear to theme defaults
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundRepeat = '';
            document.body.style.backgroundAttachment = '';
            applyContrastMask(false);
            clearEffects();
        }
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    const settingsOverlay = document.getElementById('settingsOverlay');
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('active');
        settingsOverlay.classList.toggle('active', settingsPanel.classList.contains('active'));
        // Scroll into view if needed when opened
        if (settingsPanel.classList.contains('active')) settingsPanel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
            settingsPanel.classList.remove('active');
            settingsOverlay.classList.remove('active');
        }
    });
    settingsPanel.addEventListener('click', (e) => { e.stopPropagation(); });
    if (settingsOverlay) settingsOverlay.addEventListener('click', () => {
        settingsPanel.classList.remove('active');
        settingsOverlay.classList.remove('active');
    });
    saveSettingsBtn.addEventListener('click', () => {
        saveDesktopSettings();
        const originalText = saveSettingsBtn.innerHTML;
        saveSettingsBtn.innerHTML = '<i class="fas fa-check"></i> Applied';
        setTimeout(() => { saveSettingsBtn.innerHTML = originalText; }, 1200);
    });

    // Reset background to theme defaults
    const resetBackgroundBtn = document.getElementById('resetBackground');
    if (resetBackgroundBtn) {
        resetBackgroundBtn.addEventListener('click', () => {
            const themeBg = getComputedStyle(document.documentElement).getPropertyValue('--bg')?.trim();
            desktopBgColor.value = themeBg || '#0e0f12';
            desktopBgImage.value = '';
            const s = {
                ...(JSON.parse(localStorage.getItem('desktopSettings')) || defaultDesktopSettings),
                bgColor: themeBg || defaultDesktopSettings.bgColor,
                bgImage: '',
                applyBackground: false
            };
            localStorage.setItem('desktopSettings', JSON.stringify(s));
            applyDesktopSettings(s);
        });
    }

    clearAllBtn.addEventListener('click', () => {
        localStorage.removeItem('chatWindows');
        Array.from(chatDesktop.querySelectorAll('.chat-window')).forEach(el => el.remove());
    });

    // Persistence for windows
    function getWindowsState() {
        return JSON.parse(localStorage.getItem('chatWindows')) || [];
    }

    function setWindowsState(windows) {
        localStorage.setItem('chatWindows', JSON.stringify(windows));
    }

    function upsertWindowState(state) {
        const windows = getWindowsState();
        const idx = windows.findIndex(w => w.id === state.id);
        if (idx >= 0) windows[idx] = state; else windows.push(state);
        setWindowsState(windows);
    }

    function deleteWindowState(id) {
        const windows = getWindowsState().filter(w => w.id !== id);
        setWindowsState(windows);
    }

    // Create chat window
    embedChatBtn.addEventListener('click', addChatFromInput);
    chatNameInput.addEventListener('keypress', e => { if (e.key === 'Enter') addChatFromInput(); });

    function addChatFromInput() {
        const name = (chatNameInput.value || '').trim();
        if (!name) { chatNameInput.focus(); return; }
        const desktop = JSON.parse(localStorage.getItem('desktopSettings')) || defaultDesktopSettings;
        const id = Date.now();
        const existing = getWindowsState();
        const initialState = {
            id,
            name,
            x: 20 + (existing.length * 28) % Math.max(40, chatDesktop.clientWidth - desktop.width - 40),
            y: 20 + (existing.length * 28) % Math.max(40, chatDesktop.clientHeight - desktop.height - 40),
            width: desktop.width,
            height: desktop.height,
            z: ++zCounter,
            collapsed: false
        };
        createChatWindow(initialState);
        upsertWindowState(initialState);
        chatNameInput.value = '';
        rebuildChatStyleChips();
    }

    function createChatWindow(state) {
        if (chatDesktop.querySelector(`.chat-window[data-id="${state.id}"]`)) {
            return; // already exists
        }
        const el = document.createElement('div');
        el.className = 'chat-window';
        el.dataset.id = String(state.id);
        el.style.left = `${state.x}px`;
        el.style.top = `${state.y}px`;
        el.style.width = `${state.width}px`;
        el.style.height = `${state.height}px`;
        el.style.zIndex = state.z || 10;

        el.innerHTML = `
            <div class="window-titlebar" data-drag-handle>
                <div class="title"><i class="fas fa-comment-dots" style="margin-right:6px;color:var(--primary)"></i>${escapeHtml(state.name)}</div>
                <div class="title-size">
                    <input type="range" class="size-scale" min="0.5" max="2" value="1" step="0.05" aria-label="Chat size scale">
                </div>
                <div class="window-controls">
                    <button class="ctrl-btn" data-action="info" title="">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button class="ctrl-btn" data-action="toggle" title="Show/Hide content"><i class="fas fa-minus"></i></button>
                    <button class="ctrl-btn" data-action="close" title="Close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="chat-content">
                <iframe src="https://xat.com/embed/chat.php#gn=${encodeURIComponent(state.name)}" frameborder="0" scrolling="no"></iframe>
            </div>
            <div class="resize-handle ne" data-resize="ne"></div>
            <div class="resize-handle nw" data-resize="nw"></div>
            <div class="resize-handle se" data-resize="se"></div>
            <div class="resize-handle sw" data-resize="sw"></div>
            <div class="resize-handle n" data-resize="n"></div>
            <div class="resize-handle s" data-resize="s"></div>
            <div class="resize-handle e" data-resize="e"></div>
            <div class="resize-handle w" data-resize="w"></div>
        `;

        chatDesktop.appendChild(el);

        // Layering
        el.addEventListener('pointerdown', () => bringToFront(el));

        // Titlebar drag
        const titlebar = el.querySelector('.window-titlebar');
        enableDrag(el, titlebar);

        // Resize handles
        Array.from(el.querySelectorAll('[data-resize]')).forEach(handle => enableResize(el, handle));

        // Controls
        const controls = el.querySelector('.window-controls');
        controls.addEventListener('pointerdown', (e) => { e.stopPropagation(); });
        controls.addEventListener('click', (e) => {
            e.stopPropagation();
            const btn = e.target.closest('button');
            if (!btn) return;
            const action = btn.dataset.action;
            if (action === 'close') {
                el.parentElement && el.parentElement.removeChild(el);
                deleteWindowState(state.id);
            } else if (action === 'toggle') {
                el.classList.toggle('hidden-content');
                state.collapsed = el.classList.contains('hidden-content');
                persistFromElement(el, state.id);
            }
        });

        // Keep info tooltip updated
        const infoBtn = el.querySelector('.window-controls [data-action="info"]');
        function updateChatInfoTooltip() {
            if (!infoBtn) return;
            infoBtn.title = `${el.offsetWidth}x${el.offsetHeight}`;
        }
        updateChatInfoTooltip();

        // Per-chat size slider scaling with aspect ratio
        const sizeScale = el.querySelector('.size-scale');
        if (sizeScale) {
            const base = getDesktopSettings();
            sizeScale.addEventListener('input', () => {
                const s = parseFloat(sizeScale.value || '1');
                const newW = Math.round(base.width * s);
                const newH = Math.round(base.height * s);
                el.style.width = `${newW}px`;
                el.style.height = `${newH}px`;
                persistFromElement(el, state.id);
                updateChatInfoTooltip();
            });
        }

        if (state.collapsed) el.classList.add('hidden-content');
    }

    function bringToFront(el) {
        const currentTop = ++zCounter;
        el.style.zIndex = String(currentTop);
    }

    function enableDrag(el, handle) {
        let startX = 0, startY = 0, originLeft = 0, originTop = 0;
        let rafId = null;
        let dx = 0, dy = 0;
        let dragging = false;
        let moved = false;
        let resizingViaDrag = false;
        let startW = 0, startH = 0;

        const iframe = el.querySelector('iframe');
        const START_THRESHOLD = 3; // pixels

        function onPointerDown(e) {
            if (e.target.closest('.window-controls')) return;
            if (e.target.closest('.title-size')) return; // allow size slider interaction without dragging
            dragging = true;
            moved = false;
            resizingViaDrag = e.shiftKey; // hold Shift to resize while dragging
            startX = e.clientX;
            startY = e.clientY;
            originLeft = parseFloat(el.style.left) || 0;
            originTop = parseFloat(el.style.top) || 0;
            if (resizingViaDrag) { startW = el.offsetWidth; startH = el.offsetHeight; el.classList.add('resizing'); }
            iframe.style.pointerEvents = 'none';
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
            tick();
        }
        function onPointerMove(e) {
            if (!dragging) return;
            dx = e.clientX - startX;
            dy = e.clientY - startY;
            if (!moved && (Math.abs(dx) > START_THRESHOLD || Math.abs(dy) > START_THRESHOLD)) {
                if (!resizingViaDrag) el.classList.add('dragging');
                bringToFront(el);
                moved = true;
            }
        }
        function onPointerUp(e) {
            if (!dragging) return;
            dragging = false;
            cancelAnimationFrame(rafId);
            el.classList.remove('dragging');
            if (resizingViaDrag) el.classList.remove('resizing');
            iframe.style.pointerEvents = '';

            if (!moved) { dx = 0; dy = 0; el.style.transform = ''; return; }

            if (resizingViaDrag) {
                // finalize resize
                const minW = 280, minH = 220, maxW = 2000, maxH = 1600;
                const newW = clamp(startW + dx, minW, maxW);
                const newH = clamp(startH + dy, minH, maxH);
                el.style.width = `${newW}px`;
                el.style.height = `${newH}px`;
            } else {
                let newLeft = originLeft + dx;
                let newTop = originTop + dy;

                const vpW = document.documentElement.clientWidth;
                const vpH = Math.max(window.innerHeight, document.documentElement.clientHeight);
                const w = el.offsetWidth; const h = el.offsetHeight;
                newLeft = clamp(newLeft, -w + 60, vpW - 60);
                newTop = clamp(newTop, -h + 40, vpH - 40);

                el.style.transform = '';
                el.style.left = `${newLeft}px`;
                el.style.top = `${newTop}px`;
            }

            persistFromElement(el);
            // update tooltip after move or resize
            const infoBtn = el.querySelector('.window-controls [data-action="info"]');
            if (infoBtn) infoBtn.title = `${el.offsetWidth}x${el.offsetHeight}`;
        }
        function tick() {
            rafId = requestAnimationFrame(() => {
                if (moved) {
                    if (resizingViaDrag) {
                        const minW = 280, minH = 220, maxW = 2000, maxH = 1600;
                        const newW = clamp(startW + dx, minW, maxW);
                        const newH = clamp(startH + dy, minH, maxH);
                        el.style.width = `${newW}px`;
                        el.style.height = `${newH}px`;
                    } else {
                        el.style.transform = `translate(${dx}px, ${dy}px)`;
                    }
                }
                if (dragging) tick();
            });
        }

        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
        handle.addEventListener('lostpointercapture', onPointerUp);
    }

    function enableResize(el, handle) {
        const dir = handle.dataset.resize;
        const iframe = el.querySelector('iframe');
        let startX = 0, startY = 0, startW = 0, startH = 0, startL = 0, startT = 0;
        let rafId = null;
        let moving = false;
        let dx = 0, dy = 0;

        function onDown(e) {
            moving = true;
            el.classList.add('resizing');
            bringToFront(el);
            startX = e.clientX; startY = e.clientY;
            startW = el.offsetWidth; startH = el.offsetHeight;
            startL = parseFloat(el.style.left) || 0;
            startT = parseFloat(el.style.top) || 0;
            iframe.style.pointerEvents = 'none';
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
            loop();
        }
        function onMove(e) { if (moving) { dx = e.clientX - startX; dy = e.clientY - startY; } }
        function onUp(e) {
            if (!moving) return;
            moving = false;
            cancelAnimationFrame(rafId);
            iframe.style.pointerEvents = '';
            el.classList.remove('resizing');

            applyResize(true);
            persistFromElement(el);
            const infoBtn = el.querySelector('.window-controls [data-action="info"]');
            if (infoBtn) infoBtn.title = `${el.offsetWidth}x${el.offsetHeight}`;
        }
        function loop() { rafId = requestAnimationFrame(() => { applyResize(false); if (moving) loop(); }); }
        function applyResize(finalize) {
            const minW = 280, minH = 220, maxW = 2000, maxH = 1600;

            let newW = startW, newH = startH, newL = startL, newT = startT;
            if (dir.includes('e')) newW = clamp(startW + dx, minW, maxW);
            if (dir.includes('s')) newH = clamp(startH + dy, minH, maxH);
            if (dir.includes('w')) { newW = clamp(startW - dx, minW, maxW); newL = startL + dx; }
            if (dir.includes('n')) { newH = clamp(startH - dy, minH, maxH); newT = startT + dy; }

            // Constrain vertically within viewport top/bottom pleasant bounds
            const vpW = document.documentElement.clientWidth;
            const vpH = Math.max(window.innerHeight, document.documentElement.clientHeight);
            newL = clamp(newL, -newW + 60, vpW - 60);
            newT = clamp(newT, -newH + 40, vpH - 40);

            el.style.width = `${newW}px`;
            el.style.height = `${newH}px`;
            el.style.left = `${newL}px`;
            el.style.top = `${newT}px`;

            const infoBtn = el.querySelector('.window-controls [data-action="info"]');
            if (infoBtn) infoBtn.title = `${newW}x${newH}`;
        }

        handle.addEventListener('pointerdown', onDown);
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onUp);
        handle.addEventListener('pointercancel', onUp);
        handle.addEventListener('lostpointercapture', onUp);
    }

    function persistFromElement(el, forcedId) {
        const id = forcedId || parseInt(el.dataset.id);
        const rect = {
            x: parseFloat(el.style.left) || 0,
            y: parseFloat(el.style.top) || 0,
            width: el.offsetWidth,
            height: el.offsetHeight,
            z: parseInt(el.style.zIndex) || 10,
            collapsed: el.classList.contains('hidden-content')
        };
        const windows = getWindowsState();
        const idx = windows.findIndex(w => w.id === id);
        if (idx >= 0) {
            windows[idx] = { ...windows[idx], ...rect };
            setWindowsState(windows);
        }
    }

    function restoreWindows() {
        const windows = getWindowsState();
        if (!Array.isArray(windows)) return;
        const maxZ = windows.reduce((m, w) => Math.max(m, w.z || 10), 10);
        zCounter = maxZ + 1;
        windows.forEach(w => createChatWindow(w));
    }

    function escapeHtml(str) {
        return str.replace(/[&<>"]+/g, function(s) {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
            return map[s];
        });
    }

    // Alignment utilities
    function readAllWindows() {
        return Array.from(chatDesktop.querySelectorAll('.chat-window'));
    }

    function alignCascade() {
        const list = readAllWindows();
        const step = 28;
        let x = 20, y = 20;
        list.forEach((el, idx) => {
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            x += step; y += step;
            persistFromElement(el);
        });
    }

    function alignTile() {
        const nodes = Array.from(chatDesktop.querySelectorAll('.chat-window'));
        if (!nodes.length) return;
        const deskRect = chatDesktop.getBoundingClientRect();
        const pad = 16;
        let x = pad, y = pad, rowH = 0;
        nodes.forEach(el => {
            el.style.transform = '';
            const w = el.offsetWidth; const h = el.offsetHeight;
            if (x + w + pad > deskRect.width) { x = pad; y += rowH + pad; rowH = 0; }
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            x += w + pad; rowH = Math.max(rowH, h);
            persistFromElement(el);
        });
    }

    function alignEdge(edge) {
        const nodes = Array.from(chatDesktop.querySelectorAll('.chat-window'));
        const deskRect = chatDesktop.getBoundingClientRect();
        const pad = 16;
        nodes.forEach(el => {
            el.style.transform = '';
            if (edge === 'left') el.style.left = `${pad}px`;
            if (edge === 'right') el.style.left = `${Math.max(pad, deskRect.width - el.offsetWidth - pad)}px`;
            if (edge === 'top') el.style.top = `${pad}px`;
            if (edge === 'bottom') el.style.top = `${Math.max(pad, deskRect.height - el.offsetHeight - pad)}px`;
            if (edge === 'center') {
                el.style.left = `${Math.max(pad, (deskRect.width - el.offsetWidth)/2)}px`;
                el.style.top = `${Math.max(pad, (deskRect.height - el.offsetHeight)/2)}px`;
            }
            persistFromElement(el);
        });
    }

    function resizeAllToDefault() {
        const list = readAllWindows();
        const settings = JSON.parse(localStorage.getItem('desktopSettings')) || defaultDesktopSettings;
        list.forEach(el => {
            el.style.width = `${settings.width}px`;
            el.style.height = `${settings.height}px`;
            persistFromElement(el);
        });
    }

    // Unified size slider: scales all chat windows with preserved aspect ratio
    function applyScaleToChats(scale) {
        const settings = JSON.parse(localStorage.getItem('desktopSettings')) || defaultDesktopSettings;
        const baseW = settings.width;
        const baseH = settings.height;
        const newW = Math.round(baseW * scale);
        const newH = Math.round(baseH * scale);
        readAllWindows().forEach(el => {
            el.style.width = `${newW}px`;
            el.style.height = `${newH}px`;
            persistFromElement(el);
        });
        if (sizeOut) sizeOut.textContent = `${newW}x${newH}`;
    }
    if (sizeScaleInput) {
        let scaleRAF = null;
        sizeScaleInput.addEventListener('input', () => {
            const scale = parseFloat(sizeScaleInput.value || '1');
            if (scaleRAF) cancelAnimationFrame(scaleRAF);
            scaleRAF = requestAnimationFrame(() => applyScaleToChats(scale));
        });
    }

    if (alignCascadeBtn) alignCascadeBtn.addEventListener('click', alignCascade);
    if (alignTileBtn) alignTileBtn.addEventListener('click', alignTile);
    if (alignCenterBtn) alignCenterBtn.addEventListener('click', () => alignEdge('center'));
    if (resizeAllBtn) resizeAllBtn.addEventListener('click', () => { resizeAllToDefault(); });

    loadDesktopSettings();
    restoreWindows();

    // Status monitoring
    const services = [
        { name: 'xat', url: 'https://xat.com', element: document.getElementById('xatStatus') },
        { name: 'wiki', url: 'https://wiki.xat.com', element: document.getElementById('wikiStatus') }
    ].filter(s => s.element);
    
    function checkServiceStatus(service) {
        if (!service || !service.element) return;
        const indicator = service.element.querySelector('.status-indicator');
        const uptimeElement = service.element.querySelector('.uptime .value');
        if (!indicator || !uptimeElement) return;
        
        indicator.classList.remove('online', 'offline');
        indicator.classList.add('loading');
        
        setTimeout(() => {
            const isOnline = Math.random() > 0.2;
            
            indicator.classList.remove('loading');
            indicator.classList.add(isOnline ? 'online' : 'offline');
            const span = indicator.querySelector('span');
            if (span) span.textContent = isOnline ? 'Online' : 'Offline';
            
            if (isOnline) {
                const days = Math.floor(Math.random() * 30);
                const hours = Math.floor(Math.random() * 24);
                uptimeElement.textContent = `${days}d ${hours}h`;
            } else {
                uptimeElement.textContent = 'N/A';
            }
        }, 1500);
    }
    
    if (services.length) {
        services.forEach(service => { checkServiceStatus(service); });
        setInterval(() => { services.forEach(service => { checkServiceStatus(service); }); }, 5 * 60 * 1000);
    }

    // Name Effects Generator
    const effectText = document.getElementById('effectText');
    const charCount = document.getElementById('charCount');
    const gradColorsContainer = document.getElementById('gradColors');
    const addColorBtn = document.getElementById('addColor');
    const gradDirection = document.getElementById('gradDirection');
    const glowColor = document.getElementById('glowColor');
    const waveSpeed = document.getElementById('waveSpeed');
    const effectPreview = document.getElementById('effectPreview');
    const codeOutput = document.getElementById('codeOutput');
    const copyCodeBtn = document.getElementById('copyCode');
    const randomPresetBtn = document.getElementById('randomPreset');
    const boldToggle = document.getElementById('boldToggle');

    const colorPresets = [
        ['#ff0000', '#0000ff'],
        ['#ff00ff', '#00ffff'],
        ['#ffff00', '#ff00ff'],
        ['#00ff00', '#0000ff'],
        ['#ff0000', '#ffff00', '#00ff00'],
        ['#ff0000', '#ff9900', '#ffff00', '#00ff00'],
        ['#ff0000', '#0000ff', '#00ff00', '#ffff00'],
        ['#ff00ff', '#00ffff', '#ffff00', '#ff0000']
    ];

    function initColorInputs() {
        if (!gradColorsContainer) return;
        gradColorsContainer.innerHTML = '';
        addColorInput('#ff0000');
        addColorInput('#0000ff');
    }
    
    function addColorInput(color) {
        if (gradColorsContainer.children.length >= 6) return;
        const colorInput = document.createElement('div');
        colorInput.className = 'color-input';
        colorInput.innerHTML = `
            <input type="color" value="${color}" class="color-picker">
            <input type="text" value="${color}" class="color-hex" maxlength="7">
            <button class="remove-color"><i class="fas fa-times"></i></button>
        `;
        gradColorsContainer.appendChild(colorInput);
        
        const picker = colorInput.querySelector('.color-picker');
        const hex = colorInput.querySelector('.color-hex');
        const removeBtn = colorInput.querySelector('.remove-color');
        
        picker.addEventListener('input', () => { hex.value = picker.value; updateEffects(); });
        hex.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/i.test(hex.value) || /^#[0-9A-Fa-f]{3}$/i.test(hex.value)) {
                picker.value = hex.value; updateEffects();
            }
        });
        removeBtn.addEventListener('click', () => {
            if (gradColorsContainer.children.length > 1) { colorInput.remove(); updateEffects(); }
        });
    }

    if (addColorBtn) {
        addColorBtn.addEventListener('click', () => {
            if (gradColorsContainer.children.length < 6) addColorInput('#00ff00');
        });
    }

    if (effectText) {
        effectText.addEventListener('input', () => {
            const text = effectText.value;
            charCount.textContent = text.length;
            effectPreview.textContent = text || 'xat';
            updateEffects();
        });
    }

    [gradDirection, glowColor, waveSpeed].forEach(control => { control && control.addEventListener('input', updateEffects); });

    if (glowColor) {
        glowColor.addEventListener('input', () => {
            const valEl = document.querySelector('.color-picker-wrapper .color-value');
            if (valEl) valEl.textContent = glowColor.value;
            updateEffects();
        });
    }

    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(codeOutput.textContent);
            copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => { copyCodeBtn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
        });
    }

    if (boldToggle) {
        boldToggle.addEventListener('click', function() {
            effectPreview.classList.toggle('bold');
            this.classList.toggle('active');
            updateEffects();
        });
    }

    if (randomPresetBtn) {
        randomPresetBtn.addEventListener('click', () => {
            const preset = colorPresets[Math.floor(Math.random() * colorPresets.length)];
            gradColorsContainer.innerHTML = '';
            preset.forEach(color => addColorInput(color));
            gradDirection.value = ['90', '45', '-45'][Math.floor(Math.random() * 3)];
            glowColor.value = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            const valEl = document.querySelector('.color-picker-wrapper .color-value');
            if (valEl) valEl.textContent = glowColor.value;
            const speeds = ['', 'o1', 'f1', 'f2', 'o2', 'o3'];
            waveSpeed.value = speeds[Math.floor(Math.random() * speeds.length)];
            updateEffects();
        });
    }

    function updateEffects() {
        if (!effectPreview) return;
        const colors = [];
        document.querySelectorAll('.color-picker').forEach(picker => { if (picker.value) colors.push(picker.value); });
        const angle = parseFloat(gradDirection?.value || '90');
        const glow = glowColor?.value || '#000000';
        const speed = waveSpeed?.value || '';

        if (colors.length > 1) {
            const totalColors = colors.length;
            const gradientStops = [];
            colors.forEach((color, i) => { const percent = Math.round((i / totalColors) * 100); gradientStops.push(`${color} ${percent}%`); });
            gradientStops.push(`${colors[0]} 100%`);
            const gradient = `repeating-linear-gradient(${angle}deg, ${gradientStops.join(', ')})`;
            effectPreview.style.backgroundImage = gradient;
            effectPreview.style.backgroundSize = '200% 100%';
            effectPreview.style.backgroundRepeat = 'repeat-x';
            effectPreview.style.animation = 'none';
            effectPreview.classList.remove('wave-normal', 'wave-slow', 'wave-very-slow','wave-fast','wave-very-fast');
            void effectPreview.offsetWidth;
            if (speed) {
                const speedClass = { 'o1': 'wave-normal','f1': 'wave-slow','f2': 'wave-very-slow','o2': 'wave-fast','o3': 'wave-very-fast' }[speed];
                if (speedClass) effectPreview.classList.add(speedClass);
            }
        } else if (colors.length === 1) {
            effectPreview.style.background = colors[0];
            effectPreview.style.animation = 'none';
        }
        effectPreview.style.setProperty('--glow-color', glow);
        let code = '(glow';
        code += `#${glow.replace('#', '')}`;
        if (colors.length > 1) {
            code += `#grad#r${angle}`;
            if (speed) code += `#${speed}`;
            colors.forEach(c => code += `#${c.replace('#', '')}`);
        }
        code += ')';
        if (codeOutput) codeOutput.textContent = code;
    }

    // Xatspace Templates - legacy direct copy removed; modal-based code viewer handles copy now.

    // Avatars functionality
    const avatarGrid = document.getElementById('avatarGrid');
    const avatarSearch = document.getElementById('avatarSearch');
    const avatarCategories = document.querySelectorAll('.avatar-category');
    
    let avatarData = [/* If empty, we will build from folder listing */];
    if (avatarData.length === 0) {
        // Build a minimal list from known files (subset)
        avatarData = [
// Guest Stars
{ name: "Patrick Stewart", file: "Guest-Stars-Number-One-Patrick-Stewart-icon.png", category: "simpsons" },
{ name: "Johnny Cash as Coyote", file: "Guest-Stars-Coyote-Johnny-Cash-icon.png", category: "simpsons" },
{ name: "Lucius Sweet", file: "Guest-Stars-Lucius-Sweet-icon.png", category: "simpsons" },
{ name: "Susan Sarandon as Ballet Teacher", file: "Guest-Stars-Ballet-teacher-Sarandon-icon.png", category: "simpsons" },
{ name: "George C. Scott", file: "Guest-Stars-George-C-Scott-hit-by-football-icon.png", category: "simpsons" },

// Moes Tavern
{ name: "Barney as Astronaut Trainee", file: "Moes-Tavern-Barney-astronaut-trainee-icon.png", category: "simpsons" },

// Townspeople
{ name: "Human Fly", file: "Townspeople-Human-Fly-icon.png", category: "simpsons" },
{ name: "House of Evil Shopkeeper", file: "Townspeople-House-of-Evil-shopkeeper-icon.png", category: "simpsons" },
{ name: "Doctor Colossus", file: "Townspeople-Doctor-Colossus-icon.png", category: "simpsons" },
{ name: "Akira Sushi Waiter", file: "Townspeople-Akira-sushi-waiter-icon.png", category: "simpsons" },
{ name: "Secret Service Guy", file: "Townspeople-Secret-Service-guy-icon.png", category: "simpsons" },
{ name: "Maude Flanders", file: "Townpeople-Maude-Flanders-icon.png", category: "simpsons" },

// Simpsons Family
{ name: "Fiendish Maggie", file: "Simpsons-Family-Fiendish-Maggie-icon.png", category: "simpsons" },
{ name: "Simpsons Logo", file: "Simpsons-Family-Simpsons-logo-icon.png", category: "simpsons" },
{ name: "Catfish Marge", file: "Simpsons-Family-Catfish-Marge-icon.png", category: "simpsons" },

// Nuclear Plant
{ name: "Smithers as Big Bobo", file: "Nuclear-Plant-Smithers-as-a-big-Bobo-icon.png", category: "simpsons" },
{ name: "Burns Maniacal Driver 1", file: "Nuclear-Plant-Burns-maniacal-driver-1-icon.png", category: "simpsons" },
{ name: "Burns Maniacal Driver 2", file: "Nuclear-Plant-Burns-maniacal-driver-2-icon.png", category: "simpsons" },

// Objects
{ name: "Bobo Disheveled", file: "Objects-Bobo-disheveled-icon.png", category: "simpsons" },

// Homertopia
{ name: "Homer of Borg", file: "Homertopia-Homer-of-Borg-icon.png", category: "simpsons" },
{ name: "Little Shop of Homers", file: "Homertopia-Little-Shop-of-Homers-icon.png", category: "simpsons" },
{ name: "Crazy Homer Halloween V", file: "Homertopia-Crazy-Homer-Halloween-V-icon.png", category: "simpsons" },
{ name: "Scottish Homer", file: "Homertopia-Scottish-Homer-icon.png", category: "simpsons" },
{ name: "Homer's Scale", file: "Homertopia-Homers-scale-icon.png", category: "simpsons" },
{ name: "Homer Vader", file: "Homertopia-Homer-Vader-icon.png", category: "simpsons" },
{ name: "Homer the Astronaut", file: "Homertopia-Homer-the-Astronaut-icon.png", category: "simpsons" },
{ name: "Deep Space Homer", file: "Homertopia-Deep-Space-Homer-icon.png", category: "simpsons" },
{ name: "Homer Octopus", file: "Homertopia-Homer-octopus-icon.png", category: "simpsons" },
{ name: "Homer Fish", file: "Homertopia-Homer-fish-icon.png", category: "simpsons" },

// Bart Unabridged
{ name: "Bat Simpson", file: "Bart-Unabridged-Bat-Simpson-icon.png", category: "simpsons" },
{ name: "Bart Making a Face", file: "Bart-Unabridged-Bart-making-a-face-icon.png", category: "simpsons" },
{ name: "Bart as George Clooney", file: "Bart-Unabridged-Bart-George-Clooney-icon.png", category: "simpsons" },
{ name: "Sick Bart", file: "Bart-Unabridged-Sick-Bart-icon.png", category: "simpsons" },
{ name: "Nerdy Bart", file: "Bart-Unabridged-Nerdy-Bart-icon.png", category: "simpsons" },
{ name: "Electric Chair Bart", file: "Bart-Unabridged-Electric-chair-Bart-icon.png", category: "simpsons" },
{ name: "Early Drawn Bart", file: "Bart-Unabridged-Early-drawn-Bart-icon.png", category: "simpsons" },
{ name: "Devilish Bart", file: "Bart-Unabridged-Devilish-Bart-icon.png", category: "simpsons" },
{ name: "Colonel Bart Hapablat", file: "Bart-Unabridged-Colonel-Bart-Hapablat-icon.png", category: "simpsons" },
{ name: "Bart's Joke Face", file: "Bart-Unabridged-Barts-joke-face-icon.png", category: "simpsons" },
{ name: "BartBear", file: "Bart-Unabridged-BartBart-Bear-icon.png", category: "simpsons" },
{ name: "Bart as Washed Up Rock Star", file: "Bart-Unabridged-Bart-the-washed-up-rock-star-icon.png", category: "simpsons" },
{ name: "Bart the Ladies Man", file: "Bart-Unabridged-Bart-the-ladies-man-icon.png", category: "simpsons" },
{ name: "Bart the Fly", file: "Bart-Unabridged-Bart-the-fly-icon.png", category: "simpsons" },
{ name: "Bart 'The Elves!'", file: "Bart-Unabridged-Bart-The-elves-the-elves-icon.png", category: "simpsons" },
{ name: "Bart Screaming", file: "Bart-Unabridged-Bart-screaming-icon.png", category: "simpsons" },
{ name: "Bart Reaching Up", file: "Bart-Unabridged-Bart-reaching-up-icon.png", category: "simpsons" },
{ name: "Bart Faking Injury", file: "Bart-Unabridged-Bart-faking-injury-icon.png", category: "simpsons" },
{ name: "Bart Blowing Cheeks", file: "Bart-Unabridged-Bart-blowing-cheeks-on-glass-icon.png", category: "simpsons" },
{ name: "3D Bart", file: "Bart-Unabridged-3D-Bart-icon.png", category: "simpsons" },

// School
{ name: "Principal Harlan Dondelinger", file: "School-Principal-Harlan-Dondelinger-icon.png", category: "simpsons" },

// TV/Movie
{ name: "X-Files Burns", file: "Guest-Stars-X-Files-X-Files-Burns-icon.png", category: "simpsons" },
{ name: "Krusty's Heart Attack", file: "TV-Movie-Krustys-heart-attack-icon.png", category: "simpsons" },

// Bongo Comics
{ name: "Black Belch Barney", file: "Bongo-Comics-Black-Belch-Barney-icon.png", category: "simpsons" },
{ name: "Ingestible Bulk Homer", file: "Bongo-Comics-Ingestible-Bulk-Homer-icon.png", category: "simpsons" },
{ name: "Coma Grandpa", file: "Bongo-Comics-Coma-Grandpa-icon.png", category: "simpsons" },
{ name: "Pigboy Wiggum", file: "Bongo-Comics-Pigboy-Wiggum-icon.png", category: "simpsons" },

// Lisa's Wedding
{ name: "Older Smithers", file: "Lisas-Wedding-Older-Smithers-icon.png", category: "simpsons" },
{ name: "Renaissance Faire Tent", file: "Lisas-Wedding-Renaissance-Faire-tent-icon.png", category: "simpsons" },
{ name: "Librarian Robot Melting", file: "Lisas-Wedding-Librarian-robot-melting-icon.png", category: "simpsons" },
{ name: "Librarian Robot Crying", file: "Lisas-Wedding-Librarian-robot-crying-icon.png", category: "simpsons" },
{ name: "Older Dr. Hibbert", file: "Lisas-Wedding-Older-Dr-Hibbert-icon.png", category: "simpsons" },
{ name: "Frink Fish", file: "Lisas-Wedding-Frink-fish-icon.png", category: "simpsons" },
{ name: "Fortune Teller", file: "Lisas-Wedding-Fortune-teller-icon.png", category: "simpsons" },
{ name: "Adult Phantom Martin", file: "Lisas-Wedding-Adult-Phantom-Martin-icon.png", category: "simpsons" },

// Misc Episodes
{ name: "Hellfish Logo", file: "Misc-Episodes-Hellfish-Logo-icon.png", category: "simpsons" },
{ name: "Luigi", file: "Misc-Episodes-Luigi-icon.png", category: "simpsons" },

// Food
{ name: "Pork Chop", file: "Food-pork-chop-icon.png", category: "simpsons" },

// Folders
{ name: "Moe's Tavern Folder", file: "Folder-Moes-Tavern-icon.png", category: "simpsons" },
{ name: "Lisa Icons Folder", file: "Folder-Lisa-Icons-icon.png", category: "simpsons" },
{ name: "Bongo Comics Folder", file: "Folder-Bongo-Comics-icon.png", category: "simpsons" },
{ name: "Bart Folder", file: "Folder-Bart-icon.png", category: "simpsons" },
{ name: "Marge Folder", file: "Folder-Marge-icon.png", category: "simpsons" },
{ name: "3D Homer Folder", file: "Folder-3D-Homer-on-3D-icon.png", category: "simpsons" },
{ name: "Grandpa Simpson Folder", file: "Folder-Grandpa-Simpson-icon.png", category: "simpsons" },
{ name: "Homer in 3D Land Folder", file: "Folder-Homer-in-3D-land-icon.png", category: "simpsons" },
{ name: "Violet Homer Folder", file: "Folder-Violet-Homer-icon.png", category: "simpsons" },
{ name: "Teal Homer Folder", file: "Folder-Teal-Homer-icon.png", category: "simpsons" },
{ name: "Springfield 9 Folder", file: "Folder-Springfield-9-icon.png", category: "simpsons" },
{ name: "Professor Frink Folder", file: "Folder-Professor-Frink-icon.png", category: "simpsons" },
{ name: "Misc Episodes Folder", file: "Folder-Misc-Episodes-icon.png", category: "simpsons" },
{ name: "Guest Stars Folder", file: "Folder-Guest-Stars-icon.png", category: "simpsons" },
{ name: "Futurama Folder", file: "Folder-Futurama-icon.png", category: "simpsons" },
{ name: "Food & Drink Folder", file: "Folder-Food-Drink-icon.png", category: "simpsons" },
{ name: "Bartinator Folder", file: "Folder-Bartinator-icon.png", category: "simpsons" },
{ name: "Bart Reaching Up (Red)", file: "Folder-Bart-reaching-up-red-icon.png", category: "simpsons" },
{ name: "Bart Reaching Up (Purple)", file: "Folder-Bart-reaching-up-purple-icon.png", category: "simpsons" },
{ name: "Bart Reaching Up (Green)", file: "Folder-Bart-reaching-up-green-icon.png", category: "simpsons" },
{ name: "Bart Reaching Up (Blue)", file: "Folder-Bart-reaching-up-blue-icon.png", category: "simpsons" },

// Futurama
{ name: "Planet Express Ship", file: "Futurama-Planet-Express-Ship-icon.png", category: "futurama" },
{ name: "Phillip J. Fry", file: "Futurama-Phillip-J-Fry-icon.png", category: "futurama" },
{ name: "Matt Groening's Head", file: "Futurama-Matt-Groenings-head-in-a-jar-icon.png", category: "futurama" },
{ name: "Dr. Hubert Farnsworth", file: "Futurama-Dr-Hubert-Farnsworth-icon.png", category: "futurama" },
{ name: "Bender Unit 22", file: "Futurama-Bender-Unit-22-icon.png", category: "futurama" },
        
{ name: "Cloyster", file: "091-icon.png", category: "pokemon" },
{ name: "Vulpix", file: "037-icon.png", category: "pokemon" },
{ name: "Jigglypuff", file: "039-icon.png", category: "pokemon" },
{ name: "Oddish", file: "043-icon.png", category: "pokemon" },
{ name: "Pidgeotto", file: "017-icon.png", category: "pokemon" },
{ name: "Pidgey", file: "016-icon.png", category: "pokemon" },
{ name: "Pidgeot", file: "018-icon.png", category: "pokemon" },
{ name: "Pikachu", file: "025-icon.png", category: "pokemon" },
{ name: "Growlithe", file: "058-icon.png", category: "pokemon" },
{ name: "Machamp", file: "068-icon.png", category: "pokemon" },
{ name: "Machoke", file: "067-icon.png", category: "pokemon" },
{ name: "Machop", file: "066-icon.png", category: "pokemon" },
{ name: "Machop", file: "065-icon.png", category: "pokemon" }, // Note: 065 is actually Machop's shiny variant
{ name: "Kadabra", file: "064-icon.png", category: "pokemon" },
{ name: "Ponyta", file: "076-icon.png", category: "pokemon" },
{ name: "Metapod", file: "011-icon.png", category: "pokemon" },
{ name: "Blastoise", file: "009-icon.png", category: "pokemon" },
{ name: "Venusaur", file: "003-icon.png", category: "pokemon" },
{ name: "Electabuzz", file: "125-icon.png", category: "pokemon" },
{ name: "Charmander", file: "004-icon.png", category: "pokemon" },
{ name: "Gengar", file: "094-icon.png", category: "pokemon" },
{ name: "Haunter", file: "093-icon.png", category: "pokemon" },
{ name: "Gastly", file: "092-icon.png", category: "pokemon" },
{ name: "Zubat", file: "041-icon.png", category: "pokemon" },
{ name: "Exeggcute", file: "102-icon.png", category: "pokemon" },
{ name: "Weezing", file: "110-icon.png", category: "pokemon" },
{ name: "Lickitung", file: "108-icon.png", category: "pokemon" },
{ name: "Koffing", file: "109-icon.png", category: "pokemon" },
{ name: "Dratini", file: "147-icon.png", category: "pokemon" },
{ name: "Dragonair", file: "148-icon.png", category: "pokemon" },
{ name: "Dragonite", file: "149-icon.png", category: "pokemon" },
{ name: "Mewtwo", file: "150-icon.png", category: "pokemon" },
{ name: "Mew", file: "151-icon.png", category: "pokemon" },
{ name: "Kabutops", file: "141-icon.png", category: "pokemon" },
{ name: "Kabuto", file: "140-icon.png", category: "pokemon" },
{ name: "Omastar", file: "139-icon.png", category: "pokemon" },
{ name: "Omanyte", file: "138-icon.png", category: "pokemon" },
{ name: "Porygon", file: "137-icon.png", category: "pokemon" },
{ name: "Flareon", file: "136-icon.png", category: "pokemon" },
{ name: "Jolteon", file: "135-icon.png", category: "pokemon" },
{ name: "Vaporeon", file: "134-icon.png", category: "pokemon" },
{ name: "Eevee", file: "133-icon.png", category: "pokemon" },
{ name: "Ditto", file: "132-icon.png", category: "pokemon" },
{ name: "Lapras", file: "131-icon.png", category: "pokemon" },
{ name: "Gyarados", file: "130-icon.png", category: "pokemon" },
{ name: "Tauros", file: "128-icon.png", category: "pokemon" },
{ name: "Pinsir", file: "127-icon.png", category: "pokemon" },
{ name: "Magmar", file: "126-icon.png", category: "pokemon" },
        
        // Smurf
{ name: "Puppy", file: "Puppy-icon.png", category: "smurf" },
{ name: "Nat", file: "Nat-icon.png", category: "smurf" },
{ name: "Mushroom", file: "Mushroom-icon.png", category: "smurf" },
{ name: "Papa Smurf", file: "Papa-Smurf-icon.png", category: "smurf" },
{ name: "Smurfette", file: "Smurfette-icon.png", category: "smurf" },
{ name: "Asmurf", file: "Asmurf-icon.png", category: "smurf" },
{ name: "Azrael", file: "Azreal-icon.png", category: "smurf" },
{ name: "Bigmouth Smurf", file: "Bigmouth-icon.png", category: "smurf" },
{ name: "Hefty Smurf", file: "Hefty-icon.png", category: "smurf" },
{ name: "Handy Smurf", file: "Handy-icon.png", category: "smurf" },
{ name: "Grouchy Smurf", file: "Grouchy-icon.png", category: "smurf" },
{ name: "Greedy Smurf", file: "Greedy-icon.png", category: "smurf" },
{ name: "Jokey's Present", file: "Jokeys-present-icon.png", category: "smurf" },
        
{ name: "Wally", file: "Wally-icon.png", category: "dilbert" },
{ name: "Tina", file: "Tina-icon.png", category: "dilbert" },
{ name: "Dogbert (Tie)", file: "Tie-Dogbert-icon.png", category: "dilbert" },
{ name: "Dogbert (Sitting)", file: "Sit-Dogbert-icon.png", category: "dilbert" },
{ name: "Security Guard", file: "Security-icon.png", category: "dilbert" },
{ name: "Ratbert", file: "Ratbert-icon.png", category: "dilbert" },
{ name: "Dilbert (Profile)", file: "Profile-Dilbert-icon.png", category: "dilbert" },
{ name: "Phil (Ruler of Heck)", file: "Phil-Ruler-of-Heck-icon.png", category: "dilbert" },
{ name: "Catbert (Old)", file: "Old-Catbert-icon.png", category: "dilbert" },
{ name: "Alice (Old)", file: "Old-Alice-icon.png", category: "dilbert" },
{ name: "Dogbert (King)", file: "King-Dogbert-icon.png", category: "dilbert" },
{ name: "Pointy-Haired Boss (Huh)", file: "HuhBoss-icon.png", category: "dilbert" },
{ name: "Dilbert's Mom", file: "Dilbert-Mom-icon.png", category: "dilbert" },
{ name: "Garbage Man Yoda", file: "Dilbert-Garbage-Man-Yoda-icon.png", category: "dilbert" },
{ name: "Dilbert", file: "Dilbert-icon.png", category: "dilbert" },
{ name: "Catbert", file: "Catbert-icon.png", category: "dilbert" },
{ name: "Pointy-Haired Boss", file: "Boss-icon.png", category: "dilbert" },
{ name: "Dilbert Icons Folder", file: "Bos-Dilbert-Icons-Folder-icon.png", category: "dilbert" },
{ name: "Asok", file: "Asok-icon.png", category: "dilbert" },
{ name: "Alice", file: "Alice-icon.png", category: "dilbert" },
        
// Main Characters
{ name: "Stan Marsh", file: "Storyboard-Stan-icon.png", category: "southpark" },
{ name: "Kyle Broflovski", file: "Storyboard-Kyle-icon.png", category: "southpark" },
{ name: "Eric Cartman", file: "Cartman-icon.png", category: "southpark" },
{ name: "Eric Cartman (Alternate)", file: "Cartman-2-icon.png", category: "southpark" },
{ name: "Kenny McCormick", file: "Kenny-icon.png", category: "southpark" },
{ name: "Kenny McCormick (Storyboard)", file: "Storyboard-Kenny-icon.png", category: "southpark" },

// Supporting Characters
{ name: "Wendy Testaburger", file: "Wendy-icon.png", category: "southpark" },
{ name: "Wendy Testaburger (Alternate)", file: "Wendy-2-icon.png", category: "southpark" },
{ name: "Chef", file: "Chef-icon.png", category: "southpark" },
{ name: "Chef (Slut 1)", file: "Chef-Slut-1-icon.png", category: "southpark" },
{ name: "Chef (Slut 2)", file: "Chef-Slut-2-icon.png", category: "southpark" },
{ name: "Officer Barbrady", file: "Barbrady-icon.png", category: "southpark" },
{ name: "Officer Barbrady (Singa)", file: "Barbrady-Singa-icon.png", category: "southpark" },
{ name: "Bebe Stevens", file: "Bebe-icon.png", category: "southpark" },
{ name: "Big Gay Al", file: "Big-Gay-Al-icon.png", category: "southpark" },

// Storyboard Characters
{ name: "Storyboard Cartman", file: "Storyboard-Cartman-icon.png", category: "southpark" },
{ name: "Storyboard Cartman 2", file: "Storyboard-Cartman-2-icon.png", category: "southpark" },
{ name: "Storyboard Ned", file: "Storyboard-Ned-icon.png", category: "southpark" },
{ name: "Storyboard Onlooker", file: "Storyboard-Onlooker-icon.png", category: "southpark" },
{ name: "Storyboard Sparky", file: "Storyboard-Sparky-icon.png", category: "southpark" },

// Special Versions
{ name: "Cartman (Beefcake)", file: "Cartman-Beefcake-icon.png", category: "southpark" },
{ name: "Cartman (Exam)", file: "Cartman-Exam-icon.png", category: "southpark" },
{ name: "Cartman (Mom)", file: "Cartman-Mom-icon.png", category: "southpark" },
{ name: "Cartman (Pink Eye)", file: "Cartman-Pink-Eye-icon.png", category: "southpark" },
{ name: "Cartman (Singa)", file: "Cartman-Singa-icon.png", category: "southpark" },

// Other Characters
{ name: "Marvin", file: "Marvin-icon.png", category: "southpark" },
{ name: "Death", file: "Death-icon.png", category: "southpark" },
{ name: "Conductor", file: "Conductor-icon.png", category: "southpark" },
{ name: "Carl the Visitor", file: "Carl-the-Visitor-icon.png", category: "southpark" },
{ name: "Brave Chef", file: "Brave-chef-icon.png", category: "southpark" },

// Items/Animals
{ name: "Cheesy Poofs", file: "Cheesy-Poofs-icon.png", category: "southpark" },
{ name: "Fluffy", file: "Fluffy-icon.png", category: "southpark" },
{ name: "Black Cow", file: "Black-Cow-icon.png", category: "southpark" },
{ name: "Brown Cow", file: "Brown-Cow-icon.png", category: "southpark" },

// Folders
{ name: "South Park Icons Folder", file: "Bos-South-Park-Icons-folder-icon.png", category: "southpark" },
        
{ name: "Trigger", file: "TRIGGER-icon.png", category: "robinhood" },
{ name: "Toby", file: "TOBY-icon.png", category: "robinhood" },
{ name: "Target", file: "TARGET-icon.png", category: "robinhood" },
{ name: "Tagalong", file: "TAGALONG-icon.png", category: "robinhood" },
{ name: "Skippy", file: "SKIPPY-icon.png", category: "robinhood" },
{ name: "Sis", file: "SIS-icon.png", category: "robinhood" },
{ name: "Sir Hiss", file: "Sir-Hiss-icon.png", category: "robinhood" },
{ name: "Sheriff of Nottingham", file: "Sheriff-of-Nottingham-icon.png", category: "robinhood" },
{ name: "Sexton the Churchmouse", file: "Sexton-the-churchmouse-icon.png", category: "robinhood" },
{ name: "Sack of Money", file: "Sack-of-Money-icon.png", category: "robinhood" },
{ name: "Robin Hood", file: "Robin-Hood-icon.png", category: "robinhood" },
{ name: "Robin as Stork", file: "Robin-as-Stork-icon.png", category: "robinhood" },
{ name: "Robin as Gypsy", file: "Robin-as-Gypsy-icon.png", category: "robinhood" },
{ name: "Robin as Blindman", file: "Robin-as-Blindman-icon.png", category: "robinhood" },
{ name: "Rhino Guard", file: "RHINO-icon.png", category: "robinhood" },
{ name: "Prince John", file: "Prince-John-icon.png", category: "robinhood" },
{ name: "Otto the Blacksmith", file: "Otto-the-Blacksmith-icon.png", category: "robinhood" },
{ name: "Nutsy", file: "NUTSY-icon.png", category: "robinhood" },
{ name: "Mother Rabbit", file: "Mother-Rabbit-icon.png", category: "robinhood" },
{ name: "Maid Marian", file: "Maid-Marian-icon.png", category: "robinhood" },
{ name: "Little John as Reginold", file: "Little-John-as-Reginold-icon.png", category: "robinhood" },
{ name: "Little John as Gypsy", file: "Little-John-as-Gypsy-icon.png", category: "robinhood" },
{ name: "Little John", file: "Little-John-icon.png", category: "robinhood" },
{ name: "Lady Kluck", file: "Lady-Kluck-icon.png", category: "robinhood" },
{ name: "King Richard", file: "King-Richard-icon.png", category: "robinhood" },
{ name: "Hippo Guard", file: "HIPPO-icon.png", category: "robinhood" },
{ name: "Friar Tuck", file: "Friar-Tuck-icon.png", category: "robinhood" },
{ name: "Crocodile", file: "Crocodile-icon.png", category: "robinhood" },
{ name: "Bullseye", file: "Bulls-eye-icon.png", category: "robinhood" },
{ name: "Allan-a-Dale", file: "Allan-a-Dale-icon.png", category: "robinhood" },
        
// Main Characters
{ name: "Garfield", file: "Garfield-1-icon.png", category: "garfield" },
{ name: "Garfield (Alternate 1)", file: "Garfield-2-icon.png", category: "garfield" },
{ name: "Garfield (Alternate 2)", file: "Garfield-3-icon.png", category: "garfield" },
{ name: "Garfield (Alternate 3)", file: "Garfield-4-icon.png", category: "garfield" },
{ name: "Garfield (Screaming)", file: "Garfield-Screaming-icon.png", category: "garfield" },
{ name: "Jon Arbuckle", file: "Jon-Arbuckle-1-icon.png", category: "garfield" },
{ name: "Odie", file: "Odie-1-icon.png", category: "garfield" },
{ name: "Odie (Alternate 1)", file: "Odie-2-icon.png", category: "garfield" },
{ name: "Odie (Alternate 2)", file: "Odie-3-icon.png", category: "garfield" },
{ name: "Odie (Alternate 3)", file: "Odie-4-icon.png", category: "garfield" },
{ name: "Nermal", file: "Nermal-1-icon.png", category: "garfield" },
{ name: "Nermal (Alternate)", file: "Nermal-2-icon.png", category: "garfield" },

// Supporting Characters
{ name: "Arlene", file: "Arlene-1-icon.png", category: "garfield" },
{ name: "Arlene (Alternate)", file: "Arlene-2-icon.png", category: "garfield" },
{ name: "Lyman", file: "Wade-icon.png", category: "garfield" }, // Note: Wade appears to be Lyman
{ name: "Sheldon", file: "Sheldon-icon.png", category: "garfield" },
{ name: "Roy", file: "Roy-1-icon.png", category: "garfield" },
{ name: "Roy (Alternate)", file: "Roy-2-icon.png", category: "garfield" },
{ name: "Orson", file: "Orson-1-icon.png", category: "garfield" },
{ name: "Orson (Alternate)", file: "Orson-2-icon.png", category: "garfield" },
{ name: "Liz", file: "Liz-icon.png", category: "garfield" },
{ name: "Dr. Liz Wilson", file: "Doc-icon.png", category: "garfield" },
{ name: "Irma", file: "Irma-icon.png", category: "garfield" },
{ name: "Mailman", file: "Mailman-icon.png", category: "garfield" },

// Farm Characters
{ name: "Bo", file: "Bo-icon.png", category: "garfield" },
{ name: "Booker", file: "Booker-1-icon.png", category: "garfield" },
{ name: "Booker (Alternate 1)", file: "Booker-2-icon.png", category: "garfield" },
{ name: "Booker (Alternate 2)", file: "Booker-3-icon.png", category: "garfield" },
{ name: "Lanolin", file: "Lanolin-icon.png", category: "garfield" },
{ name: "Worm", file: "Worm-icon.png", category: "garfield" },
{ name: "Blue", file: "Blue-icon.png", category: "garfield" },
{ name: "Cody", file: "Cody-icon.png", category: "garfield" },
{ name: "Poekie", file: "Poekie-1-icon.png", category: "garfield" },

// Family Members
{ name: "Mom", file: "Mom-icon.png", category: "garfield" },
{ name: "Dad", file: "Dad-icon.png", category: "garfield" },
{ name: "Grandmother", file: "Grandmother-icon.png", category: "garfield" },
        
// Main Characters
{ name: "Grimm", file: "Grimm-1-icon.png", category: "grimm" },
{ name: "Grimm (Alternate 1)", file: "Grimm-2-icon.png", category: "grimm" },
{ name: "Grimm (Alternate 2)", file: "Grimm-3-icon.png", category: "grimm" },
{ name: "Grimm (Head)", file: "Grimm-Head-icon.png", category: "grimm" },
{ name: "Grimm (Smiling 1)", file: "Grimm-Smiling-1-icon.png", category: "grimm" },
{ name: "Grimm (Smiling 2)", file: "Grimm-Smiling-2-icon.png", category: "grimm" },
{ name: "Grimm (Sad)", file: "Grimm-Sad-1-icon.png", category: "grimm" },
{ name: "Grimm (Screaming)", file: "Grimm-Screaming-icon.png", category: "grimm" },
{ name: "Grimm (Sleepy)", file: "Grimm-Sleepy-icon.png", category: "grimm" },
{ name: "Grimm (Running)", file: "Grimm-Running-icon.png", category: "grimm" },
{ name: "Grimm (Freezing)", file: "Grimm-Freezing-icon.png", category: "grimm" },
{ name: "Grimm (Yuk)", file: "Grimm-Yuk-icon.png", category: "grimm" },

// Attila the Dog
{ name: "Attila", file: "Attila-icon.png", category: "grimm" },
{ name: "Attila (Front)", file: "Attila-Front-icon.png", category: "grimm" },
{ name: "Attila (Side)", file: "Attila-Side-icon.png", category: "grimm" },
{ name: "Attila (Scared)", file: "Attila-Scared-icon.png", category: "grimm" },
{ name: "Attila (Screaming)", file: "Attila-Screaming-icon.png", category: "grimm" },
{ name: "Attila (Sleeping 1)", file: "Attila-Sleeping-1-icon.png", category: "grimm" },
{ name: "Attila (Sleeping 2)", file: "Attila-Sleeping-2-icon.png", category: "grimm" },
{ name: "Attila (Freezing)", file: "Attila-Freezing-icon.png", category: "grimm" },

// Supporting Characters
{ name: "Mother Goose", file: "Mother-Goose-1-icon.png", category: "grimm" },
{ name: "Whiz (Version 1)", file: "Whiz-1-icon.png", category: "grimm" },
{ name: "Whiz (Version 2)", file: "Whiz-2-icon.png", category: "grimm" },
{ name: "Sumo", file: "Sumo-icon.png", category: "grimm" },
        
        // Sesame Street
{ name: "Twiddlebug Queen", file: "Pino-Sesame-Street-Twiddlebug-Queen.32.png", category: "sesame" },
{ name: "Twiddlebug", file: "Pino-Sesame-Street-Twiddlebug.32.png", category: "sesame" },
{ name: "The Count", file: "Pino-Sesame-Street-The-Count.32.png", category: "sesame" },
{ name: "Telly", file: "Pino-Sesame-Street-Telly.32.png", category: "sesame" },
{ name: "Sully", file: "Pino-Sesame-Street-Sully.32.png", category: "sesame" },
{ name: "Snuffy", file: "Pino-Sesame-Street-Snuffy.32.png", category: "sesame" },
{ name: "Slimey", file: "Pino-Sesame-Street-Slimey-1.32.png", category: "sesame" },
{ name: "Rosita", file: "Pino-Sesame-Street-Rosita.32.png", category: "sesame" },
{ name: "Prairie Dawn", file: "Pino-Sesame-Street-Prairie-Dawn-1.32.png", category: "sesame" },
{ name: "Oscar", file: "Pino-Sesame-Street-Oscar.32.png", category: "sesame" },
{ name: "Little Bird", file: "Pino-Sesame-Street-Little-Bird.32.png", category: "sesame" },
{ name: "Kingston", file: "Pino-Sesame-Street-Kingston.32.png", category: "sesame" },
{ name: "Kermit", file: "Pino-Sesame-Street-Kermit.32.png", category: "sesame" },
{ name: "Honker", file: "Pino-Sesame-Street-Honker.32.png", category: "sesame" },
{ name: "Herry Monster", file: "Pino-Sesame-Street-Herry-Monster.32.png", category: "sesame" },
{ name: "Grover", file: "Pino-Sesame-Street-Grover.32.png", category: "sesame" },
{ name: "Franklin Roosenvelt", file: "Pino-Sesame-Street-Franklin-Roosenvelt.32.png", category: "sesame" },
{ name: "Ernie", file: "Pino-Sesame-Street-Ernie.32.png", category: "sesame" },
{ name: "Elmo", file: "Pino-Sesame-Street-Elmo-3.32.png", category: "sesame" },
{ name: "Elmo", file: "Pino-Sesame-Street-Elmo-2.32.png", category: "sesame" },
{ name: "Elmo", file: "Pino-Sesame-Street-Elmo-1.32.png", category: "sesame" },
{ name: "Cookie Monster", file: "Pino-Sesame-Street-Cookie-Monster-2.32.png", category: "sesame" },
{ name: "Cookie Monster", file: "Pino-Sesame-Street-Cookie-Monster-1.32.png", category: "sesame" },
{ name: "Big Bird", file: "Pino-Sesame-Street-Big-Bird.32.png", category: "sesame" },
{ name: "Biff", file: "Pino-Sesame-Street-Biff.32.png", category: "sesame" },
{ name: "Betty Lou", file: "Pino-Sesame-Street-Betty-Lou.32.png", category: "sesame" },
{ name: "Bert", file: "Pino-Sesame-Street-Bert.32.png", category: "sesame" },
{ name: "Baby Bear", file: "Pino-Sesame-Street-Baby-Bear.32.png", category: "sesame" },
{ name: "Barkley", file: "Pino-Sesame-Street-Barkley.32.png", category: "sesame" },
        
// Main Characters
{ name: "Daisaku Kusama", file: "Daisaku-icon.png", category: "giantrobo" },
{ name: "Daisaku Kusama (Alternate 1)", file: "Daisaku1-icon.png", category: "giantrobo" },
{ name: "Daisaku Kusama (Alternate 2)", file: "Daisaku2-icon.png", category: "giantrobo" },
{ name: "Ginrei", file: "Ginrei1-icon.png", category: "giantrobo" },
{ name: "Ginrei (Alternate 1)", file: "Ginrei2-icon.png", category: "giantrobo" },
{ name: "Ginrei (Alternate 2)", file: "Ginrei3-icon.png", category: "giantrobo" },
{ name: "Young Ginrei", file: "young-Ginrei-icon.png", category: "giantrobo" },
{ name: "Ginrei (Disguise)", file: "Ginrei-disguise-icon.png", category: "giantrobo" },

// Experts of Justice
{ name: "Chief Chujo", file: "Chief-Chujo-icon.png", category: "giantrobo" },
{ name: "Genya", file: "Genya-icon.png", category: "giantrobo" },
{ name: "Taisou", file: "Taisou-icon.png", category: "giantrobo" },
{ name: "Koshin", file: "Koshin-icon.png", category: "giantrobo" },
{ name: "Yoshi", file: "Yoshi-icon.png", category: "giantrobo" },
{ name: "Cho Katsu Kome", file: "Cho-Katsu-Kome-icon.png", category: "giantrobo" },
{ name: "Sun Getsu", file: "Sun-getsu-icon.png", category: "giantrobo" },
{ name: "Red Mask", file: "Red-mask-icon.png", category: "giantrobo" },

// BF Group Villains
{ name: "Big Fire", file: "Big-Fire-icon.png", category: "giantrobo" },
{ name: "Ivan", file: "Ivan-icon.png", category: "giantrobo" },
{ name: "Dr. Von Fogler", file: "Dr.-VonFogler-icon.png", category: "giantrobo" },
{ name: "Dr. Shizuma", file: "Dr.-Shizuma-icon.png", category: "giantrobo" },
{ name: "Dr. Kusama", file: "Dr.-Kusama-icon.png", category: "giantrobo" },
{ name: "Fitzcaral", file: "Fitzcaral-icon.png", category: "giantrobo" },
{ name: "Galuda", file: "Galuda-icon.png", category: "giantrobo" },
{ name: "Gana", file: "Gana-icon.png", category: "giantrobo" },
{ name: "Hanzui", file: "Hanzui-icon.png", category: "giantrobo" },
{ name: "Kaiho", file: "Kaiho-icon.png", category: "giantrobo" },
{ name: "Ko Enshaku", file: "Ko-Enshaku-icon.png", category: "giantrobo" },
{ name: "Q Boss", file: "Q-Boss-icon.png", category: "giantrobo" },
{ name: "Roden", file: "Roden-icon.png", category: "giantrobo" },
{ name: "Uranus", file: "Uranus-icon.png", category: "giantrobo" },
{ name: "Cervantes", file: "Cervantes-icon.png", category: "giantrobo" },

// Robots and Technology
{ name: "Giant Robo", file: "Robo-1-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 5)", file: "robo-5-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 7)", file: "robo-7-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 10)", file: "robo-10-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 11)", file: "robo-11-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 12)", file: "robo-12-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 14)", file: "robo-14-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 15)", file: "robo-15-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 17)", file: "robo-17-icon.png", category: "giantrobo" },
{ name: "Giant Robo (Variant 18)", file: "robo-18-icon.png", category: "giantrobo" },
{ name: "GR-2", file: "GR2-icon.png", category: "giantrobo" },
{ name: "Head Piece", file: "head-piece-icon.png", category: "giantrobo" },
{ name: "Orb", file: "Orb-icon.png", category: "giantrobo" },

// Minions
{ name: "Goon", file: "Goon-1-icon.png", category: "giantrobo" },
{ name: "Goon (Variant)", file: "Goon-2-icon.png", category: "giantrobo" },
{ name: "Unknown Character", file: "unknown-2-icon.png", category: "giantrobo" },

{ name: "Bob", file: "Bob-icon.png", category: "shermans" },
{ name: "Ernest", file: "Ernest-icon.png", category: "shermans" },
{ name: "Fillmore", file: "Fillmore-icon.png", category: "shermans" },
{ name: "Hawthorn", file: "Hawthorn-icon.png", category: "shermans" },
{ name: "Megan", file: "Megan-icon.png", category: "shermans" },
{ name: "Quigley", file: "Quigley-icon.png", category: "shermans" },
{ name: "Sherman (Version 1)", file: "Sherman-1-icon.png", category: "shermans" },
{ name: "Sherman (Version 2)", file: "Sherman-2-icon.png", category: "shermans" },
{ name: "Thornton", file: "Thornton-icon.png", category: "shermans" }
        ];
    }

    function loadAvatars(category = 'all') {
        if (!avatarGrid) return;
        avatarGrid.innerHTML = '';
        const filteredAvatars = category === 'all' ? avatarData : avatarData.filter(avatar => avatar.category === category);
        filteredAvatars.forEach(avatar => {
            const avatarItem = document.createElement('div');
            avatarItem.className = 'avatar-item loading';
            avatarItem.dataset.category = avatar.category;
            avatarItem.innerHTML = `
                <div class="avatar-img-container">
                    <img src="avatars/${avatar.file}" alt="${avatar.name}" class="avatar-img" loading="lazy">
                </div>
                <span class="avatar-name">${avatar.name}</span>
                <div class="copy-icon" title="Copy URL"><i class="fas fa-copy"></i></div>
            `;
            const img = avatarItem.querySelector('img');
            img.onload = () => { avatarItem.classList.remove('loading'); };
            img.onerror = () => {
                avatarItem.classList.remove('loading');
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%236c5ce7"><text x="12" y="16" text-anchor="middle" font-size="12" fill="white">?</text></svg>';
            };
            const copyIcon = avatarItem.querySelector('.copy-icon');
            copyIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const avatarUrl = `https://zkthegod.github.io/test/avatars/${avatar.file}`;
                navigator.clipboard.writeText(avatarUrl).then(() => {
                    const originalIcon = copyIcon.innerHTML;
                    copyIcon.innerHTML = '<i class="fas fa-check"></i>';
                    copyIcon.style.backgroundColor = '#2ecc71';
                    setTimeout(() => { copyIcon.innerHTML = originalIcon; copyIcon.style.backgroundColor = ''; }, 2000);
                });
            });
            avatarGrid.appendChild(avatarItem);
        });
    }

    if (avatarCategories && avatarCategories.length) {
        avatarCategories.forEach(categoryBtn => {
            categoryBtn.addEventListener('click', function() {
                const active = document.querySelector('.avatar-category.active');
                if (active) active.classList.remove('active');
                this.classList.add('active');
                loadAvatars(this.dataset.category);
            });
        });
    }

    if (avatarSearch) {
        avatarSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const currentCategory = document.querySelector('.avatar-category.active')?.dataset.category || 'all';
            const items = avatarGrid.querySelectorAll('.avatar-item');
            items.forEach(item => {
                const name = item.querySelector('.avatar-name').textContent.toLowerCase();
                const matchesCategory = currentCategory === 'all' || item.dataset.category === currentCategory;
                const matchesSearch = name.includes(searchTerm);
                item.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
            });
        });
    }

    // Initialize legacy sections
    initColorInputs();
    updateEffects();
    loadAvatars();

    // Build per-chat style chips
    const chatStylesList = document.getElementById('chatStylesList');
    function rebuildChatStyleChips() {
        if (!chatStylesList) return;
        chatStylesList.innerHTML = '';
        const windows = getWindowsState();
        windows.forEach(w => {
            const chip = document.createElement('div');
            chip.className = 'chat-style-chip';
            chip.innerHTML = `
                <span class="chip-title">${w.name}</span>
                <label>Glow</label>
                <input type="color" value="${w.style?.glowColor || '#6c5ce7'}" data-kind="glow" data-id="${w.id}">
            `;
            chatStylesList.appendChild(chip);
        });
    }

    function applyChatStyleToElement(el, style) {
        // Remove border styling per requirements; only keep glow
        el.style.boxShadow = '';
        if (style?.glowColor) el.style.filter = `drop-shadow(0 0 8px ${style.glowColor})`;
        else el.style.filter = '';
    }

    function wireStyleChipListeners() {
        if (!chatStylesList) return;
        chatStylesList.addEventListener('input', (e) => {
            const input = e.target;
            if (!(input instanceof HTMLInputElement)) return;
            const id = parseInt(input.dataset.id || '');
            const kind = input.dataset.kind;
            const windows = getWindowsState();
            const idx = windows.findIndex(w => w.id === id);
            if (idx < 0) return;
            const style = windows[idx].style || {};
            if (kind === 'glow') style.glowColor = input.value;
            // Persist and apply
            windows[idx].style = style;
            setWindowsState(windows);
            const el = chatDesktop.querySelector(`.chat-window[data-id="${id}"]`);
            if (el) applyChatStyleToElement(el, style);
        });
    }

    function applyStylesToExistingWindows() {
        const windows = getWindowsState();
        windows.forEach(w => {
            const el = chatDesktop.querySelector(`.chat-window[data-id="${w.id}"]`);
            if (el) applyChatStyleToElement(el, w.style);
        });
    }

    // Call after restoring windows
    restoreWindows();
    rebuildChatStyleChips();
    wireStyleChipListeners();
    applyStylesToExistingWindows();

    function setupAlignmentButtons() {
        const tileBtn = document.getElementById('alignTile');
        const centerBtn = document.getElementById('alignCenter');
        if (tileBtn && !tileBtn.dataset.bound) {
            tileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Tile button clicked');
                alignTile();
            });
            tileBtn.dataset.bound = 'true';
        }
        if (centerBtn && !centerBtn.dataset.bound) {
            centerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Center button clicked');
                alignEdge('center');
            });
            centerBtn.dataset.bound = 'true';
        }
    }

    setupAlignmentButtons();

    // Robust action delegation for settings drawer actions
    const drawerActions = document.querySelector('.settings-drawer .actions');
    if (drawerActions) {
        drawerActions.addEventListener('click', (e) => {
            e.stopPropagation();
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.id === 'alignTile') { alignTile(); }
            if (btn.id === 'alignCenter') { alignEdge('center'); }
            if (btn.id === 'resizeAll') { saveDesktopSettings(); resizeAllToDefault(); }
            if (btn.id === 'clearAllChats') {
                localStorage.removeItem('chatWindows');
                Array.from(chatDesktop.querySelectorAll('.chat-window')).forEach(el => el.remove());
                rebuildChatStyleChips();
            }
        });
    }
});
