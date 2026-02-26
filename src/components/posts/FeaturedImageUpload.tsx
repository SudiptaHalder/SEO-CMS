'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface FeaturedImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function FeaturedImageUpload({ value, onChange }: FeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      console.log('Upload successful:', data.url);
      onChange(data.url);
      setPreview(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
  };

  return (
    <div className="space-y-3">
      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-emerald-500 transition-colors">
          <input
            type="file"
            id="featured-image"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="featured-image"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                <span className="text-sm text-gray-600">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-emerald-600 mb-1">
                  Click to upload featured image
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, GIF, WebP up to 5MB
                </span>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={preview}
            alt="Featured"
            className="w-full h-48 object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {preview && preview.startsWith('/uploads/') && (
        <p className="text-xs text-emerald-600 break-all">
          ✓ Image uploaded: {preview}
        </p>
      )}
    </div>
  );
}
