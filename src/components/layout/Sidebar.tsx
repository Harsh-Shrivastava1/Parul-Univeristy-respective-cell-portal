import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, ClipboardList,
  CheckCircle, Star, Bell, BarChart3, UserCircle, LogOut, ChevronLeft,
  ChevronRight, Building2, X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/authService';
import notificationService from '@/services/notificationService';
import { cn, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { path: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/students',           icon: Users,           label: 'Assigned Students' },

  { path: '/completion',         icon: ClipboardList,   label: 'Training Completion' },
  { path: '/notifications',      icon: Bell,            label: 'Notifications' },
  { path: '/profile',            icon: UserCircle,      label: 'Profile' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const session = useAuthStore(state => state.session);
  const [unread, setUnread] = useState(0);

  React.useEffect(() => {
    if (session) {
      notificationService.getUnreadCount().then(setUnread).catch(console.error);
    }
  }, [session]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={cn(
        'flex items-center px-4 py-5',
        collapsed ? 'justify-center' : ''
      )}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
        ) : (
          <div className="flex flex-col">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/0/01/Parul_University_logo.svg" 
              alt="Parul University" 
              className="w-40 h-auto"
            />
          </div>
        )}
      </div>

      {/* Cell pill */}
      {!collapsed && session && (
        <div className="mx-3 mb-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-[9px] font-semibold text-blue-400 uppercase tracking-widest">Active Cell</p>
          <p className="text-sm font-bold text-blue-700 mt-0.5">{session.cellName}</p>
        </div>
      )}

      <Separator className="mx-3 mb-2 w-auto" />

      {/* Nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={cn('sidebar-link', active && 'active', collapsed && 'justify-center px-2')}
            >
              <item.icon size={17} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.path === '/notifications' && unread > 0 && (
                <Badge className="ml-auto h-5 min-w-5 px-1.5 bg-blue-600 text-white text-[10px] rounded-full">
                  {unread}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-3 mt-2 w-auto" />

      {/* User row */}
      <div className={cn('p-3 space-y-2', collapsed && 'flex flex-col items-center')}>
        {!collapsed && session && (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <Avatar className="w-8 h-8 border border-blue-100">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                {getInitials(session.coordinatorName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{session.coordinatorName}</p>
              <p className="text-[10px] text-slate-400 truncate">{session.coordinatorEmail}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            'w-full text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs',
            collapsed ? 'justify-center px-2' : 'justify-start gap-2'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={15} />
          {!collapsed && 'Logout'}
        </Button>
      </div>

      {/* Collapse toggle – desktop */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center hover:bg-slate-50 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} className="text-slate-500" /> : <ChevronLeft size={12} className="text-slate-500" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div
        className={cn(
          'hidden lg:flex flex-col relative h-full bg-white border-r border-slate-200 transition-all duration-300 flex-shrink-0',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 lg:hidden backdrop-blur-sm"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl lg:hidden"
            >
              <button
                onClick={onMobileClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
