import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../css/Terminal.css';
import { INITIAL_FILESYSTEM, THEMES, WELCOME_ASCII } from './filesystem';
import { executeCommand } from './commands';

const Terminal = ({ fs, onOpenEditor }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const [currentDir, setCurrentDir] = useState('/');
    const [cmdHistory, setCmdHistory] = useState([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const [currentTheme, setCurrentTheme] = useState('matrix');
    const [isMatrixActive, setIsMatrixActive] = useState(false);
    const [startTime] = useState(Date.now());

    const termEndRef = useRef(null);
    const inputRef = useRef(null);
    const bodyRef = useRef(null);
    const theme = THEMES[currentTheme];

    // Welcome message on mount
    useEffect(() => {
        setHistory([
            { type: 'component', component: 'welcome', data: WELCOME_ASCII },
            { type: 'system', content: `Terminal Portfolio ${new Date().toLocaleDateString('es-ES')}` },
            { type: 'system', content: "Escribe 'help' para ver los comandos disponibles.\n" },
        ]);
    }, []);

    // Scroll to bottom
    useEffect(() => {
        termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    // Apply theme
    useEffect(() => {
        const r = document.documentElement.style;
        r.setProperty('--term-bg', theme.bg);
        r.setProperty('--term-text', theme.text);
        r.setProperty('--term-prompt-user', theme.prompt);
        r.setProperty('--term-prompt-host', theme.prompt);
    }, [currentTheme, theme]);

    const focusInput = useCallback(() => inputRef.current?.focus(), []);

    const [cursorPos, setCursorPos] = useState(0);

    const updateCursor = (e) => {
        setTimeout(() => {
            setCursorPos(e.target.selectionStart);
        }, 0);
    };

    const handleInput = (e) => {
        setInput(e.target.value);
        setCursorPos(e.target.selectionStart + 1); // Approximate, will be corrected by updateCursor
    };

    const getPrompt = () => {
        const path = currentDir === '/' ? '~' : `~/${currentDir.substring(1)}`;
        return { user: 'guest', host: 'portfolio', path };
    };

    const PromptDisplay = ({ prompt }) => (
        <span className="prompt">
            <span className="prompt-user">{prompt.user}</span>
            <span className="prompt-at">@</span>
            <span className="prompt-host">{prompt.host}</span>
            <span className="prompt-separator">:</span>
            <span className="prompt-path">{prompt.path}</span>
            <span className="prompt-symbol">$ </span>
        </span>
    );

    const handleKeyDown = (e) => {
        updateCursor(e);
        if (e.key === 'Enter') {
            const trimmed = input.trim();
            const [cmd, ...args] = trimmed.split(/\s+/);
            const prompt = getPrompt();

            const inputLine = { type: 'input-echo', content: trimmed, prompt };

            if (trimmed) {
                setCmdHistory(prev => [trimmed, ...prev].slice(0, 100));
                setHistoryIdx(-1);
            }

            if (cmd === 'clear') {
                setHistory([]);
                setInput('');
                setCursorPos(0);
                return;
            }

            const result = executeCommand(
                cmd?.toLowerCase() || '', args, currentDir, setCurrentDir,
                cmdHistory, setCurrentTheme, setIsMatrixActive, isMatrixActive,
                fs, onOpenEditor
            );

            if (result === 'CLEAR') {
                setHistory([]);
            } else {
                setHistory(prev => [...prev, inputLine, ...result]);
            }
            setInput('');
            setCursorPos(0);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const [cmd, ...args] = input.split(' ');
            const partial = args.join(' ');
            const files = fs.dirs[currentDir];
            if (['cd', 'cat', 'ls', 'head', 'tail', 'wc', 'grep'].includes(cmd)) {
                if (files) {
                    const matches = files.filter(f => f.startsWith(partial));
                    if (matches.length === 1) {
                        const newVal = `${cmd} ${matches[0]}`;
                        setInput(newVal);
                        setCursorPos(newVal.length);
                    }
                    else if (matches.length > 1) {
                        setHistory(prev => [...prev, { type: 'output', content: matches.join('  ') }]);
                    }
                }
            } else {
                const allCmds = ['help', 'ls', 'cd', 'cat', 'pwd', 'clear', 'whoami', 'hostname', 'date', 'uname', 'uptime', 'echo', 'history', 'tree', 'grep', 'find', 'wc', 'head', 'tail', 'man', 'neofetch', 'htop', 'ping', 'curl', 'wget', 'chmod', 'sudo', 'rm', 'touch', 'mkdir', 'theme', 'matrix', 'cowsay', 'figlet', 'fortune', 'exit', 'vim', 'nano', 'id'];
                const matches = allCmds.filter(c => c.startsWith(input));
                if (matches.length === 1) {
                    setInput(matches[0]);
                    setCursorPos(matches[0].length);
                }
                else if (matches.length > 1) {
                    setHistory(prev => [...prev, { type: 'output', content: matches.join('  ') }]);
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length > 0 && historyIdx < cmdHistory.length - 1) {
                const next = historyIdx + 1;
                setHistoryIdx(next);
                setInput(cmdHistory[next]);
                setCursorPos(cmdHistory[next].length);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIdx > 0) { 
                const val = cmdHistory[historyIdx - 1];
                setHistoryIdx(historyIdx - 1); 
                setInput(val); 
                setCursorPos(val.length);
            }
            else if (historyIdx === 0) { setHistoryIdx(-1); setInput(''); setCursorPos(0); }
        } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            setHistory([]);
        } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            setHistory(prev => [...prev, { type: 'input-echo', content: input + '^C', prompt: getPrompt() }]);
            setInput('');
            setCursorPos(0);
        }
    };

    // Render special components
    const renderLine = (line, i) => {
        if (line.type === 'input-echo') {
            return (
                <div key={i} className="line input-echo">
                    <PromptDisplay prompt={line.prompt} />
                    {line.content}
                </div>
            );
        }
        if (line.type === 'component') {
            switch (line.component) {
                case 'welcome':
                    return (
                        <div key={i} className="welcome-banner">
                            <pre className="welcome-ascii">{line.data}</pre>
                        </div>
                    );
                case 'ls':
                    return (
                        <div key={i} className="ls-output">
                            {line.data.map((f, j) => (
                                <span key={j} className={f.isDir ? 'ls-dir' : f.isExec ? 'ls-exec' : f.isHidden ? 'ls-hidden' : 'ls-file'}>
                                    {f.name}
                                </span>
                            ))}
                        </div>
                    );
                case 'neofetch':
                    return (
                        <div key={i} className="neofetch-container">
                            <pre className="neofetch-ascii">{line.data.ascii}</pre>
                            <div className="neofetch-info">
                                {line.data.info.map(([label, value], j) => {
                                    if (!label && value) return <div key={j} className="neofetch-separator">{value}</div>;
                                    if (label && !value) return <div key={j}><span className="neofetch-label">{label}</span></div>;
                                    return (
                                        <div key={j}>
                                            <span className="neofetch-label">{label}</span>
                                            <span className="neofetch-value">: {value}</span>
                                        </div>
                                    );
                                })}
                                <div className="neofetch-colors">
                                    {['#ff5555', '#ffb86c', '#f1fa8c', '#50fa7b', '#8be9fd', '#bd93f9', '#ff79c6', '#f8f8f2'].map((c, j) => (
                                        <span key={j} className="neofetch-color-block" style={{ background: c }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                case 'htop':
                    return (
                        <div key={i} className="line output" style={{ fontSize: '13px' }}>
                            <div style={{ color: '#50fa7b', fontWeight: 700, marginBottom: 4 }}>
                                {'  PID USER     CPU%  MEM%  COMMAND'}
                            </div>
                            {line.data.procs.map((p, j) => (
                                <div key={j}>
                                    <span style={{ color: '#8be9fd' }}>{String(p.pid).padStart(5)}</span>
                                    {' '}<span style={{ color: '#f8f8f2' }}>{p.user.padEnd(8)}</span>
                                    {' '}<span style={{ color: p.cpu > 5 ? '#ff5555' : '#50fa7b' }}>{String(p.cpu.toFixed(1)).padStart(5)}</span>
                                    {' '}<span style={{ color: p.mem > 10 ? '#ffb86c' : '#f8f8f2' }}>{String(p.mem.toFixed(1)).padStart(5)}</span>
                                    {'  '}<span style={{ color: '#f8f8f2' }}>{p.cmd}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 6, color: '#6272a4' }}>
                                CPU[<span style={{ color: '#50fa7b' }}>{'|'.repeat(Math.round(line.data.cpuUsage / 5))}</span>
                                <span style={{ color: '#44475a' }}>{'|'.repeat(20 - Math.round(line.data.cpuUsage / 5))}</span>
                                {' '}{line.data.cpuUsage}%]
                                {'  '}Mem[<span style={{ color: '#8be9fd' }}>{'|'.repeat(Math.round(line.data.memUsage / 5))}</span>
                                <span style={{ color: '#44475a' }}>{'|'.repeat(20 - Math.round(line.data.memUsage / 5))}</span>
                                {' '}{line.data.memUsage}%]
                            </div>
                        </div>
                    );
                default: return null;
            }
        }
        return (
            <div key={i} className={`line ${line.type}`}>
                {line.content}
            </div>
        );
    };

    const prompt = getPrompt();

    return (
        <div className="terminal-wrapper">
            <div className="terminal-frame">
                {/* Title Bar */}
                <div className="terminal-titlebar">
                    <div className="titlebar-buttons">
                        <button className="titlebar-btn close" aria-label="Close" />
                        <button className="titlebar-btn minimize" aria-label="Minimize" />
                        <button className="titlebar-btn maximize" aria-label="Maximize" />
                    </div>
                    <span className="titlebar-title">
                        guest@portfolio: {currentDir === '/' ? '~' : `~/${currentDir.substring(1)}`}
                    </span>
                    <div className="titlebar-tabs">
                        <span className="titlebar-tab active">bash</span>
                    </div>
                </div>

                {/* Terminal Body */}
                <div className="terminal-body" ref={bodyRef} onClick={focusInput}>
                    {history.map((line, i) => renderLine(line, i))}

                    <div className="input-line">
                        <PromptDisplay prompt={prompt} />
                        <div className="input-container">
                            <span className="input-text-before">{input.slice(0, cursorPos)}</span>
                            <span className="cursor-block">{input[cursorPos] || '\u00A0'}</span>
                            <span className="input-text-after">{input.slice(cursorPos + 1)}</span>
                            <input
                                ref={inputRef}
                                autoFocus
                                type="text"
                                value={input}
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                onKeyUp={updateCursor}
                                onClick={updateCursor}
                                autoComplete="off"
                                spellCheck="false"
                                aria-label="Terminal input"
                                className="hidden-input"
                            />
                        </div>
                    </div>
                    <div ref={termEndRef} />
                </div>

                {/* Status Bar */}
                <div className="terminal-statusbar">
                    <div className="statusbar-left">
                        <span className="statusbar-item">
                            <span className="statusbar-dot" />
                            bash
                        </span>
                        <span className="statusbar-item">{currentDir === '/' ? '~' : currentDir}</span>
                    </div>
                    <div className="statusbar-right">
                        <span className="statusbar-item">UTF-8</span>
                        <span className="statusbar-item">LF</span>
                        <span className="statusbar-item">{cmdHistory.length} cmds</span>
                    </div>
                </div>
            </div>

            {/* Matrix Easter Egg */}
            {isMatrixActive && (
                <div className="matrix-background">
                    {Array(30).fill(0).map((_, i) => (
                        <div key={i} className="matrix-column" style={{ left: `${i * 3.33}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 3}s` }}>
                            {Array(25).fill(0).map((_, j) => (
                                <div key={j}>{String.fromCharCode(0x30A0 + Math.random() * 96)}</div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Terminal;