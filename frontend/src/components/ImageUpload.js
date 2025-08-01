import React, { useState, useRef } from 'react';
import { uploadAPI } from '../services/api';

const ImageUpload = ({ onImageUploaded, currentImageUrl = '', disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, BMP, WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const response = await uploadAPI.uploadImage(file);
      const imageUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}${response.data.url}`;
      onImageUploaded(imageUrl, response.data.filename);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    onImageUploaded('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {currentImageUrl ? (
        <div className="image-preview">
          <img src={currentImageUrl} alt="Uploaded" className="preview-image" />
          <div className="image-actions">
            <button
              type="button"
              onClick={handleClick}
              className="btn btn-secondary btn-sm"
              disabled={disabled || uploading}
            >
              {uploading ? 'Uploading...' : 'Change Image'}
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="btn btn-danger btn-sm"
              disabled={disabled || uploading}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-dropzone ${dragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="upload-content">
            {uploading ? (
              <div className="upload-progress">
                <div className="spinner"></div>
                <p>Uploading image...</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <p><strong>Click to upload</strong> or drag and drop</p>
                <p className="upload-hint">JPG, PNG, GIF, BMP, WebP (max 5MB)</p>
              </>
            )}
          </div>
        </div>
      )}

      {error && <div className="upload-error">{error}</div>}

      <style jsx>{`
        .image-upload-container {
          margin: 1rem 0;
        }

        .upload-dropzone {
          border: 2px dashed #e0e6ed;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: #fafbfc;
        }

        .upload-dropzone:hover:not(.disabled) {
          border-color: #3498db;
          background: #f8f9fa;
        }

        .upload-dropzone.drag-over {
          border-color: #3498db;
          background: #ebf3fd;
        }

        .upload-dropzone.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-content p {
          margin: 0;
          color: #7f8c8d;
        }

        .upload-content strong {
          color: #2c3e50;
        }

        .upload-hint {
          font-size: 0.9rem;
        }

        .upload-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .image-preview {
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          overflow: hidden;
        }

        .preview-image {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          display: block;
        }

        .image-actions {
          padding: 1rem;
          background: #f8f9fa;
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .upload-error {
          background: #fee;
          color: #c0392b;
          padding: 0.75rem;
          border-radius: 4px;
          border: 1px solid #fadbd8;
          margin-top: 0.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;