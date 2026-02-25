'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, X, Wand2, FileText, Hash, Edit } from 'lucide-react';

interface AIAssistantProps {
  content: string;
  keyword: string;
  onGenerateMetaDescription: (desc: string) => void;
  onGenerateTitle: (title: string) => void;
  onGenerateKeywords: (keywords: string[]) => void;
}

export default function AIAssistant({
  content,
  keyword,
  onGenerateMetaDescription,
  onGenerateTitle,
  onGenerateKeywords,
}: AIAssistantProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionType, setSuggestionType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMetaDescription = async () => {
    setLoading('meta');
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, keyword }),
      });
      
      if (!response.ok) throw new Error('Failed to generate');
      
      const data = await response.json();
      setSuggestion(data.description);
      setSuggestionType('meta');
    } catch (err) {
      setError('Failed to generate. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const generateTitle = async () => {
    setLoading('title');
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, keyword }),
      });
      
      if (!response.ok) throw new Error('Failed to generate');
      
      const data = await response.json();
      setSuggestion(data.title);
      setSuggestionType('title');
    } catch (err) {
      setError('Failed to generate. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const generateKeywords = async () => {
    setLoading('keywords');
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) throw new Error('Failed to generate');
      
      const data = await response.json();
      onGenerateKeywords(data.keywords);
    } catch (err) {
      setError('Failed to generate. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const applySuggestion = () => {
    if (suggestionType === 'meta') {
      onGenerateMetaDescription(suggestion || '');
    } else if (suggestionType === 'title') {
      onGenerateTitle(suggestion || '');
    }
    setSuggestion(null);
    setSuggestionType(null);
  };

  const cancelSuggestion = () => {
    setSuggestion(null);
    setSuggestionType(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <h3 className="text-sm font-medium text-gray-900">AI SEO Assistant</h3>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={generateMetaDescription}
          disabled={loading === 'meta'}
          className="flex items-center justify-center gap-1.5 p-2 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          {loading === 'meta' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileText className="w-3.5 h-3.5" />
          )}
          Meta Desc
        </button>
        
        <button
          onClick={generateTitle}
          disabled={loading === 'title'}
          className="flex items-center justify-center gap-1.5 p-2 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          {loading === 'title' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          SEO Title
        </button>
        
        <button
          onClick={generateKeywords}
          disabled={loading === 'keywords'}
          className="flex items-center justify-center gap-1.5 p-2 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
        >
          {loading === 'keywords' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Hash className="w-3.5 h-3.5" />
          )}
          Keywords
        </button>
        
        <button
          className="flex items-center justify-center gap-1.5 p-2 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
        >
          <Edit className="w-3.5 h-3.5" />
          Improve
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-50 text-red-600 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Suggestion Preview */}
      {suggestion && (
        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-xs text-emerald-900 mb-2 font-medium">Suggested:</p>
          <p className="text-xs text-gray-700 mb-3">{suggestion}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={applySuggestion}
              className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700"
            >
              <Check className="w-3 h-3" />
              Apply
            </button>
            <button
              onClick={cancelSuggestion}
              className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
