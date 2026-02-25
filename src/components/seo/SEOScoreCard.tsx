'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SEOScoreCardProps {
  score: number;
  checks: {
    titleLength: { passed: boolean; message: string };
    metaDescription: { passed: boolean; message: string };
    keywordDensity: { passed: boolean; message: string };
    headings: { passed: boolean; message: string };
    internalLinks: { passed: boolean; message: string };
    imageAlt: { passed: boolean; message: string };
    slugQuality: { passed: boolean; message: string };
    readability: { passed: boolean; message: string };
  };
  wordCount: number;
  readingTime: number;
}

export default function SEOScoreCard({ score, checks, wordCount, readingTime }: SEOScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = () => {
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreMessage = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Needs Work';
  };

  const passedCount = Object.values(checks).filter(check => check.passed).length;
  const totalChecks = Object.values(checks).length;

  return (
    <div className="space-y-4">
      {/* Score Circle */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="48"
              cy="48"
            />
            <motion.circle
              className={getScoreColor().replace('text', 'stroke')}
              strokeWidth="8"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="48"
              cy="48"
              initial={{ strokeDasharray: `0 251.2` }}
              animate={{ strokeDasharray: `${(score / 100) * 251.2} 251.2` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-900">{getScoreMessage()}</p>
          <p className="text-xs text-gray-500">
            {passedCount}/{totalChecks} checks passed
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {wordCount} words · {readingTime} min read
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Overall Score</span>
          <span className={getScoreColor()}>{score}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getScoreBg()}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2 mt-4">
        {Object.entries(checks).map(([key, check]) => (
          <div key={key} className="flex items-start gap-2 text-xs">
            {check.passed ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={check.passed ? 'text-gray-700' : 'text-gray-600'}>
                {check.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
