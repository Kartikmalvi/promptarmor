import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Shield, Search } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Demo', path: '/demo', icon: Shield },
    { name: 'Inspector', path: '/inspect', icon: Search },
  ];

  return (
    <div className="w-[240px] bg-[#111118] border-r border-border h-full flex flex-col justify-between shrink-0">
      <div>
        <div className="p-6">
          <h1 className="text-xl font-bold text-accent flex items-center gap-2">
            ⬡ PromptArmor
          </h1>
        </div>
        
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-gray-400 hover:text-white hover:bg-cards'
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 text-xs text-gray-500 font-medium border-t border-border/50 text-center opacity-50">
        v1.0 · beta
      </div>
    </div>
  );
}
