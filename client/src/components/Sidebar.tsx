import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings2,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Team', to: '/team', icon: Users },
    { label: 'Tasks', to: '/dashboard', icon: ClipboardList },
    { label: 'Settings', to: '/settings', icon: Settings2 },
  ];

  const developerLinks = [
    { label: 'My Tasks', to: '/dashboard', icon: ClipboardList },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  // Managers and Team Leads see management links; developers see their limited view
  const links = user?.role === 'manager' || user?.role === 'teamLead' ? adminLinks : developerLinks;

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen overflow-hidden border-r border-slate-800 bg-slate-900 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {isOpen ? (
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">DevSync</p>
            <h1 className="text-lg font-bold text-white">Workspace</h1>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white">D</div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition hover:bg-slate-700"
          aria-label="Toggle sidebar"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

     <nav className="mt-4 px-2">
  {links.map((link) => {
    const Icon = link.icon;
    return (
      <NavLink
        // שינוי כאן: הוספנו את ה-label לתוך ה-key כדי להבטיח ייחודיות
        key={`${link.to}-${link.label}`} 
        to={link.to}
        className={({ isActive }) =>
          `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
            isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`
        }
      >
        <Icon className="h-5 w-5" />
        {isOpen && <span>{link.label}</span>}
      </NavLink>
    );
  })}
</nav>

      <div className="absolute inset-x-0 bottom-0 border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {isOpen && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'Guest'}</p>
              <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-500">{user?.role || 'User'}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-600/20"
        >
          <LogOut className="h-4 w-4" />
          {isOpen && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
