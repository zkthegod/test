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
        
        // Pokemon
        { name: "Pikachu", file: "pokemon-pikachu.32.png", category: "pokemon" },
        { name: "Charizard", file: "pokemon-charizard.32.png", category: "pokemon" },
        { name: "Bulbasaur", file: "pokemon-bulbasaur.32.png", category: "pokemon" },
        { name: "Squirtle", file: "pokemon-squirtle.32.png", category: "pokemon" },
        { name: "Jigglypuff", file: "pokemon-jigglypuff.32.png", category: "pokemon" },
        { name: "Meowth", file: "pokemon-meowth.32.png", category: "pokemon" },
        { name: "Mewtwo", file: "pokemon-mewtwo.32.png", category: "pokemon" },
        { name: "Eevee", file: "pokemon-eevee.32.png", category: "pokemon" },
        
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
        
        // Dilbert
        { name: "Dilbert", file: "dilbert-main.32.png", category: "dilbert" },
        { name: "Dogbert", file: "dilbert-dogbert.32.png", category: "dilbert" },
        { name: "Pointy Haired Boss", file: "dilbert-boss.32.png", category: "dilbert" },
        { name: "Wally", file: "dilbert-wally.32.png", category: "dilbert" },
        
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
        
        // Garfield
        { name: "Garfield", file: "garfield-main.32.png", category: "garfield" },
        { name: "Odie", file: "garfield-odie.32.png", category: "garfield" },
        { name: "Jon", file: "garfield-jon.32.png", category: "garfield" },
        { name: "Nermal", file: "garfield-nermal.32.png", category: "garfield" },
        
        // Grimm
        { name: "Grimm", file: "grimm-main.32.png", category: "grimm" },
        { name: "Billy", file: "grimm-billy.32.png", category: "grimm" },
        { name: "Mandy", file: "grimm-mandy.32.png", category: "grimm" },
        
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
        
        // Giant Robo
        { name: "Robo", file: "giantrobo-main.32.png", category: "giantrobo" },
        { name: "Dr. Shizuma", file: "giantrobo-shizuma.32.png", category: "giantrobo" },
        { name: "GinRei", file: "giantrobo-ginrei.32.png", category: "giantrobo" },


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

    function loadAvatars(category = 'all') {
        avatarGrid.innerHTML = '';
        
        const filteredAvatars = category === 'all' 
            ? avatarData 
            : avatarData.filter(avatar => avatar.category === category);
        
        filteredAvatars.forEach(avatar => {
            const avatarItem = document.createElement('div');
            avatarItem.className = 'avatar-item loading';
            avatarItem.dataset.category = avatar.category;
            avatarItem.innerHTML = `
                <img src="avatars/${avatar.file}" alt="${avatar.name}" class="avatar-img" loading="lazy">
                <span class="avatar-name">${avatar.name}</span>
                <div class="copy-icon" title="Copy URL"><i class="fas fa-copy"></i></div>
            `;
            
            const img = avatarItem.querySelector('img');
            img.onload = () => {
                avatarItem.classList.remove('loading');
            };
            
            img.onerror = () => {
                avatarItem.classList.remove('loading');
                img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%236c5ce7"><text x="12" y="16" text-anchor="middle" font-size="12" fill="white">?</text></svg>';
            };
            
            // Add copy functionality
            const copyIcon = avatarItem.querySelector('.copy-icon');
            copyIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                const avatarUrl = `https://zkthegod.github.io/test/avatars/${avatar.file}`;
                navigator.clipboard.writeText(avatarUrl).then(() => {
                    const originalIcon = copyIcon.innerHTML;
                    copyIcon.innerHTML = '<i class="fas fa-check"></i>';
                    copyIcon.style.backgroundColor = '#2ecc71';
                    setTimeout(() => {
                        copyIcon.innerHTML = originalIcon;
                        copyIcon.style.backgroundColor = '';
                    }, 2000);
                });
            });
            
            avatarGrid.appendChild(avatarItem);
        });
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
});
