import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';
import { reseedKyrgyzstan } from './services/api.js';

// Force Kyrgyzstan data if old US properties still in storage
const stored = JSON.parse(localStorage.getItem('sh_properties') || '[]');
const hasOldData = stored.some(p => p.location?.includes('USA') || p.location?.includes('New York'));
if (hasOldData) reseedKyrgyzstan();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);