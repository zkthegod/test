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
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const chatWidthInput = document.getElementById('chatWidth');
    const chatHeightInput = document.getElementById('chatHeight');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');
    
    // Load saved settings or set defaults
    const savedSettings = JSON.parse(localStorage.getItem('chatSettings')) || {
        width: 650,
        height: 486
    };
    
    chatWidthInput.value = savedSettings.width;
    chatHeightInput.value = savedSettings.height;
    
    settingsBtn.addEventListener('click', function() {
        settingsPanel.classList.toggle('active');
    });
    
    saveSettingsBtn.addEventListener('click', function() {
        const newSettings = {
            width: parseInt(chatWidthInput.value) || 650,
            height: parseInt(chatHeightInput.value) || 486
        };
        
        localStorage.setItem('chatSettings', JSON.stringify(newSettings));
        settingsPanel.classList.remove('active');
        
        document.querySelectorAll('.embedded-chat iframe').forEach(iframe => {
            iframe.width = newSettings.width;
            iframe.height = newSettings.height;
        });
        
        const originalText = saveSettingsBtn.innerHTML;
        saveSettingsBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        setTimeout(() => {
            saveSettingsBtn.innerHTML = originalText;
        }, 2000);
    });
    
    embedChatBtn.addEventListener('click', embedChat);
    chatNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            embedChat();
        }
    });
    
    function embedChat() {
        const chatName = chatNameInput.value.trim();
        if (!chatName) {
            chatNameInput.focus();
            return;
        }
        
        const settings = JSON.parse(localStorage.getItem('chatSettings')) || {
            width: 650,
            height: 486
        };
        
        const chatId = Date.now();
        const chatWrapper = document.createElement('div');
        chatWrapper.className = 'embedded-chat';
        chatWrapper.id = `chat-${chatId}`;
        
        chatWrapper.innerHTML = `
            <button class="remove-chat" data-chat-id="${chatId}">×</button>
            <iframe src="https://xat.com/embed/chat.php#gn=${encodeURIComponent(chatName)}" 
                    width="${settings.width}" height="${settings.height}" 
                    frameborder="0" scrolling="no"></iframe>
        `;
        
        chatContainer.appendChild(chatWrapper);
        chatNameInput.value = '';
        
        setTimeout(() => {
            chatContainer.scrollTo({
                left: chatContainer.scrollWidth,
                behavior: 'smooth'
            });
        }, 100);
        
        chatWrapper.querySelector('.remove-chat').addEventListener('click', function() {
            document.getElementById(`chat-${this.getAttribute('data-chat-id')}`).remove();
        });
    }
    
    scrollLeftBtn.addEventListener('click', function() {
        chatContainer.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });
    
    scrollRightBtn.addEventListener('click', function() {
        chatContainer.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });
    
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
    const gradRotation = document.getElementById('gradRotation');
    const gradRotationValue = document.getElementById('gradRotationValue');
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
    
    [gradRotation, glowColor, waveSpeed].forEach(control => {
        control.addEventListener('input', updateEffects);
    });
    
    gradRotation.addEventListener('input', () => {
        gradRotationValue.textContent = `${gradRotation.value}°`;
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
        
        gradRotation.value = Math.floor(Math.random() * 360);
        gradRotationValue.textContent = `${gradRotation.value}°`;
        
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
        let angle = parseFloat(gradRotation.value);
        const glow = glowColor.value;
        const speed = waveSpeed.value;

        // Clamp angle between -190 and 190 (optional, can be removed)
        if (angle > 190) angle = 190;
        if (angle < -190) angle = -190;

        // Apply gradient effect
        if (colors.length > 1) {
            const totalColors = colors.length;
            const gradientStops = [];

            colors.forEach((color, i) => {
                const percent = Math.round((i / totalColors) * 100);
                gradientStops.push(`${color} ${percent}%`);
            });

            // Repeat the first color at 100% to close the loop
            gradientStops.push(`${colors[0]} 100%`);

            const gradient = `repeating-linear-gradient(${angle}deg, ${gradientStops.join(', ')})`;

            // Apply styles
            effectPreview.style.backgroundImage = gradient;
            effectPreview.style.backgroundSize = '200% 100%';
            effectPreview.style.backgroundRepeat = 'repeat-x';

            // Reset animation
            effectPreview.style.animation = 'none';
            effectPreview.classList.remove(
                'wave-normal', 'wave-slow', 'wave-very-slow',
                'wave-fast', 'wave-very-fast'
            );

            // Force reflow to restart animation
            void effectPreview.offsetWidth;

            // Reapply animation
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
            // Just one color, no animation
            effectPreview.style.background = colors[0];
            effectPreview.style.animation = 'none';
        }

        // Apply glow
        effectPreview.style.setProperty('--glow-color', glow);

        // Generate code output
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
    
    // Simpsons Avatars - Generate avatar grid
    const avatarUrls = [
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Bart-Unabridged-Bart-movie-director-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Bart-Unabridged-Bart-rapping-recording-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Episode-Tom-Sawyer-Homer-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Episode-Tom-Sawyer-Moe-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Episode-Tom-Sawyer-Nelson-as-Huck-Finn-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Episode-Tom-Sawyer-Rev-Lovejoy-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-Bart-rapping-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-Bart-rapping-into-mic-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-Blue-Green-Homer-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-Blue-Green-Simpsons-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-Blue-Green-Simpsons-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-Frink-fish-in-water-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-Guest-Stars-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-Springfield-11-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Folder-U2-logo-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Food-Khlav-Kalash-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Guest-Stars-Al-Jean-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Guest-Stars-Clint-Eastwood-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Guest-Stars-Jay-Sherman-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Guest-Stars-Lee-Marvin-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Guest-Stars-U2-Adam-Clayton-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Guest-Stars-U2-Bono-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Guest-Stars-U2-Edge-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Guest-Stars-U2-Larry-Mullen-Jr-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Homertopia-Homer-as-Wolverine-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Homertopia-Homer-in-Tom-Sawyer-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Ad-Executive-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Ad-Executive-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Dueling-Colonel-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Duff-Man-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Duff-Mans-beer-belt-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Glen-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Gloria-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Grocery-cashier-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Jane-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Johnny-boy-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Johnny-tight-lips-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Khlav-Kalash-vendor-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Lil-Vicky-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Mexican-Milhouse-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Millicent-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Patches-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Poor-Violet-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Misc-Episodes-Rich-Texan-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Nuclear-Plant-Baby-Waylon-Smithers-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Nuclear-Plant-Ernest-K-Smithers-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Public-Figures-Fallout-Boy-Milhouse-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Public-Figures-Laramie-spokesman-Jack-Larson-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Public-Figures-Quimbys-wife-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Public-Figures-Rupert-Murdoch-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Bart-mooning-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Bart-mooning-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Bart-reaching-up-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Bart-reaching-up-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Bartacuda-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Bartacuda-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Barts-joke-face-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Barts-joke-face-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Beach-Lisa-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Beach-Lisa-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Cool-Bart-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Cool-Bart-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Duff-can-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Duff-can-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Fallout-Boy-Milhouse-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Fallout-Boy-Milhouse-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Homer-donut-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Homer-donut-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Homer-swills-beer-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Homer-swills-beer-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Krusty-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Krusty-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Mischievous-Bart-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Mischievous-Bart-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Uder-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Uder-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Willie-1-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Rollover-Willie-2-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/School-Armin-Tamzarian-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/School-Ding-a-ling-kid-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/School-Sgt-Seymour-Skinner-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Townspeople-Colonel-Leslie-Hapablap-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Townspeople-Gil-icon.png',
        'https://icons.iconarchive.com/icons/jeanette-foshee/simpsons-11/32/Townspeople-Otis-town-drunk-icon.png'
    ];

    const avatarsGrid = document.querySelector('.avatars-grid');
    
    avatarUrls.forEach(url => {
        const avatarItem = document.createElement('div');
        avatarItem.className = 'avatar-item';
        avatarItem.innerHTML = `<img src="${url}" alt="Simpsons avatar">`;
        avatarsGrid.appendChild(avatarItem);
    });

    // Initialize
    initColorInputs();
    updateEffects();
});
