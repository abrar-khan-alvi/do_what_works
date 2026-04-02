import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, FlaskConical, Calendar, Folder, LogOut, Bell, ChevronDown, User, Settings, CreditCard, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Logo } from './Logo';
import { useAccess } from './AccessContext';
import { useChat } from './ChatContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarExtra?: React.ReactNode;
  sidebarTopExtra?: React.ReactNode;
  sidebarBottomExtra?: React.ReactNode;
  noPadding?: boolean;
}

export const DashboardLayout = ({ children, sidebarExtra, sidebarTopExtra, sidebarBottomExtra, noPadding }: DashboardLayoutProps) => {
  const { isSubscribed, daysRemaining } = useAccess();
  const { sessions, currentSessionId, setCurrentSessionId, createNewSession, deleteSession } = useChat();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleSessionClick = (id: string) => {
    setCurrentSessionId(id);
    if (location.pathname !== '/daniel') {
      navigate('/daniel');
    }
  };

  const handleNewChat = () => {
    createNewSession();
    if (location.pathname !== '/daniel') {
      navigate('/daniel');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Daniel', path: '/daniel', icon: MessageCircle },
    { name: 'Result', path: '/result', icon: Folder },
    { name: 'Daily Log', path: '/daily-log', icon: Calendar },
    { name: 'Subscription', path: '/subscription', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen animate-gradient-bg text-white font-sans flex relative overflow-hidden">
      {/* Moving background glows */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#C75F33]/10 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#C75F33]/10 rounded-full blur-[120px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C75F33]/5 rounded-full blur-[150px] pointer-events-none animate-float-alt" />

      {/* Sidebar */}
      <div className="w-[280px] h-screen flex-shrink-0 flex flex-col border-r border-white/5 relative z-10 bg-[#0f1014]/50 backdrop-blur-sm">
        {/* Sidebar Header (Fixed) */}
        <div className="p-6 flex flex-col gap-6 flex-shrink-0">
          <Logo />
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl font-bold hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            <Plus size={18} />
            <span>New Strategist</span>
          </button>
        </div>

        {/* Sidebar Middle (Menu - Fixed) */}
        <div className="px-4 py-2 flex flex-col gap-1 flex-shrink-0">
          <div className="px-3 mb-2 text-[10px] font-bold text-[#8e9299] tracking-widest uppercase opacity-50">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive
                  ? 'bg-white text-black font-medium'
                  : 'text-[#8e9299] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Body (History - Scrollable) */}
        <div className="flex-1 px-4 py-2 flex flex-col min-h-0">
          {sidebarExtra && (
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2 flex-shrink-0">
              {sidebarExtra}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 h-full min-h-0">
            <div className="px-3 text-[10px] font-bold text-[#8e9299] tracking-widest uppercase opacity-50 flex-shrink-0">Recent History</div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSessionClick(s.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all flex-shrink-0 ${currentSessionId === s.id && location.pathname === '/daniel'
                    ? 'bg-white/10 text-white border border-white/5 shadow-md shadow-black/20'
                    : 'text-[#8e9299] hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <MessageSquare size={14} className={currentSessionId === s.id && location.pathname === '/daniel' ? 'text-white' : 'text-[#8e9299] flex-shrink-0'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate leading-tight">{s.title || 'New Chat'}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-lg text-[#e53935] transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          {sidebarBottomExtra && <div className="mt-2 flex-shrink-0">{sidebarBottomExtra}</div>}
        </div>

        {/* Sidebar Footer (Fixed) */}
        <div className="p-4 border-t border-white/5 bg-[#0f1014]/50 flex-shrink-0">
          <div className="mb-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-[10px] font-bold text-[#8e9299] uppercase tracking-widest mb-2 opacity-50">Subscription</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isSubscribed ? 'text-[#10b981]' : 'text-[#e53935]'}`}>
                  {isSubscribed ? `${daysRemaining} Days Left` : 'Inactive'}
                </span>
                {!isSubscribed && (
                  <Link to="/subscription" className="text-[10px] text-white underline underline-offset-2 hover:text-[#C75F33] transition-colors">
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 text-[#e53935] hover:bg-white/5 transition-all active:scale-95 text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-end px-8 flex-shrink-0">
          <div className="flex items-center gap-6">
            {/* Notification Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className={`transition-colors relative ${showNotifications ? 'text-white' : 'text-[#8e9299] hover:text-white'}`}
              >
                <Bell size={20} />
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#10b981] rounded-full border-2 border-[#0f1014]"></div>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-80 bg-[#1a1b1e]/95 border border-white/10 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-medium text-white text-sm">Notifications</h3>
                    <span className="text-[10px] font-medium text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full uppercase tracking-wider">2 New</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5">
                      <div className="text-sm text-white mb-1">Experiment completed</div>
                      <div className="text-xs text-[#8e9299]">Your "Morning Fasting" experiment has concluded.</div>
                      <div className="text-[10px] text-[#8e9299] mt-2">2 hours ago</div>
                    </div>
                    <div className="px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors">
                      <div className="text-sm text-white mb-1">Daily log reminder</div>
                      <div className="text-xs text-[#8e9299]">Don't forget to log your metrics for today.</div>
                      <div className="text-[10px] text-[#8e9299] mt-2">5 hours ago</div>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-white/5 text-center mt-1">
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-[#8e9299] hover:text-white transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="text-right">
                  <div className="text-sm font-medium text-white group-hover:text-white/90 transition-colors">Dr. Jon Kabir</div>
                  <div className="text-xs text-[#8e9299]">User</div>
                </div>
                <img
                  src="https://i.pravatar.cc/150?u=jon"
                  alt="Profile"
                  className="w-10 h-10 rounded-full border border-white/10"
                />
                <ChevronDown size={16} className={`text-[#8e9299] group-hover:text-white transition-all duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-56 bg-[#1a1b1e]/95 border border-white/10 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <div className="text-sm font-medium text-white">Dr. Jon Kabir</div>
                    <div className="text-xs text-[#8e9299]">jon.kabir@example.com</div>
                  </div>

                  <div className="px-2 flex flex-col gap-1">
                    <button
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3 py-2 text-sm text-[#8e9299] hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <User size={16} />
                      Profile Settings
                    </button>
                    <button
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full text-left px-3 py-2 text-sm text-[#8e9299] hover:text-white hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <Settings size={16} />
                      Preferences
                    </button>
                  </div>

                  <div className="px-2 mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full text-left px-3 py-2 text-sm text-[#e53935] hover:bg-white/5 rounded-lg transition-colors flex items-center gap-3"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <div className={`w-full flex-1 flex flex-col ${noPadding ? '' : 'p-6 md:p-8'} min-h-0 overflow-y-auto custom-scrollbar`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
