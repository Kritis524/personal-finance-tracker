import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  FileText,
  Sun,
  Moon,
  LogOut,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen fixed left-0 top-0 bg-ink-900 text-paper-50 dark:bg-[var(--bg-sidebar)] border-r border-ink-700/50">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Wallet size={18} className="text-ink-900" />
        </div>
        <span className="font-bold text-lg text-white">PocketPal</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-ink-700/60 text-white'
                  : 'text-ink-400 hover:bg-ink-800 hover:text-paper-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-emerald-500" />
                )}
                <Icon size={18} strokeWidth={2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: theme toggle + user */}
      <div className="px-3 pb-4 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-400 hover:bg-ink-800 hover:text-paper-100 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="flex items-center gap-3 px-3 py-2 border-t border-ink-700/50 pt-4">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-ink-900 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-ink-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-md text-ink-400 hover:bg-ink-800 hover:text-coral-500 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;