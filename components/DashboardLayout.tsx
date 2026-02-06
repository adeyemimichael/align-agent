'use client';

import { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import NotificationScheduler from './NotificationScheduler';

interface DashboardLayoutProps {
  children: ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  capacityScore?: number;
}

export default function DashboardLayout({ children, user, capacityScore }: DashboardLayoutProps) {
  const [notificationPreferences, setNotificationPreferences] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch notification preferences
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/notifications/preferences');
        if (response.ok) {
          const data = await response.json();
          setNotificationPreferences(data.preferences);
          setUserId(data.userId);
        }
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error);
      }
    };

    fetchPreferences();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} capacityScore={capacityScore} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      {/* Background notification scheduler */}
      {userId && notificationPreferences && (
        <NotificationScheduler userId={userId} preferences={notificationPreferences} />
      )}
    </div>
  );
}
