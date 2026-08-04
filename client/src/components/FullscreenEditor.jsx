import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, Palette, Type } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import '../styles/editor.css';

import Minimalist from '../templates/Minimalist';
import Creative from '../templates/Creative';
import Executive from '../templates/Executive';
import Modern from '../templates/Modern';
import Corporate from '../templates/Corporate';

const TEMPLATES = {
  minimalist: Minimalist,
  creative: Creative,
  executive: Executive,
  modern: Modern,
  corporate: Corporate
};

const isNativeApp = () => {
  return window.location.protocol === 'capacitor:' || (window.location.hostname === 'localhost' && window.location.port === '');
};

export default function FullscreenEditor({ resumeData, templateId, onClose, onUpdateData }) {
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [fontSize, setFontSize] = useState(14);
  const [exportStatus, setExportStatus] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    
    const [activeSection, activeIndexStr] = active.id.split('-');
    const [overSection, overIndexStr] = over.id.split('-');
    
    if (activeSection !== overSection) return;
    
    const activeIndex = parseInt(activeIndexStr, 10);
    const overIndex = parseInt(overIndexStr, 10);
    
    const items = [...resumeData[activeSection]];
    const newItems = arrayMove(items, activeIndex, overIndex);
    
    onUpdateData({
      ...resumeData,
      [activeSection]: newItems
    });
  };

  const exportToPDF = async (elementId, filename) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    setExportStatus('Generating PDF...');
    try {
      const imgData = await toJpeg(element, { quality: 1.0, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      if (isNativeApp()) {
        const pdfOutput = pdf.output('datauristring');
        const base64Data = pdfOutput.split(',')[1];
        const savedFile = await Filesystem.writeFile({
          path: `${filename}_${Date.now()}.pdf`,
          data: base64Data,
          directory: Directory.Cache,
        });
        await Share.share({
          title: `${filename}.pdf`,
          url: savedFile.uri,
          dialogTitle: 'Save or Share your Resume PDF',
        });
        setExportStatus('PDF ready!');
      } else {
        pdf.save(`${filename}.pdf`);
        setExportStatus('PDF downloaded!');
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setExportStatus('Export failed. Try again.');
    }
    setTimeout(() => setExportStatus(''), 3000);
  };

  const exportToImage = async (elementId, format = 'png', filename) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    setExportStatus('Generating image...');
    try {
      const dataUrl = await toPng(element, { pixelRatio: 2 });

      if (isNativeApp()) {
        const base64Data = dataUrl.split(',')[1];
        const savedFile = await Filesystem.writeFile({
          path: `${filename}_${Date.now()}.png`,
          data: base64Data,
          directory: Directory.Cache,
        });
        await Share.share({
          title: `${filename}.png`,
          url: savedFile.uri,
          dialogTitle: 'Save or Share your Resume Image',
        });
        setExportStatus('Image ready!');
      } else {
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = dataUrl;
        link.click();
        setExportStatus('Image downloaded!');
      }
    } catch (err) {
      console.error('Failed to export image:', err);
      setExportStatus('Export failed. Try again.');
    }
    setTimeout(() => setExportStatus(''), 3000);
  };

  const TemplateComponent = TEMPLATES[templateId];

  return (
    <div className="fullscreen-editor-overlay">
      <div className="editor-sidebar">
        <div className="editor-sidebar-header">
          <h2>Live Editor</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="editor-controls">
          <div className="control-group">
            <label><Palette size={16} /> Theme Color</label>
            <input 
              type="color" 
              value={themeColor} 
              onChange={(e) => setThemeColor(e.target.value)}
              className="color-picker"
            />
          </div>

          <div className="control-group">
            <label><Type size={16} /> Font Size: {fontSize}px</label>
            <input 
              type="range" 
              min="10" 
              max="24" 
              value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="font-slider"
            />
          </div>
        </div>

        <div className="editor-actions">
          <button className="btn-export pdf" onClick={() => exportToPDF('resume-document', 'Resume')}>
            <Download size={18} /> Download PDF
          </button>
          <button className="btn-export png" onClick={() => exportToImage('resume-document', 'png', 'Resume')}>
            <ImageIcon size={18} /> Download PNG
          </button>
          {exportStatus && (
            <p style={{ color: '#60a5fa', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>{exportStatus}</p>
          )}
        </div>
      </div>

      <div className="editor-main">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="resume-scale-container">
            <div 
              id="resume-document"
              className="resume-document"
              style={{ '--base-font-size': `${fontSize}px` }}
            >
              <TemplateComponent 
                data={resumeData} 
                onChange={onUpdateData} 
                themeColor={themeColor} 
              />
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
