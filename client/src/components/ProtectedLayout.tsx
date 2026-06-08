import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />
      <div
        className="flex min-h-screen flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '16rem' : '5rem' }}
      >
        <Navbar isSidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedLayout;