'use client';

import { useState } from 'react';

export default function SimpleImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
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
        <div className={`${className} bg-gray-200 animate-pulse`} />
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
