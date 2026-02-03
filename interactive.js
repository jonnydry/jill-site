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
          <button class="terminal-close" onclick="window.terminal.hide()">×</button>
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
        if (e.key === '`' && !e.metaKey && !e.ctrlKey) {
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
    characters: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',

    init() {
      document.addEventListener('keydown', (e) => this.check(e));
    },

    check(e) {
      if (this.active) return;
      
      if (e.key === this.code[this.position]) {
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
      
      window.addEventListener('resize', () => {
        if (this.canvas) {
          this.canvas.width = window.innerWidth;
          this.canvas.height = window.innerHeight;
        }
      });
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

  // ===== INITIALIZE =====
  document.addEventListener('DOMContentLoaded', () => {
    terminal.init();
    konami.init();
    typewriter.init();
    
    // Add terminal hint to footer
    const footer = document.querySelector('footer');
    if (footer) {
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
