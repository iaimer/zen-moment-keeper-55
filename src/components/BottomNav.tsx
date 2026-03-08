import { BookOpen, Image, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', label: '今日', icon: BookOpen },
  { path: '/calendar', label: '轨迹', icon: Image },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-card/90 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all active:scale-95 ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-primary/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
        <button
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all active:scale-95 ${
            location.pathname === '/settings'
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${location.pathname === '/settings' ? 'bg-primary/10' : ''}`}>
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold">设置</span>
        </button>
      </div>
    </nav>
  );
}
