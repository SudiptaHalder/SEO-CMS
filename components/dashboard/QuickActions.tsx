'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, Upload, BarChart3, Settings, Sparkles } from 'lucide-react';

const actions = [
  {
    title: 'New Post',
    description: 'Create fresh content',
    icon: FileText,
    href: '/dashboard/posts/new',
    color: 'from-blue-500 to-blue-600',
    gradient: 'from-blue-50 to-blue-100',
    textColor: 'text-blue-600'
  },
  {
    title: 'Upload Media',
    description: 'Add images & files',
    icon: Upload,
    href: '/dashboard/media',
    color: 'from-purple-500 to-purple-600',
    gradient: 'from-purple-50 to-purple-100',
    textColor: 'text-purple-600'
  },
  {
    title: 'SEO Analysis',
    description: 'Check your scores',
    icon: BarChart3,
    href: '/dashboard/analytics',
    color: 'from-green-500 to-green-600',
    gradient: 'from-green-50 to-green-100',
    textColor: 'text-green-600'
  },
  {
    title: 'AI Suggestions',
    description: 'Get smart insights',
    icon: Sparkles,
    href: '/dashboard/ai-suggestions',
    color: 'from-orange-500 to-orange-600',
    gradient: 'from-orange-50 to-orange-100',
    textColor: 'text-orange-600'
  }
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <motion.div
          key={action.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Link href={action.href}>
            <div className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${action.gradient} p-6 hover:shadow-lg transition-all duration-300`}>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
              
              <div className={`inline-flex p-3 rounded-xl bg-white shadow-sm mb-4 ${action.textColor}`}>
                <action.icon className="w-5 h-5" />
              </div>
              
              <h3 className={`font-semibold ${action.textColor} mb-1`}>
                {action.title}
              </h3>
              <p className="text-sm text-slate-600">
                {action.description}
              </p>

              {/* Decorative arrow */}
              <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity ${action.textColor}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
