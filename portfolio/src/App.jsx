import React, { useState, useEffect } from 'react';
import Terminal from './componentes/Terminal';
import Editor from './componentes/Editor';
import Login from './componentes/Login';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { INITIAL_FILESYSTEM } from './componentes/filesystem';
import './App.css';

function App() {
    const [fs, setFs] = useState(INITIAL_FILESYSTEM);
    const [showEditor, setShowEditor] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        // Sincronizar Proyectos de Firestore con el Filesystem Virtual
        const unsubscribeFs = onSnapshot(collection(db, "proyectos"), (snapshot) => {
            const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            setFs(prevFs => {
                const newFiles = { ...prevFs.files };
                const projectNames = [];

                projects.forEach(p => {
                    const fileName = `${p.nombre.toLowerCase().replace(/\s+/g, '-')}.md`;
                    const path = `/projects/${fileName}`;
                    projectNames.push(fileName);
                    
                    const imagesMd = (p.imageUrls || []).map(url => `![${p.nombre}](${url})`).join('\n');
                    
                    newFiles[path] = `# ${p.nombre}\n\n${p.descripcion}\n\n${imagesMd}\n\n**Tech:** ${p.tech}\n**Estado:** ${p.estado}${p.github ? `\n**GitHub:** ${p.github}` : ''}${p.live ? `\n**Live:** ${p.live}` : ''}`;
                });

                return {
                    ...prevFs,
                    dirs: {
                        ...prevFs.dirs,
                        '/projects': ['README.md', ...projectNames]
                    },
                    files: newFiles
                };
            });
        });

        return () => {
            unsubscribeAuth();
            unsubscribeFs();
        };
    }, []);

    const updateFs = (newFs) => {
        setFs(newFs);
    };

    const handleOpenEditor = () => {
        if (user) {
            setShowEditor(true);
        } else {
            setShowLogin(true);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setShowEditor(false);
    };

    return (
        <div className="App">
            <Terminal fs={fs} onOpenEditor={handleOpenEditor} />
            
            {showLogin && (
                <Login 
                    onLoginSuccess={() => {
                        setShowLogin(false);
                        setShowEditor(true);
                    }} 
                    onClose={() => setShowLogin(false)} 
                />
            )}

            {showEditor && (
                <Editor 
                    fs={fs} 
                    onSave={updateFs} 
                    onClose={() => setShowEditor(false)}
                    onLogout={handleLogout}
                />
            )}
        </div>
    );
}

export default App;