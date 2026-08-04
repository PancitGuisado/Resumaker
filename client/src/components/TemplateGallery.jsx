import React from 'react';
import '../styles/gallery.css';

// We import all templates just for previewing
import Minimalist from '../templates/Minimalist';
import Creative from '../templates/Creative';
import Executive from '../templates/Executive';
import Modern from '../templates/Modern';
import Corporate from '../templates/Corporate';

const TEMPLATES = [
  { id: 'minimalist', name: 'Minimalist', component: Minimalist },
  { id: 'creative', name: 'Creative', component: Creative },
  { id: 'executive', name: 'Executive', component: Executive },
  { id: 'modern', name: 'Modern', component: Modern },
  { id: 'corporate', name: 'Corporate', component: Corporate }
];

export default function TemplateGallery({ resumeData, onSelectTemplate }) {
  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Choose a Template</h2>
        <p>Select a style to open the editor.</p>
      </div>

      <div className="gallery-grid">
        {TEMPLATES.map((template) => {
          const TemplateComponent = template.component;
          return (
            <div 
              key={template.id} 
              className="template-card"
              onClick={() => onSelectTemplate(template.id)}
            >
              <div className="template-card-preview-wrapper">
                <div className="template-card-preview">
                  {/* Render a completely disabled, non-interactive, scaled down preview */}
                  <div style={{ pointerEvents: 'none' }}>
                    <TemplateComponent data={resumeData} onChange={() => {}} themeColor="#2563eb" />
                  </div>
                </div>
              </div>
              <div className="template-card-info">
                <h3>{template.name}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
