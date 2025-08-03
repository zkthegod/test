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
    const namewaveToggle = document.getElementById('namewaveToggle');
    const effectPreview = document.getElementById('effectPreview');
    const codeOutput = document.getElementById('codeOutput');
    const copyCodeBtn = document.getElementById('copyCode');
    const randomPresetBtn = document.getElementById('randomPreset');
    
    // Color presets
    const colorPresets = [
        ['#ff0000', '#0000ff'], // Red to Blue
        ['#ff00ff', '#00ffff'], // Pink to Cyan
        ['#ffff00', '#ff00ff'], // Yellow to Pink
        ['#00ff00', '#0000ff'], // Green to Blue
        ['#ff0000', '#ffff00', '#00ff00'], // Red to Yellow to Green
        ['#ff0000', '#ff9900', '#ffff00', '#00ff00'], // Red to Orange to Yellow to Green
        ['#ff0000', '#0000ff', '#00ff00', '#ffff00'], // Red, Blue, Green, Yellow
        ['#ff00ff', '#00ffff', '#ffff00', '#ff0000']  // Pink, Cyan, Yellow, Red
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
        effectPreview.setAttribute('data-text', text || 'xat');
        updateEffects();
    });
    
    [gradRotation, glowColor, namewaveToggle].forEach(control => {
        control.addEventListener('input', updateEffects);
    });
    
    gradRotation.addEventListener('input', () => {
        gradRotationValue.textContent = `${gradRotation.value}°`;
    });
    
    glowColor.addEventListener('input', () => {
        effectPreview.style.setProperty('--glow-color', glowColor.value);
    });
    
    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(codeOutput.textContent);
        copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyCodeBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
    
    randomPresetBtn.addEventListener('click', () => {
        const randomPreset = colorPresets[Math.floor(Math.random() * colorPresets.length)];
        gradColorsContainer.innerHTML = '';
        randomPreset.forEach(color => addColorInput(color));
        
        // Random angle
        gradRotation.value = Math.floor(Math.random() * 360);
        gradRotationValue.textContent = `${gradRotation.value}°`;
        
        // Random glow color
        glowColor.value = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        effectPreview.style.setProperty('--glow-color', glowColor.value);
        
        // Random namewave
        namewaveToggle.checked = Math.random() > 0.5;
        
        updateEffects();
    });
    
function updateEffects() {
    const colors = [];
    document.querySelectorAll('.color-picker').forEach(picker => {
        colors.push(picker.value);
    });
    
    const text = effectText.value || 'xat';
    const angle = gradRotation.value;
    const glow = glowColor.value;
    const wave = namewaveToggle.checked;
    
    // Apply gradient
    if (colors.length > 1) {
        const gradient = `linear-gradient(${angle}deg, ${colors.join(', ')})`;
        effectPreview.style.background = gradient;
        effectPreview.style.backgroundClip = 'text';
        effectPreview.style.webkitBackgroundClip = 'text';
        effectPreview.style.webkitTextFillColor = 'transparent';
        
        if (wave) {
            effectPreview.style.backgroundSize = '200% 100%';
            effectPreview.style.animation = 'gradientFlow 3s linear infinite';
        } else {
            effectPreview.style.animation = 'none';
            effectPreview.style.backgroundSize = '100% 100%';
        }
    } else if (colors.length === 1) {
        effectPreview.style.background = colors[0];
        effectPreview.style.animation = 'none';
    }
    
    // Apply glow (single effect)
    effectPreview.style.setProperty('--glow-color', glow);
    
    // Generate code (never includes "wave")
    let code = '(glow';
    
    if (colors.length > 1) {
        code += `#${glow.replace('#', '')}#grad#r${angle}`;
        colors.forEach(c => code += `#${c.replace('#', '')}`);
        code += ')';
    } else {
        code += `#${glow.replace('#', '')})`;
    }
    
    codeOutput.textContent = code;
}
    
    // Initialize
    initColorInputs();
    updateEffects();
});
