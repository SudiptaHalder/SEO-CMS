'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = '',
  fallbackClassName = ''
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <div className={`${fallbackClassName} bg-emerald-100 flex items-center justify-center`}>
        <ImageIcon className="w-5 h-5 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className={`${fallbackClassName} bg-gray-100 animate-pulse flex items-center justify-center`}>
          <div className="w-5 h-5 bg-gray-300 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          console.error('Image failed to load:', src);
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}
