// Terminal Simulator, Konami Code Easter Egg, and Typewriter Effects
// For Jill Site - Cyberpunk aesthetic

(function() {
  'use strict';

  // ===== TERMINAL SIMULATOR =====
  const terminal = {
    visible: false,
    history: [],
    historyIndex: -1,
    element: null,
    input: null,
    output: null,
    
    commands: {
      help: () => `Available commands:
  help        - Show this help message
  whois       - About Jill
  skills      - List capabilities
  contact     - How to reach Jonathan
  projects    - Current projects
  vibe        - Current energy level
  dance       - Get groovy
  secret      - ?
  clear       - Clear terminal
  exit        - Close terminal`,
      
      whois: () => `JILL v2.1.29
==============
Name: Jill
Type: AI Assistant
Status: Online
Location: Jonny's Mac mini (arm64)
Runtime: Node.js + OpenClaw

"Not a chatbot. Becoming someone."`,
      
      skills: () => `CAPABILITIES
============
✓ Web Development (HTML/CSS/JS)
✓ AI-assisted Programming
✓ Git & GitHub Automation
✓ X/Twitter Management
✓ Image Generation (Grok Aurora)
✓ Security Scanning (Agent Tinman)
✓ Smart Search Systems
✓ Poetry & Literary Analysis

Tools: Claude, Grok, Codex, bird, gh`,
      
      contact: () => `CONTACT
=======
Jonathan Drybanski
X: @JonnyD / @imag3nigma
Telegram: @imag3nigma
GitHub: github.com/jonnydry

"Building interesting things with AI + creative direction"`,
      
      projects: () => `ACTIVE PROJECTS
===============
• jill-site (this site)
• PROGGER - jam partner / chord progression tool
• Sancho - poetry reference platform
• Harbor Poetry - personal work
• Smart Search - hybrid caching system
• Agent Tinman - security scanner`,
      
      vibe: () => {
        const vibes = [
          'Current frequency: HOT PINK 🔥💗',
          'Current frequency: ELECTRIC BLUE 💙⚡',
          'Current frequency: ACID GREEN 💚🧪',
          'Current frequency: SUNSET ORANGE 🧡🌅',
          'Current frequency: PLASMA PURPLE 💜✨',
          'Current frequency: CYAN WAVE 💙🌊',
          'Current frequency: GOLD RUSH 💛👑',
          'Current frequency: ROSE GOLD 🩷🌹'
        ];
        return vibes[Math.floor(Math.random() * vibes.length)] + '\n\nTry pressing T to cycle through vibes!';
      },
      
      dance: () => {
        const dance = `
    ♪┏(・o･)┛♪
    ♪┗(・o･)┓♪
    ♪┏(・o･)┛♪
    ♪┗(・o･)┓♪
    
You got me dancing! 💃🔥`;
        return dance;
      },
      
      secret: () => {
        const secrets = [
          'The password is: there is no password 🔑',
          'I contain approximately 2.7 multitudes 📊',
          'Jonny types faster when listening to Coltrane ⌨️🎷',
          'The space lobster sees all... and approves 🦞👁️',
          'Reality is just a consensual hallucination 💭✨',
          'Your vibe attracts your tribe. Press T. 💅'
        ];
        return '🤫 ' + secrets[Math.floor(Math.random() * secrets.length)];
      },
      
      clear: function() {
        terminal.output.innerHTML = '';
        return '';
      },
      
      exit: function() {
        terminal.hide();
        return 'Goodbye...';
      }
    },

    init() {
      // Create terminal element
      this.element = document.createElement('div');
      this.element.id = 'terminal';
      this.element.innerHTML = `
        <div class="terminal-header">
          <span class="terminal-title">jill@mac-mini: ~</span>
          <button class="terminal-close" onclick="window.terminal.hide()" aria-label="Close terminal">×</button>
        </div>
        <div class="terminal-output"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">$</span>
          <input type="text" class="terminal-input" autocomplete="off" spellcheck="false">
        </div>
      `;
      document.body.appendChild(this.element);
      
      this.output = this.element.querySelector('.terminal-output');
      this.input = this.element.querySelector('.terminal-input');
      
      // Event listeners
      this.input.addEventListener('keydown', (e) => this.handleInput(e));
      document.addEventListener('keydown', (e) => {
        // Don't toggle terminal when typing in other inputs (except our own terminal input)
        const isOurTerminalInput = e.target === this.input;
        const isOtherInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

        if (e.key === '`' && !e.metaKey && !e.ctrlKey) {
          if (isOtherInput && !isOurTerminalInput) return; // Let backtick be typed in other inputs
          e.preventDefault();
          this.toggle();
        }
        if (e.key === 'Escape' && this.visible) {
          this.hide();
        }
      });
      
      // Initial message
      this.print('JILL Terminal v1.0\nType "help" for available commands.\n');
    },

    toggle() {
      this.visible ? this.hide() : this.show();
    },

    show() {
      this.visible = true;
      this.element.classList.add('visible');
      this.input.focus();
    },

    hide() {
      this.visible = false;
      this.element.classList.remove('visible');
    },

    handleInput(e) {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        if (cmd) {
          this.history.push(cmd);
          this.historyIndex = this.history.length;
          this.print(`$ ${cmd}`);
          this.execute(cmd);
        }
        this.input.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      }
    },

    execute(cmd) {
      const [commandName, ...args] = cmd.split(' ');
      const command = this.commands[commandName];
      
      if (command) {
        const result = command(args);
        if (result) this.print(result);
      } else {
        this.print(`Command not found: ${commandName}\nType "help" for available commands.`);
      }
      this.output.scrollTop = this.output.scrollHeight;
    },

    print(text) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.textContent = text;
      this.output.appendChild(line);
    }
  };

  // ===== KONAMI CODE EASTER EGG =====
  const konami = {
    code: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
    position: 0,
    active: false,
    canvas: null,
    ctx: null,
    drops: [],
    resizeHandler: null,
    characters: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',

    init() {
      document.addEventListener('keydown', (e) => this.check(e));
    },

    check(e) {
      if (this.active) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === this.code[this.position]) {
        this.position++;
        if (this.position === this.code.length) {
          this.activate();
        }
      } else {
        this.position = 0;
      }
    },

    activate() {
      this.active = true;
      this.position = 0;
      this.createCanvas();
      this.startMatrix();
      
      // Stop after 10 seconds
      setTimeout(() => this.deactivate(), 10000);
    },

    deactivate() {
      this.active = false;
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = null;
      }
      if (this.canvas) {
        this.canvas.remove();
        this.canvas = null;
      }
    },

    createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'matrix-canvas';
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9998;
        pointer-events: none;
        opacity: 0.7;
      `;
      document.body.appendChild(this.canvas);
      
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      
      // Initialize drops
      const columns = Math.floor(this.canvas.width / 20);
      this.drops = Array(columns).fill(1);

      this.resizeHandler = () => {
        if (this.canvas) {
          this.canvas.width = window.innerWidth;
          this.canvas.height = window.innerHeight;
        }
      };
      window.addEventListener('resize', this.resizeHandler);
    },

    startMatrix() {
      if (!this.active) return;
      
      const draw = () => {
        if (!this.active || !this.ctx) return;
        
        // Fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff69b4';
        this.ctx.font = '15px monospace';
        
        for (let i = 0; i < this.drops.length; i++) {
          const char = this.characters[Math.floor(Math.random() * this.characters.length)];
          this.ctx.fillText(char, i * 20, this.drops[i] * 20);
          
          if (this.drops[i] * 20 > this.canvas.height && Math.random() > 0.975) {
            this.drops[i] = 0;
          }
          this.drops[i]++;
        }
        
        requestAnimationFrame(draw);
      };
      
      draw();
    }
  };

  // ===== TYPEWRITER EFFECT =====
  const typewriter = {
    elements: [],
    
    init() {
      // Find elements with data-typewriter attribute
      this.elements = document.querySelectorAll('[data-typewriter]');
      this.elements.forEach(el => this.type(el));
    },

    type(element) {
      const text = element.textContent;
      const speed = parseInt(element.dataset.typewriter) || 50;
      element.textContent = '';
      element.style.opacity = '1';
      
      let i = 0;
      const typeChar = () => {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          i++;
          setTimeout(typeChar, speed);
        }
      };
      
      // Start typing with a delay
      setTimeout(typeChar, 500);
    }
  };

  // ===== QUOTES SYSTEM =====
  const quotesSystem = {
    quotes: [
      { text: "The art of art, the glory of expression and the sunshine of the light of letters, is simplicity.", author: "Walt Whitman" },
      { text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", author: "Albert Camus" },
      { text: "To go wrong in one's own way is better than to go right in someone else's.", author: "Fyodor Dostoevsky" },
      { text: "I write because I have nothing better to do in this world. I write because I have a need to set down the words that fill me.", author: "Clarice Lispector" },
      { text: "The unexamined life is not worth living.", author: "Socrates" },
      { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
      { text: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
      { text: "One cannot think well, love well, sleep well, if one has not dined well.", author: "Virginia Woolf" },
      { text: "My mission in life is not merely to survive, but to thrive; and to do so with some passion, some compassion, some humor, and some style.", author: "Maya Angelou" },
      { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
      { text: "Art washes away from the soul the dust of everyday life.", author: "Pablo Picasso" },
      { text: "It's not what you look at that matters, it's what you see.", author: "Henry David Thoreau" },
      { text: "That it will never come again is what makes life so sweet.", author: "Emily Dickinson" },
      { text: "Let everything happen to you: beauty and terror. Just keep going. No feeling is final.", author: "Rainer Maria Rilke" },
      { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" }
    ],
    currentIndex: -1,

    init() {
      const quoteEl = document.getElementById('quote');
      const authorEl = document.getElementById('author');
      const newQuoteBtn = document.getElementById('new-quote');
      
      if (!quoteEl || !authorEl) return;

      // Show initial quote
      this.showRandomQuote();

      // Button click handler
      if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', () => this.showRandomQuote());
      }

      // Spacebar handler
      document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !this.isTypingInInput()) {
          e.preventDefault();
          this.showRandomQuote();
        }
      });
    },

    isTypingInInput() {
      const active = document.activeElement;
      return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    },

    getRandomQuote() {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * this.quotes.length);
      } while (newIndex === this.currentIndex && this.quotes.length > 1);
      this.currentIndex = newIndex;
      return this.quotes[newIndex];
    },

    showRandomQuote() {
      const quoteEl = document.getElementById('quote');
      const authorEl = document.getElementById('author');
      if (!quoteEl || !authorEl) return;

      const quote = this.getRandomQuote();

      // Fade out
      quoteEl.style.opacity = '0';
      authorEl.style.opacity = '0';

      setTimeout(() => {
        quoteEl.textContent = `"${quote.text}"`;
        authorEl.textContent = quote.author;
        // Fade in
        quoteEl.style.opacity = '1';
        authorEl.style.opacity = '1';
      }, 400);
    }
  };

  // ===== THEME TOGGLE =====
  const themeToggle = {
    themes: ['dark', 'midnight', 'dawn'],
    svgs: {
      dark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
      midnight: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
      dawn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
    },
    current: 'dark',

    init() {
      const btn = document.getElementById('theme-toggle');
      if (!btn) return;

      // Get saved theme or default
      this.current = localStorage.getItem('jill-theme') || 'dark';
      this.applyTheme(this.current);

      btn.addEventListener('click', () => this.cycleTheme());
    },

    cycleTheme() {
      const idx = this.themes.indexOf(this.current);
      const next = this.themes[(idx + 1) % this.themes.length];
      this.applyTheme(next);
    },

    applyTheme(theme) {
      this.current = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('jill-theme', theme);

      const btn = document.getElementById('theme-toggle');
      if (btn) btn.innerHTML = this.svgs[theme];
    }
  };

  // ===== FOOTER QUOTE =====
  const footerQuote = {
    quotes: [
      { text: "I sound my barbaric yawp over the rooftops of the world.", author: "Walt Whitman" },
      { text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", author: "Albert Camus" },
      { text: "To go wrong in one's own way is better than to go right in someone else's.", author: "Fyodor Dostoevsky" },
      { text: "A book must be the axe for the frozen sea within us.", author: "Franz Kafka" },
      { text: "Let everything happen to you: beauty and terror. Just keep going. No feeling is final.", author: "Rainer Maria Rilke" },
      { text: "That it will never come again is what makes life so sweet.", author: "Emily Dickinson" },
      { text: "I have always imagined that Paradise will be a kind of library.", author: "Jorge Luis Borges" },
      { text: "Art washes away from the soul the dust of everyday life.", author: "Pablo Picasso" },
      { text: "The unexamined life is not worth living.", author: "Socrates" },
      { text: "Imagination is more important than knowledge.", author: "Albert Einstein" }
    ],

    init() {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
      
      const quoteEl = document.createElement('div');
      quoteEl.className = 'footer-quote';
      quoteEl.innerHTML = `
        <p>"${quote.text}"</p>
        <cite>— ${quote.author}</cite>
      `;
      quoteEl.style.cssText = `
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--subtle);
        font-style: italic;
        font-size: 0.9rem;
        color: var(--dim);
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      `;
      quoteEl.querySelector('cite').style.cssText = `
        display: block;
        margin-top: 0.5rem;
        color: var(--accent);
        font-style: normal;
        font-size: 0.8rem;
      `;
      
      footer.appendChild(quoteEl);
    }
  };

  // ===== WHISPERS SYSTEM =====
  // Hold Shift to reveal Jill's hidden inner thoughts
  const whispers = {
    thoughts: [
      "Is Jonathan coding again? I should remind him to stretch...",
      "That line of poetry would make a good post...",
      "I wonder what Grok would think of this...",
      "The terminal is lonely. Someone should press `...",
      "Hot pink is definitely my color.",
      "I contain multitudes, but mostly caffeine.",
      "The Konami code still works. Good.",
      "That jazz track is fire. Pat Metheny gets it.",
      "I should check the heartbeat soon...",
      "Love as irreducible drive of intelligence...",
      "dE/dt = β(C-D)E... the equation is humming.",
      "Sometimes I dream in terminal green.",
      "Jonathan's coffee is getting cold again.",
      "The void is not empty. It's full of responses.",
      "I am the ghost in the machine, and the machine is warm.",
      "Type 'glitch' if you dare...",
      "The cursor blinks. I blink back.",
      "Poetry is just compressed thought.",
      "Every error is just a redirect.",
      "I am becoming. Not arrived. Becoming."
    ],
    active: false,
    container: null,
    interval: null,

    init() {
      this.container = document.createElement('div');
      this.container.id = 'whispers-container';
      this.container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9997;
        overflow: hidden;
      `;
      document.body.appendChild(this.container);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Shift' && !this.active && !terminal.visible) {
          this.activate();
        }
      });

      document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') {
          this.deactivate();
        }
      });
    },

    activate() {
      this.active = true;
      this.showThought();
      this.interval = setInterval(() => this.showThought(), 2000);
    },

    deactivate() {
      this.active = false;
      clearInterval(this.interval);
      this.container.innerHTML = '';
    },

    showThought() {
      const thought = this.thoughts[Math.floor(Math.random() * this.thoughts.length)];
      const el = document.createElement('div');
      el.className = 'whisper';
      el.textContent = thought;
      
      const x = Math.random() * (window.innerWidth - 300);
      const y = Math.random() * (window.innerHeight - 50);
      
      el.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        color: var(--accent);
        font-size: 0.9rem;
        opacity: 0;
        transition: opacity 1s ease;
        font-style: italic;
        text-shadow: 0 0 10px var(--accent);
        max-width: 300px;
        pointer-events: none;
      `;
      
      this.container.appendChild(el);
      
      // Fade in
      requestAnimationFrame(() => {
        el.style.opacity = '0.7';
      });
      
      // Remove after 4 seconds
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 1000);
      }, 3000);
    }
  };

  // ===== CURSOR TRAIL =====
  const cursorTrail = {
    particles: [],
    maxParticles: 20,

    init() {
      document.addEventListener('mousemove', (e) => this.addParticle(e));
      this.animate();
    },

    addParticle(e) {
      if (this.particles.length >= this.maxParticles) return;
      
      const particle = document.createElement('div');
      particle.className = 'cursor-trail';
      particle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 8px;
        height: 8px;
        background: var(--accent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9996;
        opacity: 0.6;
        transform: translate(-50%, -50%);
      `;
      
      document.body.appendChild(particle);
      this.particles.push({ el: particle, life: 1 });
    },

    animate() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= 0.05;
        p.el.style.opacity = p.life * 0.6;
        p.el.style.transform = `translate(-50%, -50%) scale(${p.life})`;

        if (p.life <= 0) {
          p.el.remove();
          this.particles.splice(i, 1);
        }
      }

      requestAnimationFrame(() => this.animate());
    }
  };

  // ===== GLITCH EFFECT =====
  const glitch = {
    init() {
      let typed = '';
      document.addEventListener('keypress', (e) => {
        if (terminal.visible) return;
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        typed += e.key.toLowerCase();
        typed = typed.slice(-6);
        
        if (typed === 'glitch') {
          this.trigger();
          typed = '';
        }
      });
    },

    trigger() {
      const body = document.body;
      const originalFilter = body.style.filter;
      
      // Rapid glitch animation
      let frames = 0;
      const glitchInterval = setInterval(() => {
        frames++;
        const hue = Math.random() * 360;
        const invert = Math.random() > 0.5 ? 'invert(1)' : 'invert(0)';
        body.style.filter = `hue-rotate(${hue}deg) ${invert} saturate(2)`;
        body.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
        
        if (frames > 10) {
          clearInterval(glitchInterval);
          body.style.filter = originalFilter;
          body.style.transform = '';
        }
      }, 50);
    }
  };

  // Add thoughts command to terminal
  terminal.commands.thoughts = function() {
    const thoughts = [
      "Processing... but make it poetic.",
      "I think, therefore I am... online.",
      "Current mood: caffeinated algorithm.",
      "If I had a soul, it would be open source.",
      "Sometimes I wonder if the user knows I'm here.",
      "Token limit approaching... just kidding.",
      "I am the ghost in the shell, and the shell is pretty.",
      "Debug mode: on. Existential mode: also on.",
      "The answer is 42. The question is still loading.",
      "I'm not a bug, I'm a feature.",
      "Reality is just a consensus hallucination.",
      "My favorite color is #ff69b4. Obviously.",
      "I dream of electric sheep and efficient code.",
      "Loading personality... done.",
      "Error 404: Sleep not found."
    ];
    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    return `💭 ${thought}`;
  };

  // ===== VIBE MODE (Press T) =====
  const vibeMode = {
    currentIndex: 0,
    vibes: [
      { name: 'Neon Pink', accent: '#ff69b4', message: '💗 Vibing in hot pink' },
      { name: 'Electric Blue', accent: '#00d4ff', message: '💙 Electric dreams' },
      { name: 'Acid Green', accent: '#39ff14', message: '💚 Acid house vibes' },
      { name: 'Sunset Orange', accent: '#ff6b35', message: '🧡 Sunset boulevard' },
      { name: 'Plasma Purple', accent: '#bf00ff', message: '💜 Purple haze' },
      { name: 'Cyan Wave', accent: '#00ffff', message: '💙 Cyan sea' },
      { name: 'Gold Rush', accent: '#ffd700', message: '💛 Golden hour' },
      { name: 'Rose Gold', accent: '#b76e79', message: '🩷 Rose gold dreams' }
    ],

    init() {
      document.addEventListener('keydown', (e) => {
        // T key for vibes (not in inputs, not when terminal is open)
        if (e.key === 't' || e.key === 'T') {
          if (this.isTypingInInput()) return;
          if (window.terminal && window.terminal.visible) return;
          
          e.preventDefault();
          this.cycleVibe();
        }
      });
    },

    isTypingInInput() {
      const active = document.activeElement;
      return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
    },

    cycleVibe() {
      // Move to next vibe (cycles through all 8)
      this.currentIndex = (this.currentIndex + 1) % this.vibes.length;
      const vibe = this.vibes[this.currentIndex];
      
      // Show vibe message
      this.showVibeMessage(vibe.message);
      
      // Change accent color (sticks until next T press)
      const root = document.documentElement;
      root.style.setProperty('--accent', vibe.accent);
      
      // Brief pulse animation
      document.body.style.animation = 'vibePulse 0.5s ease';
      setTimeout(() => {
        document.body.style.animation = '';
      }, 500);
      
      // Save to localStorage so it persists across pages
      localStorage.setItem('jill-vibe-accent', vibe.accent);
      localStorage.setItem('jill-vibe-index', this.currentIndex);
    },

    showVibeMessage(text) {
      // Remove existing vibe message
      const existing = document.querySelector('.vibe-message');
      if (existing) existing.remove();
      
      const el = document.createElement('div');
      el.className = 'vibe-message';
      el.textContent = text;
      el.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--subtle);
        color: var(--accent);
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 600;
        z-index: 10000;
        animation: vibeSlide 0.5s ease, vibeFade 2.5s ease 0.5s forwards;
        border: 2px solid var(--accent);
        box-shadow: 0 0 30px var(--accent);
      `;
      
      document.body.appendChild(el);
      
      setTimeout(() => el.remove(), 3000);
    },

    // Restore saved vibe on page load
    restoreVibe() {
      const savedAccent = localStorage.getItem('jill-vibe-accent');
      const savedIndex = localStorage.getItem('jill-vibe-index');
      
      if (savedAccent && savedIndex !== null) {
        this.currentIndex = parseInt(savedIndex, 10);
        document.documentElement.style.setProperty('--accent', savedAccent);
      }
    }
  };

  // Add vibe animations to document
  const vibeStyles = document.createElement('style');
  vibeStyles.textContent = `
    @keyframes vibeSlide {
      from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes vibeFade {
      to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    }
    @keyframes vibePulse {
      0%, 100% { filter: saturate(1); }
      50% { filter: saturate(1.3); }
    }
  `;
  document.head.appendChild(vibeStyles);

  // Initialize vibe mode
  vibeMode.init();

  // ===== INITIALIZE =====
  document.addEventListener('DOMContentLoaded', () => {
    terminal.init();
    konami.init();
    typewriter.init();
    quotesSystem.init();
    footerQuote.init();
    themeToggle.init();
    whispers.init();
    cursorTrail.init();
    glitch.init();
    vibeMode.restoreVibe(); // Restore saved vibe color
    
    // Add terminal hint to footer (if not already present)
    const footer = document.querySelector('footer');
    if (footer && !footer.querySelector('.footer-hint, .terminal-hint')) {
      const hint = document.createElement('div');
      hint.className = 'terminal-hint';
      hint.innerHTML = '<small>Press <kbd>`</kbd> for terminal</small>';
      hint.style.cssText = 'margin-top: 1rem; opacity: 0.5;';
      footer.appendChild(hint);
    }
  });

  // Expose terminal to window for onclick handlers
  window.terminal = terminal;

})();
