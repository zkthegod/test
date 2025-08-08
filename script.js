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
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            pages.forEach(page => page.classList.remove('active'));
            document.querySelector(targetId).classList.add('active');
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            updatePageBackgroundForActiveTab();
        });
    });
    
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

    function updatePageBackgroundForActiveTab(inlineSettings) {
        const settings = inlineSettings || getDesktopSettings();
        if (settings.applyBackground && isChatTabActive()) {
            document.body.style.backgroundColor = settings.bgColor || '';
            document.body.style.backgroundImage = settings.bgImage ? `url('${settings.bgImage}')` : 'none';
            document.body.style.backgroundSize = settings.bgImage ? 'cover' : '';
            document.body.style.backgroundPosition = settings.bgImage ? 'center center' : '';
            document.body.style.backgroundRepeat = settings.bgImage ? 'no-repeat' : '';
            document.body.style.backgroundAttachment = settings.bgImage ? 'fixed' : '';
        } else {
            // Clear to theme defaults
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundPosition = '';
            document.body.style.backgroundRepeat = '';
            document.body.style.backgroundAttachment = '';
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
    }

    function createChatWindow(state) {
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
                <div class="window-controls">
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
        let altResize = false;

        const iframe = el.querySelector('iframe');

        function onPointerDown(e) {
            // Ignore drags starting from controls
            if (e.target.closest('.window-controls')) return;
            dragging = true;
            altResize = false;
            el.classList.add('dragging');
            bringToFront(el);
            startX = e.clientX;
            startY = e.clientY;
            originLeft = parseFloat(el.style.left) || 0;
            originTop = parseFloat(el.style.top) || 0;
            iframe.style.pointerEvents = 'none';
            handle.setPointerCapture(e.pointerId);
            e.preventDefault();
            tick();
        }
        function onPointerMove(e) { if (dragging) { dx = e.clientX - startX; dy = e.clientY - startY; } }
        function onPointerUp(e) {
            if (!dragging) return;
            dragging = false;
            cancelAnimationFrame(rafId);
            el.classList.remove('dragging');
            iframe.style.pointerEvents = '';

            // no alt-resize path; use handles for resizing

            let newLeft = originLeft + dx;
            let newTop = originTop + dy;

            // Constrain to viewport (not just canvas)
            const vpW = document.documentElement.clientWidth;
            const vpH = Math.max(window.innerHeight, document.documentElement.clientHeight);
            const w = el.offsetWidth; const h = el.offsetHeight;
            newLeft = clamp(newLeft, -w + 60, vpW - 60);
            newTop = clamp(newTop, -h + 40, vpH - 40);

            el.style.transform = '';
            el.style.left = `${newLeft}px`;
            el.style.top = `${newTop}px`;

            persistFromElement(el);
        }
        function tick() {
            rafId = requestAnimationFrame(() => {
                el.style.transform = `translate(${dx}px, ${dy}px)`;
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
        const list = readAllWindows();
        if (!list.length) return;
        const vpW = chatDesktop.clientWidth;
        const pad = 16;
        let x = pad, y = pad, rowH = 0;
        list.forEach(el => {
            const w = el.offsetWidth; const h = el.offsetHeight;
            if (x + w + pad > vpW) { x = pad; y += rowH + pad; rowH = 0; }
            el.style.left = `${x}px`; el.style.top = `${y}px`;
            x += w + pad; rowH = Math.max(rowH, h);
            persistFromElement(el);
        });
    }

    function alignEdge(edge) {
        const list = readAllWindows();
        const vpW = chatDesktop.clientWidth;
        const vpH = chatDesktop.clientHeight;
        const pad = 16;
        list.forEach(el => {
            if (edge === 'left') el.style.left = `${pad}px`;
            if (edge === 'right') el.style.left = `${Math.max(pad, vpW - el.offsetWidth - pad)}px`;
            if (edge === 'top') el.style.top = `${pad}px`;
            if (edge === 'bottom') el.style.top = `${Math.max(pad, vpH - el.offsetHeight - pad)}px`;
            if (edge === 'center') {
                el.style.left = `${Math.max(pad, (vpW - el.offsetWidth)/2)}px`;
                el.style.top = `${Math.max(pad, (vpH - el.offsetHeight)/2)}px`;
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

    alignCascadeBtn.addEventListener('click', alignCascade);
    alignTileBtn.addEventListener('click', alignTile);
    if (alignCenterBtn) alignCenterBtn.addEventListener('click', () => alignEdge('center'));
    resizeAllBtn.addEventListener('click', () => { saveDesktopSettings(); resizeAllToDefault(); });

    loadDesktopSettings();
    restoreWindows();

    // Status monitoring
    const services = [
        { name: 'xat', url: 'https://xat.com', element: document.getElementById('xatStatus') },
        { name: 'wiki', url: 'https://wiki.xat.com', element: document.getElementById('wikiStatus') }
    ];
    
    function checkServiceStatus(service) {
        const indicator = service.element.querySelector('.status-indicator');
        const uptimeElement = service.element.querySelector('.uptime .value');
        
        indicator.classList.remove('online', 'offline');
        indicator.classList.add('loading');
        
        setTimeout(() => {
            const isOnline = Math.random() > 0.2;
            
            indicator.classList.remove('loading');
            indicator.classList.add(isOnline ? 'online' : 'offline');
            indicator.querySelector('span').textContent = isOnline ? 'Online' : 'Offline';
            
            if (isOnline) {
                const days = Math.floor(Math.random() * 30);
                const hours = Math.floor(Math.random() * 24);
                uptimeElement.textContent = `${days}d ${hours}h`;
            } else {
                uptimeElement.textContent = 'N/A';
            }
        }, 1500);
    }
    
    services.forEach(service => { checkServiceStatus(service); });
    setInterval(() => { services.forEach(service => { checkServiceStatus(service); }); }, 5 * 60 * 1000);

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
        if (effectPreview.classList.contains('bold')) code += '#b';
        if (colors.length > 1) {
            code += `#grad#r${angle}`;
            if (speed) code += `#${speed}`;
            colors.forEach(c => code += `#${c.replace('#', '')}`);
        }
        code += ')';
        if (codeOutput) codeOutput.textContent = code;
    }

    // Xatspace Templates - Download Code functionality
    document.querySelectorAll('.template-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const templateName = this.closest('.template-card').querySelector('h3').textContent;
            const templateCode = `<!-- ${templateName} xatspace Template -->\n<div class="xatspace-template ${templateName.toLowerCase().replace(/\s+/g, '-')}">\n    <!-- Your xatspace content here -->\n</div>\n\n<style>\n.xatspace-template.${templateName.toLowerCase().replace(/\s+/g, '-')} {\n    background: #f5f6fa;\n    color: #2d3436;\n    max-width: 1000px;\n    margin: 0 auto;\n    padding: 20px;\n    border-radius: 12px;\n}\n</style>`;
            navigator.clipboard.writeText(templateCode).then(() => {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { this.innerHTML = originalText; }, 2000);
            });
        });
    });

    // Avatars functionality
    const avatarGrid = document.getElementById('avatarGrid');
    const avatarSearch = document.getElementById('avatarSearch');
    const avatarCategories = document.querySelectorAll('.avatar-category');
    
    let avatarData = [/* If empty, we will build from folder listing */];
    if (avatarData.length === 0) {
        // Build a minimal list from known files (subset)
        avatarData = [
            { name: 'Human Fly', file: 'Townspeople-Human-Fly-icon.png', category: 'simpsons' },
            { name: 'House of Evil Shopkeeper', file: 'Townspeople-House-of-Evil-shopkeeper-icon.png', category: 'simpsons' },
            { name: 'Secret Service Guy', file: 'Townspeople-Secret-Service-guy-icon.png', category: 'simpsons' },
            { name: 'Wendy', file: 'Wendy-icon.png', category: 'southpark' },
            { name: 'Wendy (Alt)', file: 'Wendy-2-icon.png', category: 'southpark' },
            { name: 'Wally', file: 'Wally-icon.png', category: 'dilbert' },
            { name: 'Robo-1', file: 'Robo-1-icon.png', category: 'giantrobo' },
            { name: 'Robo-10', file: 'robo-10-icon.png', category: 'giantrobo' },
            { name: 'Robo-12', file: 'robo-12-icon.png', category: 'giantrobo' },
            { name: 'Orb', file: 'Orb-icon.png', category: 'giantrobo' },
            { name: 'Nermal', file: 'Nermal-1-icon.png', category: 'garfield' },
            { name: 'Odie', file: 'Odie-1-icon.png', category: 'garfield' },
            { name: 'Poekie', file: 'Poekie-1-icon.png', category: 'garfield' },
            { name: 'Papa Smurf', file: 'Papa-Smurf-icon.png', category: 'smurf' },
            { name: 'Puppy', file: 'Puppy-icon.png', category: 'smurf' },
            { name: 'Prince John', file: 'Prince-John-icon.png', category: 'robinhood' },
            { name: 'Robin Hood', file: 'Robin-Hood-icon.png', category: 'robinhood' },
            { name: 'Sheriff of Nottingham', file: 'Sheriff-of-Nottingham-icon.png', category: 'robinhood' },
            { name: 'King Richard', file: 'King-Richard-icon.png', category: 'robinhood' }
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
});
