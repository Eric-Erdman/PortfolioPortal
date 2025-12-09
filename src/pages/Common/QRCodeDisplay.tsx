import React from 'react';

interface QRCodeDisplayProps {
  url: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '20px',
      border: '2px solid #e1e5e9',
      borderRadius: '12px',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        width: '200px',
        height: '200px',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center',
        padding: '10px'
      }}>
        QR Code for:<br />
        {url}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#666',
        textAlign: 'center',
        wordBreak: 'break-all',
        maxWidth: '200px'
      }}>
        {url}
      </div>
    </div>
  );
};