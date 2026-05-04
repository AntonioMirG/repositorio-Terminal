import React, { useState } from 'react';
import Terminal from './componentes/Terminal';
import Editor from './componentes/Editor';
import { INITIAL_FILESYSTEM } from './componentes/filesystem';
import './App.css';

function App() {
    const [fs, setFs] = useState(INITIAL_FILESYSTEM);
    const [showEditor, setShowEditor] = useState(false);

    const updateFs = (newFs) => {
        setFs(newFs);
    };

    return (
        <div className="App">
            <Terminal fs={fs} onOpenEditor={() => setShowEditor(true)} />
            
            {showEditor && (
                <Editor 
                    fs={fs} 
                    onSave={updateFs} 
                    onClose={() => setShowEditor(false)} 
                />
            )}
        </div>
    );
}

export default App;