import React from 'react';
import { PenTool, History, Smartphone } from 'lucide-react';
import '../styles/home.css';

export default function Home({ onStartCreate, onViewSaved, onInstallApp }) {
  return (
    <div className="home-container">
      <div className="home-header">
        <div className="logo-container">
          <img src="/icon.png" alt="Resumaker Logo" className="logo" />
          <h1>Resumaker</h1>
        </div>
        <p className="subtitle">AI-Powered Resume Generator</p>
      </div>

      <div className="home-choices">
        <div className="choice-card" onClick={onStartCreate}>
          <div className="choice-icon-wrapper create-icon">
            <PenTool size={48} />
          </div>
          <h2>Create New</h2>
          <p>Start a new resume with our AI Wizard.</p>
        </div>

        <div className="choice-card" onClick={onViewSaved}>
          <div className="choice-icon-wrapper saved-icon">
            <History size={48} />
          </div>
          <h2>View Saved</h2>
          <p>Access and edit your previously generated resumes.</p>
        </div>
      </div>

      {!(window.location.protocol === 'capacitor:' || (window.location.hostname === 'localhost' && window.location.port === '')) && (
        <div style={{ marginTop: '4rem', animation: 'fadeInUp 0.6s ease-out 0.2s backwards' }}>
          <button 
            onClick={onInstallApp}
            className="choice-card" 
            style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: '#1e293b', color: 'white', borderRadius: '50px' }}
          >
            <Smartphone size={24} color="#60a5fa" />
            <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Get the Mobile App</span>
          </button>
        </div>
      )}
    </div>
  );
}
