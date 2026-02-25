'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface SEOScoreChartProps {
  data: Array<{
    score: number;
    analyzedAt: Date;
  }>;
}

export default function SEOScoreChart({ data }: SEOScoreChartProps) {
  const chartData = data.map(item => ({
    score: item.score,
    date: format(new Date(item.analyzedAt), 'MMM dd')
  })).reverse();

  const averageScore = data.reduce((acc, curr) => acc + curr.score, 0) / data.length || 0;
  const latestScore = data[0]?.score || 0;
  const trend = latestScore > averageScore ? 'up' : 'down';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">SEO Performance</h3>
          <p className="text-sm text-slate-500">Last 7 days</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">
            {trend === 'up' ? 'Improving' : 'Needs attention'}
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#colorGradient)"
              strokeWidth={3}
              dot={{ fill: '#6366f1', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#6366f1' }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-600 mb-1">Average Score</p>
          <p className="text-2xl font-bold text-slate-900">{Math.round(averageScore)}%</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-slate-600 mb-1">Latest Score</p>
          <p className="text-2xl font-bold text-slate-900">{Math.round(latestScore)}%</p>
        </div>
      </div>
    </motion.div>
  );
}
