import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import '../css/FirestoreCRUD.css';

const FirestoreCRUD = () => {
    // ... (rest of the state)
    const [proyectos, setProyectos] = useState([]);
    const [form, setForm] = useState({ 
        nombre: '', 
        tech: '', 
        descripcion: '', 
        estado: '✅ Completado',
        github: '',
        live: '',
        imageUrls: [] 
    });
    const [imageFiles, setImageFiles] = useState([]); 
    const [editandoId, setEditandoId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "proyectos"), (snapshot) => {
            setProyectos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleImagesChange = (e) => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files));
        }
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return form.imageUrls;
        
        const options = {
            maxSizeMB: 0.8,          // Máximo 800KB
            maxWidthOrHeight: 1280, // Redimensionar si es muy grande
            useWebWorker: true,
            fileType: 'image/webp'  // Convertir a WebP
        };

        const uploadPromises = imageFiles.map(async (file) => {
            try {
                // Comprimir y convertir a WebP
                const compressedFile = await imageCompression(file, options);
                
                // Generar nombre con extensión .webp
                const fileName = file.name.split('.').slice(0, -1).join('.') || 'image';
                const storageRef = ref(storage, `proyectos/${Date.now()}_${fileName}.webp`);
                
                await uploadBytes(storageRef, compressedFile);
                return await getDownloadURL(storageRef);
            } catch (error) {
                console.error("Error al comprimir imagen:", error);
                return null;
            }
        });

        const newUrls = (await Promise.all(uploadPromises)).filter(url => url !== null);
        return [...form.imageUrls, ...newUrls];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const urls = await uploadImages();
            const projectData = { ...form, imageUrls: urls };

            if (editandoId) {
                await updateDoc(doc(db, "proyectos", editandoId), projectData);
                setEditandoId(null);
            } else {
                await addDoc(collection(db, "proyectos"), projectData);
            }

            setForm({ nombre: '', tech: '', descripcion: '', estado: '✅ Completado', github: '', live: '', imageUrls: [] });
            setImageFiles([]);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar el proyecto");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = (index) => {
        const updatedUrls = form.imageUrls.filter((_, i) => i !== index);
        setForm({ ...form, imageUrls: updatedUrls });
    };

    const moveImage = (index, direction) => {
        const newUrls = [...form.imageUrls];
        const newIndex = index + direction;
        
        if (newIndex < 0 || newIndex >= newUrls.length) return;
        
        // Swap elements
        [newUrls[index], newUrls[newIndex]] = [newUrls[newIndex], newUrls[index]];
        setForm({ ...form, imageUrls: newUrls });
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Eliminar este proyecto permanentemente?")) {
            await deleteDoc(doc(db, "proyectos", id));
        }
    };

    const startEdit = (p) => {
        setEditandoId(p.id);
        setForm({ 
            nombre: p.nombre, 
            tech: p.tech, 
            descripcion: p.descripcion, 
            estado: p.estado, 
            github: p.github || '', 
            live: p.live || '',
            imageUrls: p.imageUrls || (p.imageUrl ? [p.imageUrl] : []) // Migración suave si había una sola
        });
    };

    return (
        <div className="crud-container">
            <div className="crud-header">
                <h2>{editandoId ? 'Editar Proyecto' : 'Añadir Nuevo Proyecto'}</h2>
                <p>Gestiona los proyectos y sus galerías de imágenes.</p>
            </div>

            <form className="crud-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Nombre del Proyecto</label>
                        <input 
                            value={form.nombre} 
                            onChange={e => setForm({...form, nombre: e.target.value})} 
                            placeholder="Ej: E-Commerce API"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Tecnologías</label>
                        <input 
                            value={form.tech} 
                            onChange={e => setForm({...form, tech: e.target.value})} 
                            placeholder="React, Node.js..."
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Descripción</label>
                        <textarea 
                            value={form.descripcion} 
                            onChange={e => setForm({...form, descripcion: e.target.value})} 
                            placeholder="Descripción del proyecto..."
                        />
                    </div>
                    <div className="form-group">
                        <label>GitHub</label>
                        <input value={form.github} onChange={e => setForm({...form, github: e.target.value})} />
                    </div>
                    <div className="form-group">
                        <label>Live Demo</label>
                        <input value={form.live} onChange={e => setForm({...form, live: e.target.value})} />
                    </div>
                    
                    <div className="form-group full-width">
                        <label>Imágenes (puedes seleccionar varias)</label>
                        <input type="file" multiple onChange={handleImagesChange} accept="image/*" />
                        
                        <div className="image-preview-list">
                            {form.imageUrls.map((url, index) => (
                                <div key={index} className="preview-item">
                                    <img src={url} alt="Preview" />
                                    <div className="preview-controls">
                                        <button type="button" className="move-btn" onClick={() => moveImage(index, -1)} disabled={index === 0}>←</button>
                                        <button type="button" className="delete-img-btn" onClick={() => removeImage(index)}>×</button>
                                        <button type="button" className="move-btn" onClick={() => moveImage(index, 1)} disabled={index === form.imageUrls.length - 1}>→</button>
                                    </div>
                                </div>
                            ))}
                            {imageFiles.map((file, index) => (
                                <div key={`new-${index}`} className="preview-item uploading">
                                    <span>Nueva: {file.name.substring(0, 10)}...</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    {editandoId && <button type="button" className="cancel-btn" onClick={() => {setEditandoId(null); setForm({nombre: '', tech: '', descripcion: '', estado: '✅ Completado', github: '', live: '', imageUrls: []});}}>Cancelar</button>}
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Subiendo...' : (editandoId ? 'Guardar Cambios' : 'Publicar Proyecto')}
                    </button>
                </div>
            </form>

            <div className="projects-grid">
                {proyectos.map(p => (
                    <div key={p.id} className="project-card">
                        <div className="card-gallery">
                            {(p.imageUrls || (p.imageUrl ? [p.imageUrl] : [])).map((url, i) => (
                                <div key={i} className="gallery-thumb" style={{ backgroundImage: `url(${url})` }}></div>
                            ))}
                        </div>
                        <div className="card-content">
                            <h3>{p.nombre}</h3>
                            <p className="card-tech">{p.tech}</p>
                            <div className="card-actions">
                                <button className="edit-btn" onClick={() => startEdit(p)}>Editar</button>
                                <button className="delete-btn" onClick={() => handleDelete(p.id)}>Borrar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FirestoreCRUD;
