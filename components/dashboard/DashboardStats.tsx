'use client';

import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  avgSEOScore: number;
}

const StatCard = ({ icon: Icon, label, value, color, gradient }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg border border-slate-100"
  >
    <div className={`absolute inset-0 opacity-10 ${gradient}`} />
    <div className="relative z-10">
      <div className={`inline-flex p-3 rounded-xl ${color} bg-opacity-10 mb-4`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
    
    {/* Decorative circle */}
    <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-slate-100 to-transparent rounded-full opacity-50" />
  </motion.div>
);

export default function DashboardStats({ 
  totalPosts, 
  publishedPosts, 
  draftPosts, 
  avgSEOScore 
}: DashboardStatsProps) {
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const stats = [
    {
      icon: FileText,
      label: 'Total Posts',
      value: totalPosts,
      color: 'bg-blue-100',
      gradient: 'bg-gradient-to-br from-blue-400 to-blue-600'
    },
    {
      icon: CheckCircle,
      label: 'Published',
      value: publishedPosts,
      color: 'bg-green-100',
      gradient: 'bg-gradient-to-br from-green-400 to-green-600'
    },
    {
      icon: Clock,
      label: 'Drafts',
      value: draftPosts,
      color: 'bg-orange-100',
      gradient: 'bg-gradient-to-br from-orange-400 to-orange-600'
    },
    {
      icon: TrendingUp,
      label: 'Avg. SEO Score',
      value: `${Math.round(avgSEOScore)}%`,
      color: getScoreColor(avgSEOScore).split(' ')[1],
      gradient: `bg-gradient-to-br ${
        avgSEOScore >= 80 ? 'from-green-400 to-green-600' :
        avgSEOScore >= 60 ? 'from-yellow-400 to-yellow-600' :
        'from-red-400 to-red-600'
      }`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
