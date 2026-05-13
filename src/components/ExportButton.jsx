import React from 'react';
import { toPng } from 'html-to-image';
import { USI_THEME } from '../theme';

const ExportButton = ({ targetId, fileName }) => {
  const exportImage = () => {
    const node = document.getElementById(targetId);
    if (!node) return;

    toPng(node, { 
      backgroundColor: '#F7F7F5',
      pixelRatio: 2, // High res for reports
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `${fileName || 'usi-chart'}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('oops, something went wrong!', err);
      });
  };

  return (
    <button 
      onClick={exportImage}
      style={{
        background: 'linear-gradient(135deg, #E5145B, #F39200)',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: USI_THEME.fonts.primary,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(229, 20, 91, 0.3)',
        transition: 'transform 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span>Eksportuj do PNG</span>
    </button>
  );
};

export default ExportButton;
