
import React from 'react';
import { Button } from '../ui/Button';

interface NavProps {
  onToolSelect: (tool: any) => void;
  activeTool: string;
}

export const Navigation: React.FC<NavProps> = ({ onToolSelect, activeTool }) => {
  const menuItems = [
    { id: 'search', label: 'Home' },
    { id: 'generator', label: 'AI Generator' },
    { id: 'appraisal', label: 'Appraisal' },
    { id: 'geo', label: 'Geo Tools' },
    { id: 'whois', label: 'WHOIS' },
    { id: 'bulk', label: 'Bulk' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between glass-card px-8 py-3 border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black">C</div>
            <span className="text-xl font-extrabold tracking-tighter">Crypto<span className="text-white/60">Domains</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onToolSelect(item.id)}
                className={`text-sm font-medium transition-colors ${
                  activeTool === item.id ? 'text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-white/40 hover:text-white hidden sm:block">Sign up</button>
            <Button size="sm">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
