'use client';

import { useState } from 'react';
import { User, Shield, Palette } from 'lucide-react';
import NotificationSettings from './NotificationSettings';

interface SettingsClientProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkModeToggle = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    
    // Apply dark mode to document
    if (newValue) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Account</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={user.name || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
          <p className="text-sm text-gray-500">
            Account information is managed through your Google account.
          </p>
        </div>
      </div>

      {/* Notifications */}
      <NotificationSettings />

      {/* Privacy & Data */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Privacy & Data</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-900 mb-2">Data Storage</p>
            <p className="text-sm text-gray-600">
              Your check-in data, goals, and plans are securely stored in our database. Integration tokens are encrypted.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">AI Processing</p>
            <p className="text-sm text-gray-600">
              Your capacity data is sent to Google Gemini AI to generate personalized daily plans. No data is stored by Gemini.
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">Third-Party Integrations</p>
            <p className="text-sm text-gray-600">
              When you connect Todoist or Google Calendar, we only access the data necessary to sync tasks and create calendar events.
            </p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-pink-50 rounded-lg">
            <Palette className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-900 mb-3">Theme</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-500">Switch between light and dark theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-amber-800">
                🚧 <strong>Dark Mode:</strong> UI components are being optimized for dark theme. Toggle to preview!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
