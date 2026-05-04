import { FILESYSTEM, THEMES, NEOFETCH_ASCII } from './filesystem';

const startTime = Date.now();

function resolvePath(currentDir, target) {
    if (!target || target === '~' || target === '/') return '/';
    if (target === '..') {
        const parts = currentDir.split('/').filter(Boolean);
        parts.pop();
        return parts.length === 0 ? '/' : `/${parts.join('/')}`;
    }
    if (target.startsWith('/')) return target;
    return `${currentDir === '/' ? '' : currentDir}/${target}`;
}

function getFileContent(currentDir, name) {
    const fullKey = `${currentDir === '/' ? '' : currentDir}/${name}`;
    return FILESYSTEM.files[name] || FILESYSTEM.files[fullKey] || null;
}

function lsOutput(files) {
    return {
        type: 'component', component: 'ls',
        data: files.map(f => ({
            name: f,
            isDir: f.endsWith('/'),
            isHidden: f.startsWith('.'),
            isExec: f.endsWith('.js') || f.endsWith('.sh'),
        }))
    };
}

export function executeCommand(cmd, args, currentDir, setDir, commandHistory, setTheme, setMatrix, isMatrix) {
    const results = [];
    const out = (content, type = 'output') => results.push({ type, content });
    const html = (component, data) => results.push({ type: 'component', component, data });

    switch (cmd) {
        case 'help': {
            out(`\x1b[1mCOMANDOS DISPONIBLES\x1b[0m
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ls [dir]          Lista archivos y directorios
  cd <dir>          Cambia de directorio
  cat <archivo>     Muestra contenido de un archivo
  pwd               Muestra el directorio actual
  clear             Limpia la terminal
  whoami            Muestra el usuario actual
  hostname          Muestra el nombre del host
  date              Muestra fecha y hora
  uname [-a]        Información del sistema
  uptime            Tiempo de actividad
  echo <texto>      Imprime texto
  history           Historial de comandos
  tree [dir]        Árbol de directorios
  grep <patrón> <archivo>  Busca en archivos
  find <nombre>     Busca archivos por nombre
  wc <archivo>      Cuenta líneas/palabras/chars
  head <archivo>    Primeras líneas de un archivo
  tail <archivo>    Últimas líneas de un archivo
  man <comando>     Manual de un comando
  neofetch          Info del sistema con ASCII art
  htop              Monitor de procesos simulado
  ping <host>       Ping simulado
  curl <url>        Petición HTTP simulada
  wget <url>        Descarga simulada
  chmod             Cambiar permisos (simulado)
  sudo <cmd>        Ejecutar como root
  theme <nombre>    Cambiar tema (${Object.keys(THEMES).join(', ')})
  matrix            Easter egg
  exit              Salir (¿o no?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            break;
        }
        case 'ls': {
            const target = resolvePath(currentDir, args[0]);
            const files = FILESYSTEM.dirs[target];
            if (files) {
                if (args.includes('-la') || args.includes('-l') || args.includes('-al')) {
                    out(`total ${files.length * 4}`);
                    files.forEach(f => {
                        const isDir = f.endsWith('/');
                        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                        const size = isDir ? '4096' : `${Math.floor(Math.random() * 9000 + 1000)}`;
                        out(`${perms}  1 guest guest ${size.padStart(5)} abr 28 10:${String(Math.floor(Math.random()*59)).padStart(2,'0')} ${f}`);
                    });
                } else if (args.includes('-a')) {
                    const all = ['.', '..', ...files];
                    results.push(lsOutput(all));
                } else {
                    results.push(lsOutput(files.filter(f => !f.startsWith('.'))));
                }
            } else {
                out(`ls: no se puede acceder a '${args[0] || target}': No existe el fichero o el directorio`, 'error');
            }
            break;
        }
        case 'cd': {
            const target = resolvePath(currentDir, args[0]);
            if (FILESYSTEM.dirs[target]) { setDir(target); }
            else { out(`bash: cd: ${args[0]}: No existe el fichero o el directorio`, 'error'); }
            break;
        }
        case 'cat': {
            if (!args[0]) { out('cat: falta el operando', 'error'); break; }
            const content = getFileContent(currentDir, args[0]);
            if (content) { out(content); }
            else { out(`cat: ${args[0]}: No existe el fichero o el directorio`, 'error'); }
            break;
        }
        case 'pwd': out(currentDir === '/' ? '/home/guest' : `/home/guest${currentDir}`); break;
        case 'whoami': out('guest'); break;
        case 'hostname': out('portfolio-server'); break;
        case 'id': out('uid=1000(guest) gid=1000(guest) grupos=1000(guest),27(sudo)'); break;
        case 'date': out(new Date().toString()); break;
        case 'uname':
            if (args.includes('-a')) out('Linux portfolio-server 6.1.0-portfolio #1 SMP x86_64 GNU/Linux');
            else out('Linux');
            break;
        case 'uptime': {
            const secs = Math.floor((Date.now() - startTime) / 1000);
            const m = Math.floor(secs / 60), s = secs % 60;
            out(` ${new Date().toLocaleTimeString()} up ${m} min ${s} sec, 1 user, load average: 0.42, 0.38, 0.31`);
            break;
        }
        case 'echo': out(args.join(' ')); break;
        case 'history':
            commandHistory.forEach((c, i) => out(`  ${String(i + 1).padStart(4)}  ${c}`));
            break;
        case 'tree': {
            const target = resolvePath(currentDir, args[0]);
            const entries = FILESYSTEM.dirs[target];
            if (!entries) { out(`tree: '${args[0] || target}': No existe`, 'error'); break; }
            const pathLabel = target === '/' ? '.' : target;
            out(pathLabel);
            entries.forEach((e, i) => {
                const isLast = i === entries.length - 1;
                const prefix = isLast ? '└── ' : '├── ';
                out(`${prefix}${e}`);
                if (e.endsWith('/')) {
                    const subPath = `${target === '/' ? '' : target}/${e.replace('/', '')}`;
                    const subEntries = FILESYSTEM.dirs[subPath];
                    if (subEntries) {
                        const connector = isLast ? '    ' : '│   ';
                        subEntries.forEach((se, si) => {
                            const subPrefix = si === subEntries.length - 1 ? '└── ' : '├── ';
                            out(`${connector}${subPrefix}${se}`);
                        });
                    }
                }
            });
            const dirCount = entries.filter(e => e.endsWith('/')).length;
            const fileCount = entries.length - dirCount;
            out(`\n${dirCount} directories, ${fileCount} files`);
            break;
        }
        case 'grep': {
            if (args.length < 2) { out('Uso: grep <patrón> <archivo>', 'error'); break; }
            const [pattern, file] = [args[0], args[1]];
            const content = getFileContent(currentDir, file);
            if (!content) { out(`grep: ${file}: No existe`, 'error'); break; }
            const matches = content.split('\n').filter(l => l.toLowerCase().includes(pattern.toLowerCase()));
            if (matches.length === 0) out('(sin resultados)');
            else matches.forEach(m => out(m));
            break;
        }
        case 'find': {
            if (!args[0]) { out('Uso: find <nombre>', 'error'); break; }
            const q = args[0].toLowerCase();
            const found = [];
            Object.keys(FILESYSTEM.dirs).forEach(dir => {
                FILESYSTEM.dirs[dir].forEach(f => {
                    if (f.toLowerCase().includes(q)) found.push(`${dir === '/' ? '' : dir}/${f}`);
                });
            });
            if (found.length) found.forEach(f => out(f));
            else out(`find: '${args[0]}': No se encontraron resultados`, 'error');
            break;
        }
        case 'wc': {
            if (!args[0]) { out('Uso: wc <archivo>', 'error'); break; }
            const content = getFileContent(currentDir, args[0]);
            if (!content) { out(`wc: ${args[0]}: No existe`, 'error'); break; }
            const lines = content.split('\n').length;
            const words = content.split(/\s+/).filter(Boolean).length;
            out(`  ${lines}  ${words}  ${content.length} ${args[0]}`);
            break;
        }
        case 'head': {
            if (!args[0]) { out('Uso: head <archivo>', 'error'); break; }
            const content = getFileContent(currentDir, args[0]);
            if (!content) { out(`head: ${args[0]}: No existe`, 'error'); break; }
            content.split('\n').slice(0, 10).forEach(l => out(l));
            break;
        }
        case 'tail': {
            if (!args[0]) { out('Uso: tail <archivo>', 'error'); break; }
            const content = getFileContent(currentDir, args[0]);
            if (!content) { out(`tail: ${args[0]}: No existe`, 'error'); break; }
            content.split('\n').slice(-10).forEach(l => out(l));
            break;
        }
        case 'man': {
            const c = args[0];
            if (!c) { out('¿Qué página del manual deseas?', 'error'); break; }
            const manPages = {
                ls: 'ls - lista el contenido de un directorio\n\nSINOPSIS: ls [-la] [directorio]\n\nOPCIONES:\n  -l  formato largo\n  -a  incluir ocultos',
                cd: 'cd - cambia el directorio de trabajo\n\nSINOPSIS: cd [directorio]\n\nUsa ".." para subir un nivel.',
                cat: 'cat - concatena y muestra archivos\n\nSINOPSIS: cat <archivo>',
                grep: 'grep - busca patrones en archivos\n\nSINOPSIS: grep <patrón> <archivo>',
            };
            out(manPages[c] || `No hay entrada de manual para ${c}`);
            break;
        }
        case 'neofetch': {
            html('neofetch', {
                ascii: NEOFETCH_ASCII,
                info: [
                    ['guest@portfolio', null],
                    [null, '─────────────────'],
                    ['OS', 'Portfolio Linux x86_64'],
                    ['Host', 'React 19.2 / Vite 8.0'],
                    ['Kernel', '6.1.0-portfolio'],
                    ['Uptime', `${Math.floor((Date.now() - startTime) / 60000)} mins`],
                    ['Shell', 'bash 5.2.15'],
                    ['Terminal', 'portfolio-term v2.0'],
                    ['CPU', 'JavaScript V8 Engine'],
                    ['Memory', '128MB / 256MB'],
                    ['Theme', 'Matrix [dark]'],
                    ['Icons', 'Unicode Emoji'],
                ]
            });
            break;
        }
        case 'htop': {
            html('htop', {
                procs: [
                    { pid: 1, user: 'root', cpu: 0.3, mem: 1.2, cmd: '/sbin/init' },
                    { pid: 42, user: 'guest', cpu: 12.4, mem: 8.5, cmd: 'node server.js' },
                    { pid: 108, user: 'guest', cpu: 5.1, mem: 15.2, cmd: 'react-scripts start' },
                    { pid: 256, user: 'guest', cpu: 2.8, mem: 4.1, cmd: 'vite --port 5173' },
                    { pid: 311, user: 'guest', cpu: 0.1, mem: 0.5, cmd: 'bash' },
                    { pid: 420, user: 'guest', cpu: 8.7, mem: 6.3, cmd: 'webpack --watch' },
                ],
                cpuUsage: 29.4,
                memUsage: 35.8,
            });
            break;
        }
        case 'ping': {
            const host = args[0] || 'localhost';
            out(`PING ${host} (127.0.0.1) 56(84) bytes of data.`);
            for (let i = 1; i <= 4; i++) {
                const ms = (Math.random() * 30 + 5).toFixed(1);
                out(`64 bytes from ${host} (127.0.0.1): icmp_seq=${i} ttl=64 time=${ms} ms`);
            }
            out(`\n--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`);
            break;
        }
        case 'curl': {
            const url = args[0] || '';
            if (!url) { out('curl: intenta "curl ejemplo.com"', 'error'); break; }
            out(`  % Total    % Received\n  100  1256   100  1256    0     0  12560      0 --:--:-- --:--:-- --:--:-- 12560`);
            out(`<!DOCTYPE html><html><head><title>${url}</title></head>...`, 'success');
            break;
        }
        case 'wget': {
            const url = args[0] || '';
            if (!url) { out('wget: falta URL', 'error'); break; }
            out(`--2026-05-04 15:00:00--  ${url}`);
            out(`Resolviendo ${url}... 93.184.216.34`);
            out(`Conectando con ${url}|93.184.216.34|:443... conectado.`);
            out(`HTTP petición enviada, esperando respuesta... 200 OK`);
            out(`Longitud: 1256 (1.2K) [text/html]`);
            out(`Guardando en: 'index.html'\n`);
            out(`index.html         100%[==================>]  1.23K  --.-KB/s  en 0s`, 'success');
            out(`\n2026-05-04 15:00:01 (12.5 MB/s) - 'index.html' guardado [1256/1256]`);
            break;
        }
        case 'chmod':
            out(`chmod: cambiando permisos de '${args[1] || 'archivo'}': Operación no permitida (simulado)`, 'error');
            break;
        case 'sudo':
            if (args[0] === 'rm' && args.includes('-rf') && args.includes('/')) {
                out('😱 ¡Buen intento! No puedes destruir mi portfolio tan fácilmente.', 'error');
            } else if (args.length === 0) {
                out('uso: sudo <comando>', 'error');
            } else {
                out(`[sudo] contraseña para guest: \nguest no está en el archivo sudoers. Se informará de este incidente.`, 'error');
            }
            break;
        case 'rm':
            if (args.includes('-rf')) out('🛡️ Filesystem protegido. No se puede eliminar nada.', 'error');
            else out(`rm: no se puede borrar '${args[0] || ''}': Filesystem de solo lectura`, 'error');
            break;
        case 'touch':
            out(`touch: no se puede crear '${args[0] || ''}': Filesystem de solo lectura`, 'error');
            break;
        case 'mkdir':
            out(`mkdir: no se puede crear el directorio '${args[0] || ''}': Solo lectura`, 'error');
            break;
        case 'vim': case 'nano': case 'vi':
            out(`${cmd}: abriendo editor... Es broma 😄 Este es un filesystem virtual.`, 'system');
            break;
        case 'exit':
            out('logout\n¿Salir? ¡Pero si acabas de llegar! 😄\nEscribe "help" para explorar mi portfolio.', 'system');
            break;
        case 'theme': {
            if (args[0] && THEMES[args[0]]) {
                setTheme(args[0]);
                out(`✔ Tema cambiado a: ${THEMES[args[0]].name}`, 'success');
            } else {
                out(`Temas disponibles: ${Object.entries(THEMES).map(([k,v]) => `${k} (${v.name})`).join(', ')}`, 'error');
            }
            break;
        }
        case 'matrix':
            setMatrix(prev => !prev);
            out(isMatrix ? 'Saliendo de la Matrix...' : 'Entrando en la Matrix... 🐇', 'success');
            break;
        case 'cowsay': {
            const msg = args.join(' ') || 'Moo!';
            const border = '_'.repeat(msg.length + 2);
            out(` ${border}\n< ${msg} >\n ${'-'.repeat(msg.length + 2)}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`);
            break;
        }
        case 'figlet': {
            const t = args.join(' ') || 'Hello';
            out(`  _   _      _ _       \n | | | | ___| | | ___  \n | |_| |/ _ \\ | |/ _ \\ \n |  _  |  __/ | | (_) |\n |_| |_|\\___|_|_|\\___/ \n\n(figlet simulado para: "${t}")`);
            break;
        }
        case 'fortune':
            const fortunes = [
                '"El código limpio siempre parece que fue escrito por alguien que se preocupa." — Robert C. Martin',
                '"Primero resuelve el problema. Después, escribe el código." — John Johnson',
                '"La simplicidad es la sofisticación máxima." — Leonardo da Vinci',
                '"Cualquier tonto puede escribir código que un ordenador entienda. Los buenos programadores escriben código que los humanos entienden." — Martin Fowler',
                '"No es un bug, es una feature no documentada." — Anónimo',
            ];
            out(fortunes[Math.floor(Math.random() * fortunes.length)]);
            break;
        case 'clear': return 'CLEAR';
        case '': break;
        default:
            out(`bash: ${cmd}: orden no encontrada. Escribe 'help' para ver los comandos.`, 'error');
    }
    return results;
}
