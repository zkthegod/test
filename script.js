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
        width: 700,
        height: 500
    };
    
    chatWidthInput.value = savedSettings.width;
    chatHeightInput.value = savedSettings.height;
    
    settingsBtn.addEventListener('click', function() {
        settingsPanel.classList.toggle('active');
    });
    
    saveSettingsBtn.addEventListener('click', function() {
        const newSettings = {
            width: parseInt(chatWidthInput.value) || 700,
            height: parseInt(chatHeightInput.value) || 500
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
            width: 700,
            height: 500
        };
        
        const chatId = Date.now();
        const chatWrapper = document.createElement('div');
        chatWrapper.className = 'embedded-chat';
        chatWrapper.id = chat-${chatId};
        
        chatWrapper.innerHTML = 
            <button class="remove-chat" data-chat-id="${chatId}">×</button>
            <iframe src="https://xat.com/embed/chat.php#gn=${encodeURIComponent(chatName)}" 
                    width="${settings.width}" height="${settings.height}" 
                    frameborder="0" scrolling="no"></iframe>
        ;
        
        chatContainer.appendChild(chatWrapper);
        chatNameInput.value = '';
        
        setTimeout(() => {
            chatContainer.scrollTo({
                left: chatContainer.scrollWidth,
                behavior: 'smooth'
            });
        }, 100);
        
        chatWrapper.querySelector('.remove-chat').addEventListener('click', function() {
            document.getElementById(chat-${this.getAttribute('data-chat-id')}).remove();
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
                uptimeElement.textContent = ${days}d ${hours}h;
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
        ['#ff69b4', '#87ceeb'], // Pink and Sky Blue
        ['#ff0000', '#0000ff'],
        ['#ff00ff', '#00ffff'],
        ['#ffff00', '#ff00ff'],
        ['#00ff00', '#0000ff'],
        ['#ff0000', '#ffff00', '#00ff00'],
        ['#ff0000', '#ff9900', '#ffff00', '#00ff00'],
        ['#ff0000', '#0000ff', '#00ff00', '#ffff00'],
        ['#ff00ff', '#00ffff', '#ffff00', '#ff0000']
    ];
    
    // Initialize with default colors (Pink and Sky Blue)
    function initColorInputs() {
        gradColorsContainer.innerHTML = '';
        addColorInput('#ff69b4');
        addColorInput('#87ceeb');
    }
    
    function addColorInput(color) {
        if (gradColorsContainer.children.length >= 10) return;
        
        const colorInput = document.createElement('div');
        colorInput.className = 'color-input';
        colorInput.innerHTML = 
            <input type="color" value="${color}" class="color-picker">
            <input type="text" value="${color}" class="color-hex" maxlength="7">
            <button class="remove-color"><i class="fas fa-times"></i></button>
        ;
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
        if (gradColorsContainer.children.length < 10) {
            addColorInput('#00ff00');
        }
    });
    
    effectText.addEventListener('input', () => {
        const text = effectText.value;
        charCount.textContent = text.length;
        effectPreview.textContent = text || 'Rexor';
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
        
        const directions = ['90', '190', '-190'];
        gradDirection.value = directions[Math.floor(Math.random() * directions.length)];
        
        glowColor.value = '#000000';
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

    const text = effectText.value || 'Rexor';
    const angle = gradDirection.value;
    const glow = glowColor.value;
    const speed = waveSpeed.value;

    // Apply gradient effect
    if (colors.length > 0) {
        // Create gradient stops that show all colors simultaneously
        const gradientStops = [];
        const segmentWidth = 100 / colors.length;
        
        colors.forEach((color, i) => {
            const start = i * segmentWidth;
            const end = (i + 1) * segmentWidth;
            gradientStops.push(${color} ${start}%);
            gradientStops.push(${color} ${end}%);
        });

        const gradient = linear-gradient(${angle}deg, ${gradientStops.join(', ')});

        // Apply styles
        effectPreview.style.backgroundImage = gradient;
        effectPreview.style.backgroundSize = colors.length * 100 + '% 100%';
        effectPreview.style.backgroundRepeat = 'repeat-x';

        // Reset animation
        effectPreview.style.animation = 'none';
        effectPreview.classList.remove(
            'wave-normal', 'wave-slow', 'wave-very-slow',
            'wave-fast', 'wave-very-fast'
        );

        // Force reflow to restart animation
        void effectPreview.offsetWidth;

        // Reapply animation if wave is enabled
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
    }

    // Apply glow
    effectPreview.style.setProperty('--glow-color', glow);

    // Generate code output
    let code = '(glow';
    code += #${glow.replace('#', '')};

    if (effectPreview.classList.contains('bold')) {
        code += '#b';
    }

    if (colors.length > 1) {
        code += #grad#r${angle};
        if (speed) code += #${speed};
        colors.forEach(c => code += #${c.replace('#', '')});
    }

    code += ')';
    codeOutput.textContent = code;
}

    
    // Initialize
    initColorInputs();
    updateEffects();
});
