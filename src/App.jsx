import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CardDashboard from './pages/CardDashboard';
import WriteMessage from './pages/WriteMessage';
import CardView from './pages/CardView';
import RecipientView from './pages/RecipientView';
import GiftExperience from './pages/GiftExperience';
import WrappedEditor from './pages/WrappedEditor';
import { useEffect } from 'react';
import './App.css';

import { v4 as uuidv4 } from 'uuid';

function App() {
  useEffect(() => {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', uuidv4());
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/card/:id" element={<CardDashboard />} />
        <Route path="/card/:id/write" element={<WriteMessage />} />
        <Route path="/card/:id/view" element={<CardView />} />
        <Route path="/card/:id/recipient" element={<RecipientView />} />
        <Route path="/gift/:id" element={<GiftExperience />} />
        <Route path="/gift/:id/edit" element={<WrappedEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
