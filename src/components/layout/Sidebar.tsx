import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  BookOpen,
  Plus,
  Menu,
  X,
  Shield,
  Users,
  Clock,
  XCircle,
  LogOut,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../ui';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/use-cases', label: 'Use Cases', icon: Lightbulb },
  { to: '/prompts', label: 'Prompt Library', icon: BookOpen },
  { to: '/my-submissions', label: 'My Submissions', icon: FileText },
];

const quickActions = [
  { to: '/use-cases/new', label: 'New Use Case', icon: Plus },
  { to: '/prompts/new', label: 'New Prompt', icon: Plus },
];

const adminNavItems = [
  { to: '/admin', label: 'Admin Dashboard', icon: Shield },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/pending', label: 'Pending Reviews', icon: Clock },
  { to: '/admin/denied', label: 'Denied Items', icon: XCircle },
];

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, isAdmin, logout } = useAuth();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-md shadow-md"
        aria-label="Toggle navigation"
        style={{
          backgroundColor: 'var(--nx-void-panel)',
          color: 'var(--nx-text-secondary)',
          border: '1px solid rgba(0, 212, 255, 0.15)',
        }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-20 h-full w-64
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--nx-void-deep)',
          borderRight: '1px solid rgba(0, 212, 255, 0.15)',
        }}
      >
        {/* Logo / Brand */}
        <div
          className="flex items-center gap-3 px-5 h-16"
          style={{ borderBottom: '1px solid rgba(0, 212, 255, 0.15)' }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
            }}
          >
            <Lightbulb size={18} style={{ color: 'var(--nx-cyan-base)' }} />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                lineHeight: 1.25,
                color: 'var(--nx-cyan-base)',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                letterSpacing: '0.05em',
              }}
            >
              Pipeline
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                color: 'var(--nx-text-tertiary)',
              }}
            >
              From Idea to Impact
            </p>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium"
                  style={({ isActive }) => ({
                    transition: 'all 200ms ease-in-out',
                    color: isActive ? 'var(--nx-text-primary)' : 'var(--nx-text-secondary)',
                    backgroundColor: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--nx-cyan-base)' : '3px solid transparent',
                    marginLeft: '-1px',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={20}
                        style={{
                          color: isActive ? 'var(--nx-cyan-base)' : undefined,
                          filter: isActive ? 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.6))' : undefined,
                        }}
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quick actions */}
          <div className="mt-8">
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '12px' }} />
            <p
              className="px-3 mb-2"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--nx-text-ghost)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Quick Actions
            </p>
            <ul className="space-y-1">
              {quickActions.map((action) => (
                <li key={action.to}>
                  <NavLink
                    to={action.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium sidebar-nav-item"
                    style={{
                      color: 'var(--nx-text-secondary)',
                      transition: 'all 200ms ease-in-out',
                    }}
                  >
                    <action.icon size={18} />
                    {action.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin section - only visible to admins */}
          {isAdmin && (
            <div className="mt-8">
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '12px' }} />
              <p
                className="px-3 mb-2 flex items-center gap-1.5"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--nx-text-ghost)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                <Shield size={12} />
                Admin
              </p>
              <ul className="space-y-1">
                {adminNavItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/admin'}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium"
                      style={({ isActive }) => ({
                        transition: 'all 200ms ease-in-out',
                        color: isActive ? 'var(--nx-text-primary)' : 'var(--nx-text-secondary)',
                        backgroundColor: isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--nx-cyan-base)' : '3px solid transparent',
                        marginLeft: '-1px',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            size={18}
                            style={{
                              color: isActive ? 'var(--nx-cyan-base)' : undefined,
                              filter: isActive ? 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.6))' : undefined,
                            }}
                          />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer - User info + Logout */}
        {currentUser && (
          <div
            className="px-4 py-3"
            style={{ borderTop: '1px solid rgba(0, 212, 255, 0.15)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  backgroundColor: 'rgba(0, 212, 255, 0.1)',
                  color: 'var(--nx-cyan-base)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                }}
              >
                {currentUser.firstName[0]}
                {currentUser.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--nx-text-secondary)' }}
                >
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <div className="flex items-center gap-2">
                  <p
                    className="text-xs truncate"
                    style={{ color: 'var(--nx-text-ghost)' }}
                  >
                    {currentUser.email}
                  </p>
                  <Badge
                    variant={currentUser.role === 'admin' ? 'primary' : 'neutral'}
                    size="sm"
                  >
                    {currentUser.role}
                  </Badge>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors sidebar-nav-item"
              style={{
                color: 'var(--nx-text-secondary)',
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}

        {!currentUser && (
          <div
            className="px-5 py-4"
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
          >
            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--nx-text-ghost)',
              }}
            >
              Built for sharing AI wins
            </p>
          </div>
        )}
      </aside>

      <style>{`
        .sidebar-nav-item:hover {
          background-color: rgba(0, 212, 255, 0.05) !important;
          color: var(--nx-text-primary) !important;
        }
      `}</style>
    </>
  );
}

export { Sidebar };
