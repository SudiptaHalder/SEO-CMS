'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeBannerProps {
  userName: string;
}

export default function WelcomeBanner({ userName }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white"
    >
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6" />
          <span className="text-sm font-medium uppercase tracking-wider opacity-90">
            Welcome back
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {userName}! 👋
        </h1>
        
        <p className="text-lg opacity-90 max-w-2xl">
          Your content performance is looking great. Here's what's happening with your SEO today.
        </p>

        <div className="mt-6 flex gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-400"
              />
            ))}
          </div>
          <p className="text-sm opacity-80">
            <span className="font-semibold">+3 new posts</span> published this week
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4">
        <div className="w-64 h-64 rounded-full bg-white opacity-10 blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 -translate-y-1/2">
        <div className="w-32 h-32 rounded-full bg-white opacity-10 blur-2xl" />
      </div>
    </motion.div>
  );
}
