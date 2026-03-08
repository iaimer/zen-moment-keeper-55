import { BookOpen, Calendar, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', label: '今日记录', icon: BookOpen },
  { path: '/calendar', label: '照片日历', icon: Calendar },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors active:scale-95 ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
        <button
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors active:scale-95 ${
            location.pathname === '/settings'
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">设置</span>
        </button>
      </div>
    </nav>
  );
}
