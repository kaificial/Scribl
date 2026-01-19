import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CardDashboard from './pages/CardDashboard';
import { useEffect, Suspense, lazy } from 'react';
import './App.css';

// Lazy load heavy pages
const WriteMessage = lazy(() => import('./pages/WriteMessage'));
const CardView = lazy(() => import('./pages/CardView'));
const RecipientView = lazy(() => import('./pages/RecipientView'));
const GiftExperience = lazy(() => import('./pages/GiftExperience'));
const WrappedEditor = lazy(() => import('./pages/WrappedEditor'));

import { v4 as uuidv4 } from 'uuid';

function App() {
  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', uuidv4());
    }
  }, []);

  return (
    <Router>
      <Suspense fallback={
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ height: '4px', width: '200px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
            <div className="loading-bar-inner" />
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/card/:id" element={<CardDashboard />} />
          <Route path="/card/:id/write" element={<WriteMessage />} />
          <Route path="/card/:id/view" element={<CardView />} />
          <Route path="/card/:id/recipient" element={<RecipientView />} />
          <Route path="/gift/:id" element={<GiftExperience />} />
          <Route path="/gift/:id/edit" element={<WrappedEditor />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
