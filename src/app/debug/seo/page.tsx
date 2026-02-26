'use client';

import { useState } from 'react';

export default function DebugSEOPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seo/analyze-all', {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/analytics/stats?userId=' + 
        (await fetch('/api/auth/session').then(r => r.json())).user?.id
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SEO Debug</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={runAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Run SEO Analysis on All Posts'}
        </button>

        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-4"
        >
          Fetch Stats
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {stats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Current Stats</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
