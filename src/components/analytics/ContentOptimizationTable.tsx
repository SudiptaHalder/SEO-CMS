'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Edit,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  seoReport?: {
    score: number;
    suggestions: string[];
  } | null;
}

interface ContentOptimizationTableProps {
  userId: string;
}

export default function ContentOptimizationTable({ userId }: ContentOptimizationTableProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/analytics/posts?userId=${userId}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getMainIssue = (suggestions: string[]) => {
    if (!suggestions || suggestions.length === 0) return 'No issues detected';
    return suggestions[0];
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = [...posts];

    // Apply search
    if (search) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Apply score filter
    if (scoreFilter !== 'all') {
      filtered = filtered.filter(post => {
        const score = post.seoReport?.score || 0;
        if (scoreFilter === 'poor') return score < 60;
        if (scoreFilter === 'good') return score >= 60 && score < 80;
        if (scoreFilter === 'excellent') return score >= 80;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortField === 'score') {
        aValue = a.seoReport?.score || 0;
        bValue = b.seoReport?.score || 0;
      } else if (sortField === 'title') {
        aValue = a.title;
        bValue = b.title;
      } else if (sortField === 'updated') {
        aValue = new Date(a.updatedAt).getTime();
        bValue = new Date(b.updatedAt).getTime();
      } else {
        aValue = a.seoReport?.score || 0;
        bValue = b.seoReport?.score || 0;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [posts, search, statusFilter, scoreFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Content Optimization</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>

        <select
          value={scoreFilter}
          onChange={(e) => setScoreFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All Scores</option>
          <option value="poor">Poor (&lt;60)</option>
          <option value="good">Good (60-79)</option>
          <option value="excellent">Excellent (80+)</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-y border-gray-200">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-1">
                  Title
                  <SortIcon field="title" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-1">
                  SEO Score
                  <SortIcon field="score" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Main Issue
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => handleSort('updated')}
              >
                <div className="flex items-center gap-1">
                  Last Updated
                  <SortIcon field="updated" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSortedPosts.map((post) => {
              const score = post.seoReport?.score || 0;
              const needsOptimization = score < 60;

              return (
                <tr 
                  key={post.id} 
                  className={`hover:bg-gray-50/50 transition-colors ${
                    needsOptimization ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link 
                      href={`/dashboard/posts/${post.id}/edit`}
                      className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      post.status === 'PUBLISHED' 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {post.seoReport ? (
                      <span className={`text-xs px-2 py-1 rounded-full border ${getScoreColor(score)}`}>
                        {score}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not analyzed</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {needsOptimization && (
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {post.seoReport?.suggestions ? getMainIssue(post.seoReport.suggestions) : 'No data'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(post.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/posts/${post.id}/edit`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredAndSortedPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts match your filters</p>
        </div>
      )}
    </div>
  );
}
