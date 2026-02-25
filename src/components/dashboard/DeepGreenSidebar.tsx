'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
  Leaf
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

export default function DeepGreenSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  // Start with collapsed false (open) by default
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-emerald-800"
      >
        {mobileOpen ? <X className="w-4 h-4 text-emerald-800" /> : <Menu className="w-4 h-4 text-emerald-800" />}
      </button>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Optimized width: 220px expanded, 64px collapsed - OPEN BY DEFAULT */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-gradient-to-b from-emerald-900 via-green-900 to-teal-900 shadow-xl transition-all duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ width: collapsed ? 64 : 220 }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        
        <div className="relative z-10 flex flex-col h-full text-white">
          {/* Logo area - compact */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 h-14 border-b border-emerald-700/30`}>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-400 rounded-lg flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5 text-emerald-900" />
                </div>
                <span className="text-sm font-semibold text-white">SEO CMS</span>
              </div>
            )}
            {collapsed && (
              <div className="w-6 h-6 bg-emerald-400 rounded-lg flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-emerald-900" />
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1 rounded-lg hover:bg-emerald-800/50 transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Navigation - compact */}
          <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-3 py-2 rounded-lg transition-all group relative ${
                    isActive ? 'bg-emerald-500/20' : 'hover:bg-emerald-800/50'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${collapsed ? '' : 'mr-3'} ${
                    isActive ? 'text-emerald-300' : 'text-emerald-100/70'
                  }`} />
                  {!collapsed && (
                    <span className={`text-xs font-medium ${
                      isActive ? 'text-white' : 'text-emerald-100/70'
                    }`}>
                      {item.name}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-emerald-900 text-emerald-100 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-emerald-700 z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile - compact */}
          <div className={`p-3 border-t border-emerald-700/30 ${collapsed ? 'text-center' : ''}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
              <div className="w-7 h-7 bg-emerald-700/50 rounded-lg flex items-center justify-center backdrop-blur-sm border border-emerald-600/30 flex-shrink-0">
                <span className="text-white text-xs font-semibold">
                  {user.name ? getInitials(user.name) : 'U'}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-emerald-300/70 truncate">{user.email}</p>
                </div>
              )}
            </div>
            
            {!collapsed && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-emerald-800/50 hover:bg-emerald-700/50 rounded-lg text-emerald-100 hover:text-white transition-colors text-xs border border-emerald-700/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content padding - adjusts based on sidebar state */}
      <div className={`lg:pl-[220px] transition-all duration-300 ${collapsed ? 'lg:pl-16' : ''}`} />
    </>
  );
}
