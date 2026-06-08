import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Bell, Menu } from 'lucide-react';

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggle: () => void;
}

const Navbar = ({ isSidebarOpen, onToggle }: NavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 px-6 py-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:text-white"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-300">Workspace Overview</p>
            <h1 className="text-2xl font-semibold text-white">Your hub for task velocity</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{user?.name || 'Guest'}</p>
              <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                {user?.role || 'User'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
