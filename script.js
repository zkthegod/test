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
        });
    });
    
    // Chat embedder functionality
    const embedChatBtn = document.getElementById('embedChat');
    const chatNameInput = document.getElementById('chatName');
    const chatContainer = document.getElementById('chatContainer');
    const settingsPanel = document.getElementById('settingsPanel');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const chatWidthInput = document.getElementById('chatWidth');
    const chatHeightInput = document.getElementById('chatHeight');
    const widgetLayer = document.getElementById('widgetLayer');
    const widgetMount = widgetLayer;
    const snapToggle = document.getElementById('snapToggle');
    const gridSizeInput = document.getElementById('gridSize');
    const autoArrangeBtn = document.getElementById('autoArrange');
    const resetLayoutBtn = document.getElementById('resetLayout');
    const toggleLayoutBtn = document.getElementById('toggleLayout');
    const inspectorEl = document.getElementById('widgetInspector');
    const inspTitle = document.getElementById('inspectorTitle');
    const inspMode = document.getElementById('inspectorSizeMode');
    const inspStyle = document.getElementById('inspectorStyle');
    const inspSnap = document.getElementById('inspectorSnap');
    const inspGrid = document.getElementById('inspectorGrid');
    const inspApply = document.getElementById('inspectorApply');
    const inspClose = document.getElementById('inspectorClose');
    let selectedWidget = null;
    
    // Load saved settings or set defaults
    const savedSettings = JSON.parse(localStorage.getItem('chatSettings')) || {
        width: 728,
        height: 486,
        snap: false,
        grid: 16
    };
    
    chatWidthInput.value = savedSettings.width;
    chatHeightInput.value = savedSettings.height;
    if (snapToggle) snapToggle.checked = !!savedSettings.snap;
    if (gridSizeInput) gridSizeInput.value = savedSettings.grid || 16;
    
    saveSettingsBtn.addEventListener('click', function() {
        const newSettings = {
            width: parseInt(chatWidthInput.value) || 728,
            height: parseInt(chatHeightInput.value) || 486,
            snap: !!snapToggle?.checked,
            grid: Math.max(4, Math.min(128, parseInt(gridSizeInput?.value) || 16))
        };

        localStorage.setItem('chatSettings', JSON.stringify(newSettings));
        settingsPanel.classList.remove('active');

        // Apply to all current widgets with size mode = fixed
        document.querySelectorAll('.chat-widget').forEach(widget => {
            const state = getWidgetState(widget.id);
            if (!state) return;
            if (state.sizeMode === 'fixed') {
                widget.style.width = `${newSettings.width}px`;
                widget.style.height = `${newSettings.height}px`;
                persistWidget(widget);
            }
        });

        const originalText = saveSettingsBtn.innerHTML;
        saveSettingsBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => { saveSettingsBtn.innerHTML = originalText; }, 1400);
    });
    
    embedChatBtn.addEventListener('click', embedChat);
    chatNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            embedChat();
        }
    });

    // Utilities
    function escapeHtml(str) {
        return str.replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
    }

    function getGlobalSettings() {
        const s = JSON.parse(localStorage.getItem('chatSettings')) || {};
        return { width: s.width || 728, height: s.height || 486, snap: !!s.snap, grid: s.grid || 16 };
    }

    // Drag/Resize/Snap
    function initWidget(widget, opts) {
        const header = widget.querySelector('.widget-header');
        const titleEl = widget.querySelector('.title-text');
        const closeBtn = widget.querySelector('.widget-close');
        const menuBtn = widget.querySelector('.widget-menu-toggle');
        const styleBtn = widget.querySelector('.widget-style');
        const snapBtn = widget.querySelector('.widget-snap');
        const resizeSE = widget.querySelector('.resize-handle.se');
        const resizeE = widget.querySelector('.resize-handle.e');
        const resizeS = widget.querySelector('.resize-handle.s');
        const bodyEl = widget.querySelector('.widget-body');

        const global = getGlobalSettings();
        const state = {
            id: widget.id,
            name: opts?.name || titleEl.textContent.trim(),
            x: parseInt(widget.style.left) || 100,
            y: parseInt(widget.style.top) || 100,
            w: parseInt(widget.style.width) || global.width,
            h: parseInt(widget.style.height) || global.height,
            snap: opts?.snap ?? global.snap,
            grid: opts?.grid || global.grid,
            sizeMode: 'fixed',
            style: 'default',
            accent: '#6c5ce7',
        };

        // Initialize: nothing to do here; inspector handles values

        // Close
        closeBtn.addEventListener('click', () => { widget.remove(); removeWidgetState(state.id); });

        // Menu toggle
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // open external inspector instead of inline menu
            openInspector(widget);
        });
        // no global doc listener needed for external inspector

        // Style quick cycle
        styleBtn.addEventListener('click', () => {
            const styles = ['default','glass','dark'];
            const next = styles[(styles.indexOf(state.style)+1)%styles.length];
            applyStyle(widget, next);
            state.style = next;
            persistWidget(widget, state);
            syncInspectorIfSelected(widget);
        });

        // Snap quick toggle
        snapBtn.addEventListener('click', () => {
            state.snap = !state.snap; 
            toggleGridOverlay(state.snap ? state.grid : null);
            if (state.snap) snapToGrid(widget, state);
            persistWidget(widget, state);
            syncInspectorIfSelected(widget);
        });

        // No inline menu; inspector handles changes

        // Dragging
        let dragData = null;
        function onMouseDown(e){
            if ((e.target.closest('.widget-actions'))) return;
            widget.classList.add('dragging');
            document.body.classList.add('dragging');
            dragData = { startX: e.clientX, startY: e.clientY, startLeft: state.x, startTop: state.y };
            selectWidget(widget);
            e.preventDefault();
            window.addEventListener('mousemove', onMouseMove, { passive: false });
            window.addEventListener('mouseup', onMouseUp, { passive: true, once: true });
        }
        function onMouseMove(e){
            if (!dragData) return;
            const dx = e.clientX - dragData.startX;
            const dy = e.clientY - dragData.startY;
            state.x = Math.max(0, Math.min(window.innerWidth - state.w, dragData.startLeft + dx));
            state.y = Math.max(0, Math.min(window.innerHeight - state.h, dragData.startTop + dy));
            widget.style.left = `${state.x}px`;
            widget.style.top = `${state.y}px`;
        }
        function onMouseUp(){
            widget.classList.remove('dragging');
            document.body.classList.remove('dragging');
            if (state.snap) snapToGrid(widget, state);
            persistWidget(widget, state);
            dragData = null;
            window.removeEventListener('mousemove', onMouseMove);
        }
        header.addEventListener('mousedown', onMouseDown, { passive: false });

        // Resizing
        function startResize(e, edge) {
            e.stopPropagation();
            const start = { x: e.clientX, y: e.clientY, w: state.w, h: state.h };
            const onMove = (ev) => {
                const dw = ev.clientX - start.x;
                const dh = ev.clientY - start.y;
                let newW = start.w + (edge.includes('e') ? dw : 0);
                let newH = start.h + (edge.includes('s') ? dh : 0);
                newW = Math.max(320, Math.min(window.innerWidth - state.x, newW));
                newH = Math.max(260, Math.min(window.innerHeight - state.y, newH));
                state.w = newW; state.h = newH;
                widget.style.width = `${state.w}px`;
                widget.style.height = `${state.h}px`;
                // fit body
                const headerH = header.getBoundingClientRect().height;
                const bodyH = Math.max(0, state.h - headerH);
                bodyEl.style.height = `${bodyH}px`;
                const iframe = bodyEl.querySelector('iframe');
                iframe.style.height = `${bodyH}px`;
            };
            const onEnd = () => {
                document.removeEventListener('pointermove', onMove);
                document.removeEventListener('pointerup', onEnd);
                if (state.snap) snapToGrid(widget, state);
                persistWidget(widget, state);
            };
            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onEnd, { once: true });
        }
        resizeSE.addEventListener('pointerdown', (e) => startResize(e, 'se'));
        resizeE.addEventListener('pointerdown', (e) => startResize(e, 'e'));
        resizeS.addEventListener('pointerdown', (e) => startResize(e, 's'));

        // Initial style
        applyStyle(widget, state.style);
        // Ensure body fits widget size exactly
        widget.style.width = `${state.w}px`;
        const headerH = header.getBoundingClientRect().height;
        // If a target body height provided, prefer it to avoid bottom gap
        if (opts && typeof opts.targetBodyHeight === 'number') {
            state.h = headerH + opts.targetBodyHeight;
        }
        widget.style.height = `${state.h}px`;
        const bodyH = Math.max(0, state.h - headerH);
        bodyEl.style.height = `${bodyH}px`;
        const iframe = bodyEl.querySelector('iframe');
        iframe.style.height = `${bodyH}px`;

        // Expose for persistence
        widget._state = state;
    }

    function applyStyle(widget, styleKey) {
        widget.classList.remove('style-glass','style-dark');
        if (styleKey === 'glass') widget.classList.add('style-glass');
        if (styleKey === 'dark') widget.classList.add('style-dark');
    }

    function snapToGrid(widget, state) {
        const grid = state.grid || 16;
        state.x = Math.max(0, Math.min(window.innerWidth - state.w, Math.round(state.x / grid) * grid));
        state.y = Math.max(0, Math.min(window.innerHeight - state.h, Math.round(state.y / grid) * grid));
        state.w = Math.max(320, Math.round(state.w / grid) * grid);
        state.h = Math.max(260, Math.round(state.h / grid) * grid);
        widget.style.left = `${state.x}px`;
        widget.style.top = `${state.y}px`;
        widget.style.width = `${state.w}px`;
        widget.style.height = `${state.h}px`;
        const headerH = widget.querySelector('.widget-header').getBoundingClientRect().height;
        const bodyH = Math.max(0, state.h - headerH);
        const bodyEl = widget.querySelector('.widget-body');
        bodyEl.style.height = `${bodyH}px`;
        const iframe = bodyEl.querySelector('iframe');
        iframe.style.height = `${bodyH}px`;
    }

    // Persistence
    function loadAllWidgets() {
        const list = JSON.parse(localStorage.getItem('chatWidgets') || '[]');
        list.forEach(s => {
            const widget = document.createElement('div');
            widget.className = 'chat-widget';
            widget.id = s.id;
            widget.style.left = `${s.x}px`;
            widget.style.top = `${s.y}px`;
            widget.style.width = `${s.w}px`;
            widget.style.height = `${s.h}px`;
            widget.setAttribute('role','dialog');
            widget.setAttribute('aria-label', `Chat widget for ${s.name}`);
            widget.innerHTML = `
                <div class="widget-header" aria-grabbed="false">
                    <div class="widget-title"><i class="fas fa-comments"></i> <span class="title-text">${escapeHtml(s.name)}</span></div>
                    <div class="widget-actions">
                        <button class="widget-btn widget-snap" title="Snap to grid"><i class="fas fa-border-all"></i></button>
                        <button class="widget-btn widget-style" title="Style"><i class="fas fa-brush"></i></button>
                        <button class="widget-btn widget-menu-toggle" title="Settings"><i class="fas fa-sliders-h"></i></button>
                        <button class="widget-btn widget-close" title="Close"><i class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="widget-body">
                    <iframe src="https://xat.com/embed/chat.php#gn=${encodeURIComponent(s.name)}" title="${escapeHtml(s.name)}" scrolling="no"></iframe>
                    <div class="resize-handle se" aria-hidden="true"></div>
                    <div class="resize-handle e" aria-hidden="true"></div>
                    <div class="resize-handle s" aria-hidden="true"></div>
                </div>`;
            widgetMount.appendChild(widget);
            initWidget(widget, { name: s.name, snap: s.snap, grid: s.grid });
            // Restore additional state
            if (s.sizeMode) widget._state.sizeMode = s.sizeMode;
            if (s.style) { widget._state.style = s.style; applyStyle(widget, s.style); }
            if (s.accent) { widget._state.accent = s.accent; widget.style.setProperty('--widget-accent', s.accent); }
        });
    }

    function getWidgetState(id) {
        const list = JSON.parse(localStorage.getItem('chatWidgets') || '[]');
        return list.find(x => x.id === id);
    }
    function removeWidgetState(id) {
        const list = JSON.parse(localStorage.getItem('chatWidgets') || '[]');
        const next = list.filter(x => x.id !== id);
        localStorage.setItem('chatWidgets', JSON.stringify(next));
    }
    function persistWidget(widget, overrideState) {
        const state = overrideState || widget._state;
        if (!state) return;
        const list = JSON.parse(localStorage.getItem('chatWidgets') || '[]');
        const idx = list.findIndex(x => x.id === state.id);
        const payload = { id: state.id, name: state.name, x: state.x, y: state.y, w: state.w, h: state.h, snap: !!state.snap, grid: state.grid, sizeMode: state.sizeMode, style: state.style, accent: state.accent };
        if (idx >= 0) list[idx] = payload; else list.push(payload);
        localStorage.setItem('chatWidgets', JSON.stringify(list));
    }

    // Auto arrange / Reset
    function autoArrange() {
        const widgets = Array.from(document.querySelectorAll('.chat-widget'));
        if (!widgets.length) return;
        const { grid } = getGlobalSettings();
        const columns = Math.max(1, Math.floor(window.innerWidth / (widgets[0]._state.w + grid)));
        let x = grid, y = grid, col = 0;
        widgets.forEach(w => {
            const s = w._state;
            s.x = x; s.y = y;
            w.style.left = `${s.x}px`;
            w.style.top = `${s.y}px`;
            if (s.snap) snapToGrid(w, s);
            persistWidget(w, s);
            col += 1;
            if (col >= columns) { col = 0; x = grid; y += s.h + grid; }
            else { x += s.w + grid; }
        });
    }
    function resetLayout() {
        localStorage.removeItem('chatWidgets');
        document.querySelectorAll('.chat-widget').forEach(w => w.remove());
    }
    autoArrangeBtn?.addEventListener('click', autoArrange);
    resetLayoutBtn?.addEventListener('click', resetLayout);

    // Rehydrate widgets on load
    loadAllWidgets();
    
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
    
    services.forEach(service => {
        checkServiceStatus(service);
    });
    
    setInterval(() => {
        services.forEach(service => {
            checkServiceStatus(service);
        });
    }, 5 * 60 * 1000);
    
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
    
    // Color presets
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
    
    // Initialize with 2 colors
    function initColorInputs() {
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
        
        picker.addEventListener('input', () => {
            hex.value = picker.value;
            updateEffects();
        });
        
        hex.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/i.test(hex.value) || /^#[0-9A-Fa-f]{3}$/i.test(hex.value)) {
                picker.value = hex.value;
                updateEffects();
            }
        });
        
        removeBtn.addEventListener('click', () => {
            if (gradColorsContainer.children.length > 1) {
                colorInput.remove();
                updateEffects();
            }
        });
    }
    
    addColorBtn.addEventListener('click', () => {
        if (gradColorsContainer.children.length < 6) {
            addColorInput('#00ff00');
        }
    });
    
    effectText.addEventListener('input', () => {
        const text = effectText.value;
        charCount.textContent = text.length;
        effectPreview.textContent = text || 'xat';
        updateEffects();
    });
    
    [gradDirection, glowColor, waveSpeed].forEach(control => {
        control.addEventListener('input', updateEffects);
    });
    
    glowColor.addEventListener('input', () => {
        document.querySelector('.color-picker-wrapper .color-value').textContent = glowColor.value;
        updateEffects();
    });
    
    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeOutput.textContent);
        copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyCodeBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
    
    boldToggle.addEventListener('click', function() {
        effectPreview.classList.toggle('bold');
        this.classList.toggle('active');
        updateEffects();
    });
    
    randomPresetBtn.addEventListener('click', () => {
        const randomPreset = colorPresets[Math.floor(Math.random() * colorPresets.length)];
        gradColorsContainer.innerHTML = '';
        randomPreset.forEach(color => addColorInput(color));
        
        gradDirection.value = ['90', '45', '-45'][Math.floor(Math.random() * 3)];
        
        glowColor.value = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        document.querySelector('.color-picker-wrapper .color-value').textContent = glowColor.value;
        
        const speeds = ['', 'o1', 'f1', 'f2', 'o2', 'o3'];
        waveSpeed.value = speeds[Math.floor(Math.random() * speeds.length)];
        
        updateEffects();
    });
    
    function updateEffects() {
        const colors = [];
        document.querySelectorAll('.color-picker').forEach(picker => {
            if (picker.value) {
                colors.push(picker.value);
            }
        });

        const text = effectText.value || 'xat';
        let angle = parseFloat(gradDirection.value);
        const glow = glowColor.value;
        const speed = waveSpeed.value;

        // Apply gradient effect
        if (colors.length > 1) {
            const totalColors = colors.length;
            const gradientStops = [];

            colors.forEach((color, i) => {
                const percent = Math.round((i / totalColors) * 100);
                gradientStops.push(`${color} ${percent}%`);
            });

            gradientStops.push(`${colors[0]} 100%`);

            const gradient = `repeating-linear-gradient(${angle}deg, ${gradientStops.join(', ')})`;

            effectPreview.style.backgroundImage = gradient;
            effectPreview.style.backgroundSize = '200% 100%';
            effectPreview.style.backgroundRepeat = 'repeat-x';

            effectPreview.style.animation = 'none';
            effectPreview.classList.remove(
                'wave-normal', 'wave-slow', 'wave-very-slow',
                'wave-fast', 'wave-very-fast'
            );

            void effectPreview.offsetWidth;

            if (speed) {
                const speedClass = {
                    'o1': 'wave-normal',
                    'f1': 'wave-slow',
                    'f2': 'wave-very-slow',
                    'o2': 'wave-fast',
                    'o3': 'wave-very-fast'
                }[speed];
                if (speedClass) {
                    effectPreview.classList.add(speedClass);
                }
            }
        } else if (colors.length === 1) {
            effectPreview.style.background = colors[0];
            effectPreview.style.animation = 'none';
        }

        effectPreview.style.setProperty('--glow-color', glow);

        let code = '(glow';
        code += `#${glow.replace('#', '')}`;

        if (effectPreview.classList.contains('bold')) {
            code += '#b';
        }

        if (colors.length > 1) {
            code += `#grad#r${angle}`;
            if (speed) code += `#${speed}`;
            colors.forEach(c => code += `#${c.replace('#', '')}`);
        }

        code += ')';
        codeOutput.textContent = code;
    }
    
    // Xatspace Templates - Download Code functionality
    document.querySelectorAll('.template-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const templateName = this.closest('.template-card').querySelector('h3').textContent;
            const templateCode = `<!-- ${templateName} xatspace Template -->
<div class="xatspace-template ${templateName.toLowerCase().replace(/\s+/g, '-')}">
    <!-- Your xatspace content here -->
</div>

<style>
.xatspace-template.${templateName.toLowerCase().replace(/\s+/g, '-')} {
    /* Template styles will be here */
    background: #f5f6fa;
    color: #2d3436;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 12px;
}
</style>`;
            
            navigator.clipboard.writeText(templateCode).then(() => {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            });
        });
    });
    
    // Avatars functionality
    const avatarGrid = document.getElementById('avatarGrid');
    const avatarSearch = document.getElementById('avatarSearch');
    const avatarCategories = document.querySelectorAll('.avatar-category');
    
    const avatarData = [
        // Simpsons
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

    function embedChat() {
        const chatName = chatNameInput.value.trim();
        if (!chatName) { chatNameInput.focus(); return; }

        const settings = JSON.parse(localStorage.getItem('chatSettings')) || { width: 728, height: 486, snap: false, grid: 16 };
        const widgetId = `widget-${Date.now()}`;
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.id = widgetId;
        widget.setAttribute('role', 'dialog');
        widget.setAttribute('aria-label', `Chat widget for ${chatName}`);

        widget.style.width = `${settings.width}px`;
        widget.style.height = `${settings.height}px`; // will be adjusted in init with header height
        widget.style.left = `${Math.round(window.innerWidth/2 - settings.width/2)}px`;
        widget.style.top = `${Math.round(120 + Math.random()*40)}px`;

        widget.innerHTML = `
            <div class="widget-header" aria-grabbed="false">
                <div class="widget-title"><i class="fas fa-comments"></i> <span class="title-text">${escapeHtml(chatName)}</span></div>
                <div class="widget-actions">
                    <button class="widget-btn widget-snap" title="Snap to grid"><i class="fas fa-border-all"></i></button>
                    <button class="widget-btn widget-style" title="Style"><i class="fas fa-brush"></i></button>
                    <button class="widget-btn widget-menu-toggle" title="Settings"><i class="fas fa-sliders-h"></i></button>
                    <button class="widget-btn widget-close" title="Close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="widget-body">
                <iframe src="https://xat.com/embed/chat.php#gn=${encodeURIComponent(chatName)}" title="${escapeHtml(chatName)}" scrolling="no"></iframe>
                <div class="resize-handle se" aria-hidden="true"></div>
                <div class="resize-handle e" aria-hidden="true"></div>
                <div class="resize-handle s" aria-hidden="true"></div>
            </div>
        `;

        widgetMount.appendChild(widget);
        chatNameInput.value = '';

        initWidget(widget, { name: chatName, snap: settings.snap, grid: settings.grid, targetBodyHeight: settings.height });
        persistWidget(widget);
    }
    
    // Category selection
    avatarCategories.forEach(categoryBtn => {
        categoryBtn.addEventListener('click', function() {
            document.querySelector('.avatar-category.active').classList.remove('active');
            this.classList.add('active');
            loadAvatars(this.dataset.category);
        });
    });
    
    // Search functionality
    avatarSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const currentCategory = document.querySelector('.avatar-category.active').dataset.category;
        const items = avatarGrid.querySelectorAll('.avatar-item');
        
        items.forEach(item => {
            const name = item.querySelector('.avatar-name').textContent.toLowerCase();
            const matchesCategory = currentCategory === 'all' || item.dataset.category === currentCategory;
            const matchesSearch = name.includes(searchTerm);
            
            item.style.display = (matchesCategory && matchesSearch) ? 'flex' : 'none';
        });
    });
    
    // Initialize
    initColorInputs();
    updateEffects();
    loadAvatars();

    // Grid overlay controller
    const gridOverlay = document.getElementById('gridOverlay');
    function toggleGridOverlay(grid) {
        if (!gridOverlay) return;
        if (grid && grid > 0) {
            gridOverlay.style.setProperty('--grid-size', `${grid}px`);
            gridOverlay.classList.add('active');
        } else {
            gridOverlay.classList.remove('active');
        }
    }
    // Show overlay when global snap is on
    if (snapToggle) {
        snapToggle.addEventListener('change', () => toggleGridOverlay(snapToggle.checked ? (parseInt(gridSizeInput.value)||16) : null));
    }
    if (gridSizeInput) {
        gridSizeInput.addEventListener('input', () => { if (snapToggle?.checked) toggleGridOverlay(parseInt(gridSizeInput.value)||16); });
    }
    // Initialize overlay from saved settings
    toggleGridOverlay(savedSettings.snap ? (savedSettings.grid||16) : null);

    function selectWidget(widget) {
        selectedWidget = widget;
        openInspector(widget);
    }

    function openInspector(widget) {
        if (!widget) return;
        selectedWidget = widget;
        const s = widget._state;
        inspTitle.value = s.name;
        inspMode.value = s.sizeMode;
        inspStyle.value = s.style;
        inspSnap.checked = !!s.snap;
        inspGrid.value = s.grid;
        inspectorEl.style.display = 'block';
        // ensure iframe interactive until apply pressed
        widget.querySelector('iframe').style.pointerEvents = 'auto';
    }

    function syncInspectorIfSelected(widget){
        if (selectedWidget && selectedWidget.id === widget.id) openInspector(widget);
    }

    inspApply?.addEventListener('click', () => {
        if (!selectedWidget) return;
        const s = selectedWidget._state;
        s.name = inspTitle.value.trim() || s.name;
        selectedWidget.querySelector('.title-text').textContent = s.name;
        s.sizeMode = inspMode.value;
        const nextStyle = inspStyle.value;
        applyStyle(selectedWidget, nextStyle);
        s.style = nextStyle;
        s.snap = !!inspSnap.checked;
        s.grid = Math.max(4, Math.min(128, parseInt(inspGrid.value) || s.grid));
        if (s.snap) snapToGrid(selectedWidget, s);
        persistWidget(selectedWidget, s);
    });
    inspClose?.addEventListener('click', () => { inspectorEl.style.display = 'none'; });
    toggleLayoutBtn?.addEventListener('click', () => {
        const isOpen = settingsPanel.style.display !== 'none';
        settingsPanel.style.display = isOpen ? 'none' : 'block';
        toggleLayoutBtn.setAttribute('aria-expanded', (!isOpen).toString());
    });
});
