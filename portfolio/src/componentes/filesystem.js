// ═══════════════════════════════════════════════════
// filesystem.js — Virtual Linux Filesystem
// ═══════════════════════════════════════════════════

export const INITIAL_FILESYSTEM = {
        dirs: {
                '/': ['.bashrc', '.profile', 'about.txt', 'skills.txt', 'projects/', 'contact.txt', 'experience/', '.secret'],
                '/projects': ['README.md', 'ecommerce-api/', 'terminal-portfolio/', 'weather-app/', 'chat-realtime/'],
                '/projects/ecommerce-api': ['package.json', 'server.js', 'README.md'],
                '/projects/terminal-portfolio': ['package.json', 'src/', 'README.md'],
                '/projects/weather-app': ['index.html', 'app.js', 'style.css'],
                '/projects/chat-realtime': ['server.js', 'client.js', 'README.md'],
                '/experience': ['frontend.md', 'backend.md', 'devops.md'],
        },
        files: {
                '.bashrc': '# ~/.bashrc\nexport PS1="\\u@\\h:\\w\\$ "\nexport EDITOR=vim\nalias ll="ls -la"\nalias gs="git status"\n# Portfolio loaded successfully',
                '.profile': '# ~/.profile\n# Executed on login\necho "Welcome back, developer!"',
                '.secret': '🎮 Konami Code: ↑↑↓↓←→←→BA\n🐛 Has encontrado el archivo secreto!\n💡 Prueba el comando "matrix" para un easter egg.',
                'about.txt': `  SOBRE MI
  ========

  Soy un Desarrollador Fullstack apasionado
  por crear soluciones eficientes y elegantes.

  * 1 ano de experiencia
  * Enfoque en clean code
  * Apasionado por DevOps & Cloud, IA y Big Data`,
                'skills.txt': `TECHNICAL SKILLS
================

[Frontend]
  |-- React / Next.js      #################### 95%
  |-- Vue.js               ################.... 80%
  |-- JavaScript           #################### 90%
  |-- Tailwind / CSS       #################### 92%
  \`-- HTML5                #################### 98%

[Backend]
  |-- Node.js / Express    #################### 90%
  |-- Python / Django      ################.... 80%
  |-- PostgreSQL           ################.... 85%
  |-- MongoDB              ################.... 82%
  \`-- REST / GraphQL       #################### 88%

[DevOps]
  |-- Docker               ################.... 85%
  |-- Git / GitHub         #################### 95%
  |-- CI/CD                ############........ 75%
  \`-- Linux                ################.... 80%`,
                'contact.txt': `  CONTACTO
  ========

  Email:    antoniomirdev@gmail.com
  GitHub:   github.com/AntonioMirG
  LinkedIn: www.linkedin.com/in/antonio-mir-perez-1aa624309`,
                '/projects/README.md': '# Mis Proyectos\nColección de proyectos personales y profesionales.\nUsa `cd <proyecto>` y `cat README.md` para más info.',
                '/projects/ecommerce-api/package.json': '{\n  "name": "ecommerce-api",\n  "version": "2.1.0",\n  "main": "server.js",\n  "dependencies": {\n    "express": "^4.18",\n    "mongoose": "^7.0",\n    "jsonwebtoken": "^9.0"\n  }\n}',
                '/projects/ecommerce-api/server.js': '// Express REST API\nconst express = require("express");\nconst app = express();\n// ... 2400 lines of clean code',
                '/projects/ecommerce-api/README.md': `# 🛒 E-Commerce API
━━━━━━━━━━━━━━━━━━
API REST completa para tienda online.

Tech: Node.js, Express, MongoDB, JWT
Features: Auth, CRUD productos, carrito, pagos con Stripe
Estado: ✅ En producción`,
                '/projects/terminal-portfolio/package.json': '{\n  "name": "terminal-portfolio",\n  "version": "2.0.0",\n  "dependencies": {\n    "react": "^19.0",\n    "vite": "^8.0"\n  }\n}',
                '/projects/terminal-portfolio/README.md': `# 💻 Terminal Portfolio
━━━━━━━━━━━━━━━━━━━━━━
¡Este proyecto! Portfolio interactivo con interfaz de terminal.

Tech: React, Vite, CSS
Features: Filesystem virtual, comandos Linux, temas
Estado: ✅ Live`,
                '/projects/weather-app/README.md': `# 🌤️ Weather App
━━━━━━━━━━━━━━━━
App del clima con geolocalización.

Tech: Vanilla JS, OpenWeather API, CSS
Features: Geolocation, forecast 5 días, modo oscuro
Estado: ✅ Completado`,
                '/projects/chat-realtime/README.md': `# 💬 Chat Realtime
━━━━━━━━━━━━━━━━━━
Chat en tiempo real con WebSockets.

Tech: Node.js, Socket.io, React
Features: Rooms, typing indicator, emojis
Estado: 🔧 En desarrollo`,
                '/experience/frontend.md': `# Frontend Experience
━━━━━━━━━━━━━━━━━━━━
• React/Next.js - Aplicaciones SPA y SSR
• Vue.js - Dashboards interactivos
• TypeScript - Tipado fuerte en todos los proyectos
• Tailwind CSS - Diseño responsive pixel-perfect`,
                '/experience/backend.md': `# Backend Experience
━━━━━━━━━━━━━━━━━━━
• Node.js/Express - APIs RESTful escalables
• Python/Django - Microservicios y scripts
• PostgreSQL/MongoDB - Diseño de bases de datos
• GraphQL - APIs flexibles y eficientes`,
                '/experience/devops.md': `# DevOps Experience
━━━━━━━━━━━━━━━━━━
• Docker - Contenedores para desarrollo y producción
• GitHub Actions - CI/CD pipelines
• Nginx - Reverse proxy y load balancing
• Linux - Administración de servidores`,
        }
};

export const THEMES = {
        matrix: { bg: '#0c0c0c', text: '#00ff41', prompt: '#00d9ff', name: 'Matrix' },
        dracula: { bg: '#282a36', text: '#f8f8f2', prompt: '#50fa7b', name: 'Dracula' },
        monokai: { bg: '#272822', text: '#f8f8f2', prompt: '#a6e22e', name: 'Monokai' },
        nord: { bg: '#2e3440', text: '#d8dee9', prompt: '#88c0d0', name: 'Nord' },
        solarized: { bg: '#002b36', text: '#839496', prompt: '#859900', name: 'Solarized' },
        ubuntu: { bg: '#300a24', text: '#eeeeec', prompt: '#4e9a06', name: 'Ubuntu' },
        light: { bg: '#fafafa', text: '#383a42', prompt: '#0184bc', name: 'Light' },
};

export const WELCOME_ASCII = `
  PORTFOLIO TERMINAL v2.0
  =======================
  Bienvenido al entorno de desarrollo de Antonio Mir.`;

export const NEOFETCH_ASCII = `
        .-/+oossssoo+/-.
    \`:+ssssssssssssssssss+:\`
  -+ssssssssssssssssssyyssss+-
.osssssssssssssssssssdMMMNysssso.
/ssssssssssshdmmNNmmyNMMMMhssssss/
+ssssssssshmydMMMMMMMNddddyssssss+
/sssssssshNMMMyhhyyyyhmNMMMNhssssss/
.ssssssssdMMMNhsssssssssshNMMMdssssss.
+sssshhhyNMMNyssssssssssssyNMMMysssss+
ossyNMMMNyMMhsssssssssssssshmmmhssssso
ossyNMMMNyMMhsssssssssssssshmmmhssssso
+sssshhhyNMMNyssssssssssssyNMMMysssss+
.ssssssssdMMMNhsssssssssshNMMMdssssss.
/sssssssshNMMMyhhyyyyhdNMMMNhssssss/
+sssssssssdmydMMMMMMMMddddyssssss+
/ssssssssssshdmNNNNmyNMMMMhssssss/
.osssssssssssssssssssdMMMNysssso.
  -+sssssssssssssssssyyyssss+-
    \`:+ssssssssssssssssss+:\`
        .-/+oossssoo+/-.`;

export const startTime = Date.now();

export const resolvePath = (current, target) => {
        if (!target || target === '.') return current;
        if (target === '/') return '/';
        if (target === '..') {
                if (current === '/') return '/';
                const parts = current.split('/').filter(Boolean);
                parts.pop();
                return '/' + parts.join('/');
        }
        if (target.startsWith('/')) return target.replace(/\/$/, '') || '/';
        const currentPath = current === '/' ? '' : current;
        return `${currentPath}/${target.replace(/\/$/, '')}`;
};

export const lsOutput = (files) => ({
        type: 'component',
        component: 'ls',
        data: files.map(f => ({
                name: f,
                isDir: f.endsWith('/'),
                isExec: f.startsWith('.') && !f.endsWith('/'),
                isHidden: f.startsWith('.')
        }))
});
