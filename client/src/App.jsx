import { useState, useEffect } from 'react';
import { Loader2, History, Home as HomeIcon, Trash2, WifiOff, ArrowLeft } from 'lucide-react';
import './App.css';

import Home from './components/Home';
import Wizard from './components/Wizard';
import TemplateGallery from './components/TemplateGallery';
import FullscreenEditor from './components/FullscreenEditor';
import InstallApp from './components/InstallApp';

// A simple utility to deep update nested objects
const setNestedObjectProperty = (obj, path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const deepClone = JSON.parse(JSON.stringify(obj));
  let current = deepClone;
  for (let key of keys) {
    if (!current[key]) current[key] = {};
    current = current[key];
  }
  current[lastKey] = value;
  return deepClone;
};

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, wizard, gallery, saved
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);
  
  const [activeTemplate, setActiveTemplate] = useState('minimalist');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const [showSplash, setShowSplash] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [savedResumes, setSavedResumes] = useState(() => {
    const loaded = localStorage.getItem('resumaker_saved');
    if (loaded) {
      try { return JSON.parse(loaded); } 
      catch (e) { console.error(e); }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('resumaker_saved', JSON.stringify(savedResumes));
  }, [savedResumes]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => { 
      clearTimeout(timer); 
      window.removeEventListener('online', handleOnline); 
      window.removeEventListener('offline', handleOffline); 
    };
  }, []);

  // Sync edits back to local storage for the currently active saved resume
  useEffect(() => {
    if (resumeData && (currentView === 'gallery' || isEditorOpen)) {
      setSavedResumes(prev => {
        if (!resumeData._id) return prev;
        return prev.map(r => r.id === resumeData._id ? { ...r, data: resumeData, template: activeTemplate } : r);
      });
    }
  }, [resumeData, activeTemplate, currentView, isEditorOpen]);


  const handleGenerate = async (compiledPrompt) => {
    if (!compiledPrompt || isOffline) return;
    setLoading(true);
    setError(null);
    try {
      const isNative = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNative;
      const API_URL = isNative ? 'https://resumakerai.vercel.app/api/generate' : '/api/generate';

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: compiledPrompt })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      
      const newId = Date.now().toString();
      const processedData = { ...data, _id: newId };
      setResumeData(processedData);

      const newSaved = {
        id: newId,
        timestamp: new Date().toLocaleString(),
        template: 'minimalist',
        color: '#2563eb',
        data: processedData
      };
      setSavedResumes(prev => [newSaved, ...prev]);
      
      setCurrentView('gallery');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSaved = (id) => {
    setSavedResumes(prev => prev.filter(r => r.id !== id));
  };

  const loadSaved = (saved) => {
    setResumeData(saved.data);
    setActiveTemplate(saved.template);
    setCurrentView('gallery');
  };

  const handleUpdateData = (newData) => {
    setResumeData(newData);
  };

  if (showSplash) {
    return (
      <div className="splash-screen">
        <img src="/icon.png" alt="Resumaker Logo" className="splash-logo" />
        <h1 className="splash-title">Resumaker</h1>
        <Loader2 className="splash-spinner" size={32} />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      
      {isOffline && (
        <div className="offline-banner">
          <WifiOff size={16} /> 
          <span>You are offline. Generation is disabled, but you can still access saved resumes.</span>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      <div className="view-container">
        {currentView === 'home' && (
          <Home 
            onStartCreate={() => setCurrentView('wizard')} 
            onViewSaved={() => setCurrentView('saved')}
            onInstallApp={() => setCurrentView('install')} 
          />
        )}

        {currentView === 'install' && (
          <InstallApp onBack={() => setCurrentView('home')} />
        )}

        {currentView === 'wizard' && (
          <div className="wizard-overlay" style={{ position: 'relative' }}>
            <button 
              onClick={() => setCurrentView('home')}
              className="back-icon-btn"
              style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'all 0.2s', zIndex: 20 }}
              title="Back to Home"
            >
              <ArrowLeft size={28} />
            </button>
            {loading && (
              <div className="wizard-loading" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="spinner" size={64} color="white" />
                <h2>Generating your masterpiece...</h2>
                <p>Our AI is formatting your resume perfectly. This takes just a few seconds.</p>
              </div>
            )}
            <div style={{ display: loading ? 'none' : 'block', width: '100%', height: '100%' }}>
              <Wizard onComplete={handleGenerate} disabled={isOffline} />
            </div>
          </div>
        )}

        {currentView === 'gallery' && resumeData && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setCurrentView('home')}
              className="back-icon-btn"
              style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'all 0.2s' }}
              title="Back to Home"
            >
              <ArrowLeft size={28} />
            </button>
            <TemplateGallery 
              resumeData={resumeData} 
              onSelectTemplate={(templateId) => {
                setActiveTemplate(templateId);
                setIsEditorOpen(true);
              }} 
            />
          </div>
        )}

        {currentView === 'saved' && (
          <div className="saved-view" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setCurrentView('home')}
              className="back-icon-btn"
              style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%', transition: 'all 0.2s' }}
              title="Back to Home"
            >
              <ArrowLeft size={28} />
            </button>
            <div className="saved-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif' }}>Your Saved Resumes</h2>
              <p className="subtitle">All resumes are securely auto-saved on this device.</p>
            </div>
            
            {savedResumes.length === 0 ? (
              <div className="empty-state">
                <p>You haven't generated any resumes yet.</p>
              </div>
            ) : (
              <div className="saved-grid">
                {savedResumes.map(saved => (
                  <div key={saved.id} className="saved-card" style={{ borderTop: `4px solid ${saved.color || '#2563eb'}` }}>
                    <div className="saved-card-header">
                      <h3>{saved.data.personal?.name || 'Untitled Resume'}</h3>
                      <span className="saved-template-badge">{saved.template}</span>
                    </div>
                    <p className="saved-title">{saved.data.personal?.title || 'No Title'}</p>
                    <p className="saved-date">{saved.timestamp}</p>
                    
                    <div className="saved-actions">
                      <button className="btn-view" onClick={() => loadSaved(saved)}>View & Edit</button>
                      <button className="btn-delete" onClick={() => deleteSaved(saved.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditorOpen && (
        <FullscreenEditor 
          resumeData={resumeData}
          templateId={activeTemplate}
          onClose={() => setIsEditorOpen(false)}
          onUpdateData={handleUpdateData}
        />
      )}
    </div>
  );
}

export default App;
