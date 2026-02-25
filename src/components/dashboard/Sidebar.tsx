'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Image,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap
} from 'lucide-react';

interface SidebarProps {
  user: {
    name?: string;
    email?: string;
  };
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Posts', href: '/dashboard/posts', icon: FileText },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Media', href: '/dashboard/media', icon: Image },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-emerald-100"
      >
        {mobileOpen ? <X className="w-5 h-5 text-emerald-600" /> : <Menu className="w-5 h-5 text-emerald-600" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ 
          x: mobileOpen ? 0 : -300,
          width: collapsed ? 80 : 280
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed top-0 left-0 bottom-0 z-50 bg-gradient-to-b from-emerald-600 to-teal-700 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300`}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        
        <div className="relative z-10 flex flex-col h-full text-white">
          {/* Logo area */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-20 border-b border-white/10`}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xl font-bold">SEO CMS</span>
              </motion.div>
            )}
            {collapsed && (
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-600" />
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-3 py-3 rounded-xl transition-all group relative`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-white/20 rounded-xl"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  <item.icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'} relative z-10 ${
                    isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                  }`} />
                  {!collapsed && (
                    <span className={`relative z-10 text-sm font-medium ${
                      isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`}>
                      {item.name}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-emerald-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
          <div className={`p-4 border-t border-white/10 ${collapsed ? 'text-center' : ''}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-semibold">
                  {user.name ? getInitials(user.name) : 'U'}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/60 truncate">{user.email}</p>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/90 hover:text-white transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main content padding */}
      <div className={`lg:pl-[280px] transition-all duration-300 ${collapsed ? 'lg:pl-20' : ''}`} />
    </>
  );
}
