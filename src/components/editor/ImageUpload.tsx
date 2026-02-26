'use client';

import { useState } from 'react';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
}

export default function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onImageUploaded(data.url);
      setPreview(null);
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setUploading(false);
      // Clear the input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            disabled={uploading}
          />
          <div className={`px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload Image'}
          </div>
        </label>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      {preview && (
        <div className="relative inline-block">
          <img 
            src={preview} 
            alt="Preview" 
            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
          />
          <button
            onClick={() => setPreview(null)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
