import React, { useState, useEffect } from 'react';
import '../css/Editor.css';
import FirestoreCRUD from './FirestoreCRUD';

const Editor = ({ fs, onSave, onClose, onLogout }) => {
    const [activeTab, setActiveTab] = useState('files'); // 'files' or 'projects'
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

        setTimeout(() => {
            onSave(updatedFs);
            setIsSaving(false);
        }, 800);
    };

    const handleNewFile = () => {
        const fileName = prompt("Nombre del nuevo archivo (ej: nota.txt):");
        if (fileName && !localFs.files[fileName]) {
            const updatedFs = {
                ...localFs,
                files: {
                    ...localFs.files,
                    [fileName]: ''
                }
            };
            setLocalFs(updatedFs);
            setSelectedFile(fileName);
            setContent('');
            onSave(updatedFs);
        } else if (fileName) {
            alert("El archivo ya existe.");
        }
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
                        {activeTab === 'files' && (
                            <>
                                <button className="new-btn" onClick={handleNewFile}>+ Nuevo Archivo</button>
                                <button
                                    className={`save-btn ${isSaving ? 'saving' : ''}`}
                                    onClick={handleSave}
                                    disabled={!selectedFile || isSaving}
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </>
                        )}
                        <button className="logout-btn" onClick={onLogout}>Cerrar Sesión</button>
                        <button className="close-icon" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="editor-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
                        onClick={() => setActiveTab('files')}
                    >
                        📁 Explorador de Archivos
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
                        onClick={() => setActiveTab('projects')}
                    >
                        🚀 Gestor de Proyectos
                    </button>
                </div>

                <div className="editor-body">
                    {activeTab === 'files' ? (
                        <>
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
                        </>
                    ) : (
                        <div className="editor-main-full">
                            <FirestoreCRUD />
                        </div>
                    )}
                </div>

                <div className="editor-footer">
                    <div className="footer-item">UTF-8</div>
                    <div className="footer-item">{activeTab === 'files' ? 'VFS Mode' : 'Firestore Mode'}</div>
                    <div className="footer-item">Admin: Antoniomirdev</div>
                </div>
            </div>
        </div>
    );
};

export default Editor;
