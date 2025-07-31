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
        
        // Update all existing chats
        document.querySelectorAll('.embedded-chat iframe').forEach(iframe => {
            iframe.width = newSettings.width;
            iframe.height = newSettings.height;
        });
    });
    
    embedChatBtn.addEventListener('click', embedChat);
    chatNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            embedChat();
        }
    });
    
    function embedChat() {
        const chatName = chatNameInput.value.trim();
        if (!chatName) return;
        
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
        
        // Add new chat to the end
        chatContainer.appendChild(chatWrapper);
        chatNameInput.value = '';
        
        // Scroll to the new chat
        chatContainer.scrollTo({
            left: chatContainer.scrollWidth,
            behavior: 'smooth'
        });
        
        // Add event listener to remove button
        chatWrapper.querySelector('.remove-chat').addEventListener('click', function() {
            document.getElementById(`chat-${this.getAttribute('data-chat-id')}`).remove();
        });
    }
    
    // Chat scrolling
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
    
    // Update fade effects based on scroll position
    chatContainer.addEventListener('scroll', updateChatFade);
    
    function updateChatFade() {
        const scrollLeft = chatContainer.scrollLeft;
        const maxScroll = chatContainer.scrollWidth - chatContainer.clientWidth;
        
        if (scrollLeft > 10) {
            chatContainer.classList.add('fade-left');
        } else {
            chatContainer.classList.remove('fade-left');
        }
        
        if (scrollLeft < maxScroll - 10) {
            chatContainer.classList.add('fade-right');
        } else {
            chatContainer.classList.remove('fade-right');
        }
    }
    
    // Status monitoring
    const services = [
        { name: 'xat', url: 'https://xat.com', element: document.getElementById('xatStatus') },
        { name: 'wiki', url: 'https://wiki.xat.com', element: document.getElementById('wikiStatus') },
        { name: 'forum', url: 'https://forum.xat.com', element: document.getElementById('forumStatus') }
    ];
    
    function checkServiceStatus(service) {
        const indicator = service.element.querySelector('.status-indicator');
        const uptimeElement = service.element.querySelector('.uptime .value');
        
        indicator.classList.remove('online', 'offline');
        indicator.classList.add('loading');
        
        // Simulate API call
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
    
    // Initial check
    services.forEach(service => {
        checkServiceStatus(service);
    });
    
    // Check every 5 minutes
    setInterval(() => {
        services.forEach(service => {
            checkServiceStatus(service);
        });
    }, 5 * 60 * 1000);
    
    // Name Effects Generator
    const effectText = document.getElementById('effectText');
    const gradColorsContainer = document.getElementById('gradColors');
    const addGradColorBtn = document.getElementById('addGradColor');
    const gradRotation = document.getElementById('gradRotation');
    const gradRotationValue = document.getElementById('gradRotationValue');
    const glowColor = document.getElementById('glowColor');
    const namewaveToggle = document.getElementById('namewaveToggle');
    const effectPreview = document.getElementById('effectPreview');
    const codeOutput = document.getElementById('codeOutput');
    const copyCodeBtn = document.getElementById('copyCode');
    
    // Default colors
    const defaultColors = ['#000000', '#ffffff'];
    
    // Add default color inputs
    defaultColors.forEach((color, index) => {
        addColorInput(color, index === defaultColors.length - 1);
    });
    
    // Add new color input
    addGradColorBtn.addEventListener('click', function() {
        if (gradColorsContainer.children.length >= 10) return;
        addColorInput('#cccccc', true);
    });
    
    function addColorInput(colorValue, isLast = false) {
        const colorId = Date.now();
        const colorInput = document.createElement('div');
        colorInput.className = 'color-input';
        colorInput.innerHTML = `
            <input type="color" value="${colorValue}" id="color-${colorId}">
            <button class="remove-color" data-color-id="${colorId}"><i class="fas fa-times"></i></button>
        `;
        
        gradColorsContainer.appendChild(colorInput);
        
        // Add event listener to color input
        colorInput.querySelector('input').addEventListener('input', updateEffects);
        
        // Add event listener to remove button
        if (!isLast) {
            colorInput.querySelector('.remove-color').addEventListener('click', function() {
                if (gradColorsContainer.children.length <= 2) return;
                gradColorsContainer.removeChild(colorInput);
                updateEffects();
            });
        } else {
            colorInput.querySelector('.remove-color').style.visibility = 'hidden';
        }
    }
    
    // Update rotation value display
    gradRotation.addEventListener('input', function() {
        gradRotationValue.textContent = `${this.value}°`;
        updateEffects();
    });
    
    // Update effects when any input changes
    effectText.addEventListener('input', updateEffects);
    glowColor.addEventListener('input', updateEffects);
    namewaveToggle.addEventListener('change', updateEffects);
    
    // Copy code button
    copyCodeBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(codeOutput.textContent).then(() => {
            const originalText = copyCodeBtn.innerHTML;
            copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyCodeBtn.innerHTML = originalText;
            }, 2000);
        });
    });
    
    // Update all effects
    function updateEffects() {
        // Get all gradient colors
        const colors = [];
        document.querySelectorAll('#gradColors input[type="color"]').forEach(input => {
            colors.push(input.value);
        });
        
        // Get other values
        const text = effectText.value || 'Sample Text';
        const rotation = gradRotation.value;
        const glow = glowColor.value;
        const wave = namewaveToggle.checked;
        
        // Update preview
        effectPreview.textContent = text;
        effectPreview.style.fontFamily = 'Arial';
        effectPreview.style.fontWeight = 'bold';
        
        // Apply gradient
        if (colors.length > 1) {
            effectPreview.style.background = `linear-gradient(${rotation}deg, ${colors.join(', ')})`;
            effectPreview.style.webkitBackgroundClip = 'text';
            effectPreview.style.backgroundClip = 'text';
            effectPreview.style.color = 'transparent';
        } else {
            effectPreview.style.background = 'none';
            effectPreview.style.color = colors[0] || '#000000';
        }
        
        // Apply glow
        effectPreview.style.textShadow = `0 0 5px ${glow}`;
        
        // Apply wave
        if (wave) {
            effectPreview.style.animation = 'wave 2s infinite ease-in-out';
        } else {
            effectPreview.style.animation = 'none';
        }
        
        // Generate code
        let code = '';
        
        if (glow !== '#0000ff') {
            code += `glow${glow}`;
        }
        
        if (colors.length > 1) {
            if (code) code += '#';
            code += `grad#r${rotation}`;
            colors.forEach(color => {
                code += `#${color.replace('#', '')}`;
            });
        }
        
        if (wave) {
            if (code) code += '#';
            code += 'wave';
        }
        
        codeOutput.textContent = code || 'No effects applied';
    }
    
    // Initial update
    updateEffects();
});
