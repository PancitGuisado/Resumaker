import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToImage = async (elementId, format = 'png', filename = 'resume') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL(`image/${format}`, 1.0);
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${filename}.${format}`;
    link.click();
  } catch (err) {
    console.error('Error exporting image:', err);
  }
};

export const exportToPDF = async (elementId, filename = 'resume') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // Calculate PDF dimensions based on A4 ratio
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('Error exporting PDF:', err);
  }
};
