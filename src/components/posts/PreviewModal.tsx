'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    slug: string;
  };
}

export default function PreviewModal({ isOpen, onClose, post }: PreviewModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Post Preview</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-8 max-h-[80vh] overflow-y-auto">
              {/* Featured Image */}
              {post.featuredImage ? (
                <div className="mb-8 rounded-xl overflow-hidden border border-gray-200">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-auto"
                    onError={(e) => {
                      console.log('Preview image failed:', post.featuredImage);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="mb-8 w-full h-48 bg-emerald-50 rounded-xl border border-gray-200 flex items-center justify-center">
                  <span className="text-emerald-600">No featured image</span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title || 'Untitled Post'}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
                <span>By Author</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}</span>
                <span>•</span>
                <span className="font-mono">{post.slug || 'post-slug'}</span>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <div className="mb-8 p-4 bg-emerald-50 rounded-lg italic text-emerald-800 border-l-4 border-emerald-500">
                  {post.excerpt}
                </div>
              )}

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-emerald-600"
                dangerouslySetInnerHTML={{ 
                  __html: post.content || '<p class="text-gray-400">No content yet...</p>' 
                }} 
              />

              {/* Word Count */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
                <p>Word count: {post.content?.split(/\s+/).filter(w => w.length > 0).length || 0} words</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                Preview mode - How your post will look when published
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
