import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import notificationService from '@/services/notificationService';
import { getInitials } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/students': 'Assigned Students',
  '/training': 'Training Management',

  '/completion': 'Training Completion',
  '/final-confirmation': 'Final Confirmation',
  '/feedback': 'Feedback',
  '/notifications': 'Notifications',
  '/reports': 'Reports',
  '/profile': 'Profile',
};

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const session = useAuthStore(state => state.session);
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    if (session) {
      notificationService.getUnreadCount().then(setUnread).catch(console.error);
    }
  }, [session]);

  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentPage = BREADCRUMBS[`/${pathParts[0]}`] || 'Page';

  return (
    <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center gap-4 px-4 flex-shrink-0 z-20 sticky top-0">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:text-slate-900"
      >
        <Menu size={20} />
      </Button>

      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center pr-3 border-r border-slate-200 mr-1">
        <img src="https://upload.wikimedia.org/wikipedia/en/0/01/Parul_University_logo.svg" alt="Parul University" className="h-6 w-auto object-contain" />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-slate-500 hidden sm:block">Portal</span>
        <ChevronRight size={14} className="text-slate-400 hidden sm:block" />
        <span className="font-semibold text-slate-900 truncate">{currentPage}</span>
        {pathParts.length > 1 && (
          <>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-500 truncate capitalize font-medium">
              {pathParts[1].replace(/-/g, ' ')}
            </span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Cell badge */}
        {session && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-700">{session.cellName}</span>
          </div>
        )}

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/notifications')}
          className="relative text-slate-500 hover:text-slate-900 rounded-full"
        >
          <Bell size={18} />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 flex items-center justify-center bg-blue-600 text-white text-[10px] rounded-full border-2 border-white">
              {unread > 9 ? '9+' : unread}
            </Badge>
          )}
        </Button>

        {/* Profile */}
        {session && (
          <button onClick={() => navigate('/profile')} className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full ml-1">
            <Avatar className="w-8 h-8 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                {getInitials(session.coordinatorName)}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
