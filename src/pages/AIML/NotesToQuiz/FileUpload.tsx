import React from 'react';
import type { UploadedFile } from './types';

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFile: UploadedFile | null;
  isProcessingImage: boolean;
  processingError: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  uploadedFile,
  isProcessingImage,
  processingError
}) => {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
        flexWrap: 'wrap'
      }}>
        <label style={{
          background: 'rgba(61, 201, 196, 0.1)',
          border: '2px dashed #3dc9c4ff',
          borderRadius: '8px',
          padding: '1rem 1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: '400',
          color: '#000000',
          transition: 'all 0.2s ease',
          minWidth: '200px',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(61, 201, 196, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(61, 201, 196, 0.1)';
        }}
        >
            Upload Image
          <input
            type="file"
            accept="image/*,.png,.jpg,.jpeg,.gif,.bmp,.webp"
            onChange={onFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        
        <label style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px dashed #ef4444',
          borderRadius: '8px',
          padding: '1rem 1.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: '400',
          color: '#000000',
          transition: 'all 0.2s ease',
          minWidth: '200px',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
        }}
        >
          Upload PDF
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={onFileUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Processing indicator */}
      {isProcessingImage && (
        <div style={{
          background: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #ffc107',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{
            fontSize: '0.9rem',
            color: '#856404',
            fontWeight: '400'
          }}>
            Processing {uploadedFile?.type === 'pdf' ? 'PDF' : 'image'} and extracting text...
          </span>
        </div>
      )}

      {/* Error indicator */}
      {processingError && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            fontSize: '0.9rem',
            color: '#dc2626',
            fontWeight: '400'
          }}>
            Error: {processingError}
          </span>
        </div>
      )}

      {/* Uploaded file preview */}
      {uploadedFile && !isProcessingImage && !processingError && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          {uploadedFile.type === 'image' && (
            <img
              src={uploadedFile.preview}
              alt="Uploaded notes"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid #10b981'
              }}
            />
          )}
          {uploadedFile.type === 'pdf' && (
            <div style={{
              width: '60px',
              height: '60px',
              background: '#ef4444',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>
              PDF
            </div>
          )}
          <div>
            <p style={{
              fontSize: '0.9rem',
              color: '#065f46',
              margin: '0 0 0.25rem 0',
              fontWeight: '500'
            }}>
              {uploadedFile.type === 'pdf' ? 'PDF' : 'Image'} processed successfully!
            </p>
            <p style={{
              fontSize: '0.8rem',
              color: '#10b981',
              margin: '0',
              fontWeight: '300'
            }}>
              Text has been extracted and added to the notes area below.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};