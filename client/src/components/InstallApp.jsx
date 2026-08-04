import React from 'react';
import { ArrowLeft, Download, Smartphone } from 'lucide-react';
import '../styles/install.css';

export default function InstallApp({ onBack }) {
  return (
    <div className="install-container">
      <button className="back-icon-btn" onClick={onBack} title="Back to Home">
        <ArrowLeft size={28} />
      </button>

      <div className="install-content">
        <div className="install-text-section">
          <div className="install-badge">
            <Smartphone size={16} /> Now Available on Android
          </div>
          <h1 className="install-title">Take Resumaker<br/>Anywhere You Go.</h1>
          <p className="install-description">
            Experience the ultimate AI resume builder natively on your Android device. 
            Build, edit, and export your professional resume with our lightning-fast mobile app.
          </p>
          
          <div className="install-features">
            <div className="feature-item">
              <strong>✨ Native Performance</strong>
              <span>Smooth, lag-free editing powered by Capacitor.</span>
            </div>
            <div className="feature-item">
              <strong>📱 Mobile Optimized</strong>
              <span>Perfectly scaled UI for editing on the go.</span>
            </div>
            <div className="feature-item">
              <strong>💾 Offline Saving</strong>
              <span>Your data is securely auto-saved locally on your device.</span>
            </div>
          </div>

          <a href="/resumaker.apk" download className="download-apk-btn">
            <Download size={20} />
            <span>Download APK (Android)</span>
          </a>
          <p className="install-note">Version 1.0.0 • Requires Android 8.0+</p>
        </div>

        <div className="install-mockups-section">
          <div className="mockup-wrapper mockup-left">
            <img src="/mockup1.jpg" alt="App Home Screen" className="mockup-img" />
          </div>
          <div className="mockup-wrapper mockup-right">
            <img src="/mockup2.jpg" alt="App Editor Screen" className="mockup-img" />
          </div>
        </div>
      </div>
    </div>
  );
}
