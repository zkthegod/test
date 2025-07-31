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
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
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
    const chatWidthInput = document.getElementById('chatWidth');
    const chatHeightInput = document.getElementById('chatHeight');
    
    settingsBtn.addEventListener('click', function() {
        settingsPanel.classList.toggle('active');
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
        
        const width = chatWidthInput.value;
        const height = chatHeightInput.value;
        
        const chatId = Date.now(); // Simple unique ID for each chat
        
        const chatWrapper = document.createElement('div');
        chatWrapper.className = 'embedded-chat';
        chatWrapper.id = `chat-${chatId}`;
        
        chatWrapper.innerHTML = `
            <button class="remove-chat" data-chat-id="${chatId}">×</button>
            <iframe src="https://xat.com/embed/chat.php#gn=${encodeURIComponent(chatName)}" 
                    width="${width}" height="${height}" 
                    frameborder="0" scrolling="no"></iframe>
            <div class="chat-links">
                <small>
                    <a target="_BLANK" href="https://xat.com/web_gear/chat/embed.php?GroupName=${encodeURIComponent(chatName)}">
                        Get ${chatName} chat group
                    </a> | 
                    <a target="_BLANK" href="https://xat.com/${encodeURIComponent(chatName)}">
                        Go to ${chatName} website
                    </a>
                </small>
            </div>
        `;
        
        chatContainer.appendChild(chatWrapper);
        chatNameInput.value = '';
        
        // Add event listener to remove button
        chatWrapper.querySelector('.remove-chat').addEventListener('click', function() {
            document.getElementById(`chat-${this.getAttribute('data-chat-id')}`).remove();
        });
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
        
        // In a real implementation, you would make an actual API call here
        // This is a simulation with random results
        setTimeout(() => {
            const isOnline = Math.random() > 0.2; // 80% chance of being online
            
            indicator.classList.remove('loading');
            indicator.classList.add(isOnline ? 'online' : 'offline');
            indicator.querySelector('span').textContent = isOnline ? 'Online' : 'Offline';
            
            if (isOnline) {
                // Simulate uptime
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
});
