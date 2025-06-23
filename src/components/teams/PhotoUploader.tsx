// src/components/teams/PhotoUploader.tsx - TRADUCTIONS MISES À JOUR
import React, { useState } from 'react';
import { Camera, Upload, CheckCircle, X } from 'lucide-react';

interface PhotoUploaderProps {
  onPhotoSelect: (file: File | null) => void;
  translate: (key: string) => string;
  required?: boolean;
  currentPhoto?: string | null;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotoSelect,
  translate,
  required = false,
  currentPhoto = null
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    onPhotoSelect(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(currentPhoto);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onPhotoSelect(null);
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-300 mb-2">
        📸 {translate('teamPhoto')} {required && '*'}
      </label>
      
      {/* Zone d'upload */}
      <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            handleFileSelect(file);
          }}
          className="hidden"
          id="photo-upload"
        />
        
        {previewUrl ? (
          <div className="space-y-4">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="w-32 h-32 object-cover rounded-xl mx-auto border-2 border-purple-500/30"
            />
            <div className="flex justify-center gap-3">
              <label
                htmlFor="photo-upload"
                className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl cursor-pointer transition-colors flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {translate('changePhoto')}
              </label>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {translate('remove')}
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="photo-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Camera className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-purple-300 font-semibold">{translate('clickToSelectPhoto')}</p>
                <p className="text-gray-400 text-sm">JPG, PNG, WEBP {translate('accepted')}</p>
              </div>
            </div>
          </label>
        )}
      </div>

      {/* Message d'erreur/info */}
      {required && !selectedFile && !currentPhoto && (
        <div className="mt-2 flex items-center gap-2 text-orange-400 text-sm">
          <Upload className="w-4 h-4" />
          <span>{translate('photoRequiredForCompletion')}</span>
        </div>
      )}

      {/* Fichier sélectionné */}
      {selectedFile && (
        <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg text-xs">
          <p className="text-green-300">
            <strong>{translate('fileSelected')}:</strong> {selectedFile.name} 
            ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
          </p>
        </div>
      )}
    </div>
  );
};