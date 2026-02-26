'use client';

import { useState } from 'react';

interface ClientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export default function ClientImage({ src, alt, className = '', fallback }: ClientImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className={`${className} bg-emerald-100 flex items-center justify-center`}>
        <span className="text-emerald-600 font-medium text-sm">
          {alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={`${className} bg-gray-100 animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${!loaded ? 'hidden' : ''}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}
