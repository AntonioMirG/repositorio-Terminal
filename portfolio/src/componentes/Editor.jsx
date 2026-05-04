import React, { useState, useEffect } from 'react';
import '../css/Editor.css';

const Editor = ({ fs, onSave, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [content, setContent] = useState('');
    const [localFs, setLocalFs] = useState(fs);
    const [isSaving, setIsSaving] = useState(false);

    const allFiles = Object.keys(localFs.files);

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setContent(localFs.files[file] || '');
    };

    const handleSave = () => {
        setIsSaving(true);
        const updatedFs = {
            ...localFs,
            files: {
                ...localFs.files,
                [selectedFile]: content
            }
        };
        setLocalFs(updatedFs);
        
        // Simulate network delay for premium feel
        setTimeout(() => {
            onSave(updatedFs);
            setIsSaving(false);
            // Notification could go here
        }, 800);
    };

    return (
        <div className="editor-overlay">
            <div className="editor-window">
                <div className="editor-header">
                    <div className="header-left">
                        <div className="editor-dot red" onClick={onClose}></div>
                        <div className="editor-dot yellow"></div>
                        <div className="editor-dot green"></div>
                        <span className="editor-title">Portfolio Manager — Admin Mode</span>
                    </div>
                    <div className="header-right">
                        <button 
                            className={`save-btn ${isSaving ? 'saving' : ''}`} 
                            onClick={handleSave}
                            disabled={!selectedFile || isSaving}
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                        <button className="close-icon" onClick={onClose}>✕</button>
                    </div>
                </div>
                
                <div className="editor-body">
                    <div className="editor-sidebar">
                        <div className="sidebar-label">ARCHIVOS</div>
                        <div className="file-list">
                            {allFiles.map(file => (
                                <div 
                                    key={file} 
                                    className={`file-item ${selectedFile === file ? 'active' : ''}`}
                                    onClick={() => handleFileSelect(file)}
                                >
                                    <span className="file-icon">📄</span>
                                    <span className="file-name">{file}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="editor-main">
                        {selectedFile ? (
                            <div className="editor-container">
                                <div className="editor-path">
                                    Ruta: <span className="highlight">{selectedFile}</span>
                                </div>
                                <textarea
                                    className="editor-textarea"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    spellCheck="false"
                                />
                            </div>
                        ) : (
                            <div className="editor-placeholder">
                                <div className="placeholder-content">
                                    <div className="placeholder-icon">📁</div>
                                    <h3>Selecciona un archivo para editar</h3>
                                    <p>Modifica el contenido de tu portfolio en tiempo real.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="editor-footer">
                    <div className="footer-item">UTF-8</div>
                    <div className="footer-item">JavaScript / Markdown</div>
                    <div className="footer-item">Líneas: {content.split('\n').length}</div>
                </div>
            </div>
        </div>
    );
};

export default Editor;
