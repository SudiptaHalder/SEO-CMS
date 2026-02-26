'use client';

import { useSidebar } from "@/components/dashboard/Sidebar";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  
  return (
    <main 
      className="transition-all duration-300 min-h-screen"
      style={{
        marginLeft: collapsed ? '72px' : '220px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </main>
  );
}
