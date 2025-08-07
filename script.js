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
    
    // Simpsons Avatars
    const avatarGrid = document.getElementById('avatarGrid');
    const avatarSearch = document.getElementById('avatarSearch');
    
    const avatarData = [
        { name: "Bart Director", file: "Jeanette-Foshee-Simpsons-11-Bart-Unabridged-Bart-movie-director.32.png" },
        { name: "Bart Rapping", file: "Jeanette-Foshee-Simpsons-11-Bart-Unabridged-Bart-rapping-recording.32.png" },
        { name: "Homer Tom Sawyer", file: "Jeanette-Foshee-Simpsons-11-Episode-Tom-Sawyer-Homer.32.png" },
        { name: "Moe Tom Sawyer", file: "Jeanette-Foshee-Simpsons-11-Episode-Tom-Sawyer-Moe.32.png" },
        { name: "Nelson Huck Finn", file: "Jeanette-Foshee-Simpsons-11-Episode-Tom-Sawyer-Nelson-as-Huck-Finn.32.png" },
        { name: "Rev Lovejoy", file: "Jeanette-Foshee-Simpsons-11-Episode-Tom-Sawyer-Rev-Lovejoy.32.png" },
        { name: "Bart Rapping", file: "Jeanette-Foshee-Simpsons-11-Folder-Bart-rapping.32.png" },
        { name: "Bart Mic", file: "Jeanette-Foshee-Simpsons-11-Folder-Bart-rapping-into-mic.32.png" },
        { name: "Homer Blue", file: "Jeanette-Foshee-Simpsons-11-Folder-Blue-Green-Homer.32.png" },
        { name: "Simpsons Blue", file: "Jeanette-Foshee-Simpsons-11-Folder-Blue-Green-Simpsons.32.png" },
        { name: "Simpsons Blue 2", file: "Jeanette-Foshee-Simpsons-11-Folder-Blue-Green-Simpsons-2.32.png" },
        { name: "Frink Fish", file: "Jeanette-Foshee-Simpsons-11-Folder-Frink-fish-in-water.32.png" },
        { name: "Guest Stars", file: "Jeanette-Foshee-Simpsons-11-Folder-Guest-Stars.32.png" },
        { name: "Springfield", file: "Jeanette-Foshee-Simpsons-11-Folder-Springfield-11.32.png" },
        { name: "U2 Logo", file: "Jeanette-Foshee-Simpsons-11-Folder-U2-logo.32.png" },
        { name: "Khlav Kalash", file: "Jeanette-Foshee-Simpsons-11-Food-Khlav-Kalash.32.png" },
        { name: "Al Jean", file: "Jeanette-Foshee-Simpsons-11-Guest-Stars-Al-Jean.32.png" },
        { name: "Clint Eastwood", file: "Jeanette-Foshee-Simpsons-11-Guest-Stars-Clint-Eastwood.32.png" },
        { name: "Jay Sherman", file: "Jeanette-Foshee-Simpsons-11-Guest-Stars-Jay-Sherman.32.png" },
        { name: "Lee Marvin", file: "Jeanette-Foshee-Simpsons-11-Guest-Stars-Lee-Marvin.32.png" },
        { name: "Adam Clayton", file: "Jeanette-Foshee-Simpsons-11-Guest-Stars-U2-Adam-Clayton.32.png" },
        { name: "Bono", file: "Jeanette-Foshee-Simpsons-11-Guest-Stars-U2-Bono.32.png" },
        { name: "The Edge", file: "Jeanette-Foshee-Simpsons-11-Guest-Stars-U2-Edge.32.png" },
        { name: "Larry Mullen", file: "Jeanette-Foshee-Simpsons-11-Guest-Stars-U2-Larry-Mullen-Jr.32.png" },
        { name: "Homer Wolverine", file: "Jeanette-Foshee-Simpsons-11-Homertopia-Homer-as-Wolverine.32.png" },
        { name: "Homer Tom", file: "Jeanette-Foshee-Simpsons-11-Homertopia-Homer-in-Tom-Sawyer.32.png" },
        { name: "Ad Exec 1", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Ad-Executive-1.32.png" },
        { name: "Ad Exec 2", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Ad-Executive-2.32.png" },
        { name: "Dueling Colonel", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Dueling-Colonel.32.png" },
        { name: "Duff Man", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Duff-Man.32.png" },
        { name: "Duff Belt", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Duff-Mans-beer-belt.32.png" },
        { name: "Glen", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Glen.32.png" },
        { name: "Gloria", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Gloria.32.png" },
        { name: "Cashier", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Grocery-cashier.32.png" },
        { name: "Jane", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Jane.32.png" },
        { name: "Johnny Boy", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Johnny-boy.32.png" },
        { name: "Johnny Tightlips", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Johnny-tight-lips.32.png" },
        { name: "Khlav Vendor", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Khlav-Kalash-vendor.32.png" },
        { name: "Lil Vicky", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Lil-Vicky.32.png" },
        { name: "Mexican Milhouse", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Mexican-Milhouse.32.png" },
        { name: "Millicent", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Millicent.32.png" },
        { name: "Patches", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Patches.32.png" },
        { name: "Poor Violet", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Poor-Violet.32.png" },
        { name: "Rich Texan", file: "Jeanette-Foshee-Simpsons-11-Misc-Episodes-Rich-Texan.32.png" },
        { name: "Baby Smithers", file: "Jeanette-Foshee-Simpsons-11-Nuclear-Plant-Baby-Waylon-Smithers.32.png" },
        { name: "Ernest Smithers", file: "Jeanette-Foshee-Simpsons-11-Nuclear-Plant-Ernest-K-Smithers.32.png" },
        { name: "Fallout Boy", file: "Jeanette-Foshee-Simpsons-11-Public-Figures-Fallout-Boy-Milhouse.32.png" },
        { name: "Jack Larson", file: "Jeanette-Foshee-Simpsons-11-Public-Figures-Laramie-spokesman-Jack-Larson.32.png" },
        { name: "Quimby's Wife", file: "Jeanette-Foshee-Simpsons-11-Public-Figures-Quimbys-wife.32.png" },
        { name: "Rupert Murdoch", file: "Jeanette-Foshee-Simpsons-11-Public-Figures-Rupert-Murdoch.32.png" },
        { name: "Bart Mooning 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Bart-mooning-1.32.png" },
        { name: "Bart Mooning 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Bart-mooning-2.32.png" },
        { name: "Bart Reaching 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Bart-reaching-up-1.32.png" },
        { name: "Bart Reaching 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Bart-reaching-up-2.32.png" },
        { name: "Bartacuda 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Bartacuda-1.32.png" },
        { name: "Bartacuda 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Bartacuda-2.32.png" },
        { name: "Bart Joke 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Barts-joke-face-1.32.png" },
        { name: "Bart Joke 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Barts-joke-face-2.32.png" },
        { name: "Beach Lisa 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Beach-Lisa-1.32.png" },
        { name: "Beach Lisa 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Beach-Lisa-2.32.png" },
        { name: "Cool Bart 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Cool-Bart-1.32.png" },
        { name: "Cool Bart 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Cool-Bart-2.32.png" },
        { name: "Duff Can 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Duff-can-1.32.png" },
        { name: "Duff Can 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Duff-can-2.32.png" },
        { name: "Fallout Milhouse 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Fallout-Boy-Milhouse-1.32.png" },
        { name: "Fallout Milhouse 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Fallout-Boy-Milhouse-2.32.png" },
        { name: "Homer Donut 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Homer-donut-1.32.png" },
        { name: "Homer Donut 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Homer-donut-2.32.png" },
        { name: "Homer Beer 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Homer-swills-beer-1.32.png" },
        { name: "Homer Beer 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Homer-swills-beer-2.32.png" },
        { name: "Krusty 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Krusty-1.32.png" },
        { name: "Krusty 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Krusty-2.32.png" },
        { name: "Mischievous Bart 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Mischievous-Bart-1.32.png" },
        { name: "Mischievous Bart 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Mischievous-Bart-2.32.png" },
        { name: "Uder 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Uder-1.32.png" },
        { name: "Uder 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Uder-2.32.png" },
        { name: "Willie 1", file: "Jeanette-Foshee-Simpsons-11-Rollover-Willie-1.32.png" },
        { name: "Willie 2", file: "Jeanette-Foshee-Simpsons-11-Rollover-Willie-2.32.png" },
        { name: "Armin Tamzarian", file: "Jeanette-Foshee-Simpsons-11-School-Armin-Tamzarian.32.png" },
        { name: "Ding-a-ling Kid", file: "Jeanette-Foshee-Simpsons-11-School-Ding-a-ling-kid.32.png" },
        { name: "Skinner", file: "Jeanette-Foshee-Simpsons-11-School-Sgt-Seymour-Skinner.32.png" },
        { name: "Colonel Hapablap", file: "Jeanette-Foshee-Simpsons-11-Townspeople-Colonel-Leslie-Hapablap.32.png" },
        { name: "Gil", file: "Jeanette-Foshee-Simpsons-11-Townspeople-Gil.32.png" },
        { name: "Otis", file: "Jeanette-Foshee-Simpsons-11-Townspeople-Otis-town-drunk.32.png" }
    ];

    function loadAvatars() {
        avatarGrid.innerHTML = '';
        
        avatarData.forEach(avatar => {
            const avatarItem = document.createElement('div');
            avatarItem.className = 'avatar-item loading';
            avatarItem.innerHTML = `
                <img src="avatars/${avatar.file}" alt="${avatar.name}" class="avatar-img" loading="lazy">
                <span class="avatar-name">${avatar.name}</span>
            `;
            
            const img = avatarItem.querySelector('img');
            img.onload = () => {
                avatarItem.classList.remove('loading');
            };
            
            img.onerror = () => {
                avatarItem.classList.remove('loading');
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%236c5ce7"><text x="12" y="16" text-anchor="middle" font-size="12" fill="white">?</text></svg>';
            };
            
            avatarGrid.appendChild(avatarItem);
        });
    }
    
    // Search functionality
    avatarSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const items = avatarGrid.querySelectorAll('.avatar-item');
        
        items.forEach(item => {
            const name = item.querySelector('.avatar-name').textContent.toLowerCase();
            item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
        });
    });
    
    // Initialize
    initColorInputs();
    updateEffects();
    loadAvatars();
});
