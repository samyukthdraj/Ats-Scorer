//client/src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ResumeUploader from './components/ResumeUploader';
import ScoreDisplay from './components/ScoreDisplay';
import Header from './components/Header'; 

function App() {
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  return (
    <div className="App">
      <BrowserRouter>
        <Header /> 
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <ResumeUploader
                  setScore={setScore}
                  setIsLoading={setIsLoading}
                  isLoading={isLoading}
                  setFileName={setFileName}
                />
              }
            />
            <Route
              path="/scoredisplay"
              element={
                <ScoreDisplay
                  score={score}
                  fileName={fileName}
                  setFileName={setFileName}
                  setScore={setScore}
                />
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;