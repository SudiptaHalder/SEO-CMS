'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Users,
  Sparkles,
  PlusCircle,
  FolderTree,
  Tags,
} from 'lucide-react';

// Create context for sidebar state
interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

interface SidebarProps {
  user: {
    name?: string;
    email?: string;
    role?: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['Posts']);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Base navigation items
  const baseNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Posts',
      icon: FileText,
      children: [
        { name: 'All Posts', href: '/dashboard/posts', icon: FileText },
        { name: 'Add New', href: '/dashboard/posts/new', icon: PlusCircle },
        { name: 'Categories', href: '/dashboard/categories', icon: FolderTree },
        { name: 'Tags', href: '/dashboard/tags', icon: Tags },
      ],
    },
   {
  name: 'SEO Analytics',
  href: '/admin/seo-analytics',
  icon: BarChart3,
},
    {
      name: 'AI Tools',
      href: '/dashboard/ai-tools',
      icon: Sparkles,
    },
    {
      name: 'Media Library',
      href: '/dashboard/media',
      icon: Image,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  // Add Users only for admin role
  const navigation = [...baseNavigation];
  if (user?.role === 'ADMIN') {
    navigation.push({
      name: 'Users',
      href: '/dashboard/users',
      icon: Users,
    });
  }

  const toggleGroup = (name: string) => {
    setOpenGroups(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const isChildActive = (children: any[]) => {
    return children?.some(child => isActive(child.href));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) return null;

  // Width constants
  const expandedWidth = 220;
  const collapsedWidth = 72;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-emerald-200"
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-emerald-600" />
        ) : (
          <Menu className="w-5 h-5 text-emerald-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? collapsedWidth : expandedWidth,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 left-0 bottom-0 z-50 bg-gradient-to-b from-emerald-900 via-green-900 to-teal-900 shadow-2xl hidden lg:block"
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 100, 0, 0.2), 0 8px 10px -6px rgba(0, 100, 0, 0.2)',
        }}
      >
        <div className="relative z-10 flex flex-col h-full text-white">
          {/* Logo area */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-3 h-16 border-b border-emerald-700/30`}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="w-7 h-7 bg-emerald-400 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-900 font-bold text-sm">S</span>
                </div>
                <span className="text-sm font-semibold text-white">SEO CMS</span>
              </motion.div>
            )}
            {collapsed && (
              <div className="w-7 h-7 bg-emerald-400 rounded-lg flex items-center justify-center">
                <span className="text-emerald-900 font-bold text-sm">S</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1 rounded-lg hover:bg-emerald-800/50 transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-700/30 scrollbar-track-transparent">
            {navigation.map((item) => {
              if (item.children) {
                const isOpen = openGroups.includes(item.name);
                const hasActiveChild = isChildActive(item.children);

                return (
                  <div key={item.name} className="mb-1">
                    <button
                      onClick={() => toggleGroup(item.name)}
                      className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 py-2 rounded-lg transition-colors ${
                        hasActiveChild
                          ? 'bg-emerald-800/50 text-white'
                          : 'text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {!collapsed && (
                          <span className="text-xs font-medium">{item.name}</span>
                        )}
                      </div>
                      {!collapsed && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>

                    <AnimatePresence initial={false}>
                      {!collapsed && isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => {
                              const active = isActive(child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                                    active
                                      ? 'bg-emerald-600 text-white'
                                      : 'text-emerald-100/60 hover:bg-emerald-800/30 hover:text-white'
                                  }`}
                                >
                                  <child.icon className="w-3.5 h-3.5" />
                                  <span className="text-xs">{child.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              const active = isActive(item.href!);
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-2 px-2 py-2 rounded-lg mb-1 transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {!collapsed && (
                    <span className="text-xs font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User profile */}
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
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-emerald-800/50 hover:bg-emerald-700/50 rounded-lg text-emerald-100 hover:text-white transition-colors text-xs border border-emerald-700/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -expandedWidth }}
            animate={{ x: 0 }}
            exit={{ x: -expandedWidth }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[220px] bg-gradient-to-b from-emerald-900 via-green-900 to-teal-900 shadow-2xl lg:hidden"
          >
            <div className="relative z-10 flex flex-col h-full text-white">
              <div className="flex items-center px-3 h-16 border-b border-emerald-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-400 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-900 font-bold text-sm">S</span>
                  </div>
                  <span className="text-sm font-semibold text-white">SEO CMS</span>
                </div>
              </div>
              <nav className="flex-1 px-2 py-4 overflow-y-auto">
                {navigation.map((item) => {
                  if (item.children) {
                    return (
                      <div key={item.name} className="mb-2">
                        <div className="flex items-center gap-2 px-2 py-2 text-emerald-100/70">
                          <item.icon className="w-4 h-4" />
                          <span className="text-xs font-medium">{item.name}</span>
                        </div>
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-emerald-100/60 hover:bg-emerald-800/30 hover:text-white text-xs"
                            >
                              <child.icon className="w-3.5 h-3.5" />
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-2 py-2 rounded-lg mb-1 text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white text-xs"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
