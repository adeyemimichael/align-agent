'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Target, 
  Plug, 
  Settings,
  Sparkles,
  LogOut
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  capacityScore?: number;
}

export default function Sidebar({ user, capacityScore }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Daily Check-in', href: '/checkin', icon: CheckCircle2 },
    { name: "Today's Plan", href: '/plan', icon: Calendar, badge: 'AI' },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Integrations', href: '/integrations', icon: Plug },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  const getModeFromScore = (score?: number) => {
    if (!score) return { label: 'Unknown', color: 'bg-gray-500' };
    if (score < 40) return { label: 'Recovery', color: 'bg-orange-500' };
    if (score >= 70) return { label: 'Deep Work', color: 'bg-emerald-500' };
    return { label: 'Balanced', color: 'bg-blue-500' };
  };

  const mode = getModeFromScore(capacityScore);

  return (
    <div className="flex flex-col h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-xl font-bold">Align</h1>
            <p className="text-xs text-gray-400">AI Productivity Agent</p>
          </div>
        </div>
      </div>

      {/* Capacity Score Badge */}
      {capacityScore !== undefined && (
        <div className="mx-4 mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Current Capacity</span>
            <span className={`text-xs px-2 py-1 rounded-full ${mode.color} text-white`}>
              {mode.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-emerald-400">{capacityScore}</span>
            <span className="text-sm text-gray-400">/100</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                active
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/50'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-emerald-400'}`} />
              <span className="font-medium">{item.name}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          {user?.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-10 h-10 rounded-full border-2 border-emerald-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
