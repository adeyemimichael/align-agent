'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Monitor, Clock } from 'lucide-react';
import {
  requestNotificationPermission,
  areNotificationsSupported,
  getNotificationPermission,
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '@/lib/notifications';

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    fetchPreferences();
    setBrowserPermission(getNotificationPermission());
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPreferences }),
      });

      if (response.ok) {
        setPreferences(newPreferences);
      } else {
        console.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async () => {
    const newPreferences = { ...preferences, enabled: !preferences.enabled };
    await savePreferences(newPreferences);
  };

  const handleToggleTaskReminders = async () => {
    const newPreferences = {
      ...preferences,
      taskReminders: !preferences.taskReminders,
    };
    await savePreferences(newPreferences);
  };

  const handleCheckInTimeChange = async (time: string) => {
    const newPreferences = { ...preferences, checkInReminderTime: time };
    await savePreferences(newPreferences);
  };

  const handleTaskReminderMinutesChange = async (minutes: number) => {
    const newPreferences = { ...preferences, taskReminderMinutes: minutes };
    await savePreferences(newPreferences);
  };

  const handleToggleBrowserNotifications = async () => {
    const newEnabled = !preferences.channels.browser;

    // Request permission if enabling
    if (newEnabled && browserPermission !== 'granted') {
      const permission = await requestNotificationPermission();
      setBrowserPermission(permission);
      
      if (permission !== 'granted') {
        alert('Please enable notifications in your browser settings to receive reminders.');
        return;
      }
    }

    const newPreferences = {
      ...preferences,
      channels: { ...preferences.channels, browser: newEnabled },
    };
    await savePreferences(newPreferences);
  };

  const handleToggleEmailNotifications = async () => {
    const newPreferences = {
      ...preferences,
      channels: { ...preferences.channels, email: !preferences.channels.email },
    };
    await savePreferences(newPreferences);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const notificationsSupported = areNotificationsSupported();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-600" />
          Notification Settings
        </h2>
      </div>

      {!notificationsSupported && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Your browser does not support notifications. Email notifications will still work.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            {preferences.enabled ? (
              <Bell className="w-5 h-5 text-emerald-600" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-900">Enable Notifications</p>
              <p className="text-sm text-gray-600">
                Receive reminders for check-ins and tasks
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleEnabled}
            disabled={saving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enabled ? 'bg-emerald-600' : 'bg-gray-200'
            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {preferences.enabled && (
          <>
            {/* Check-in Reminder Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <label className="font-medium text-gray-900">
                  Daily Check-in Reminder
                </label>
              </div>
              <input
                type="time"
                value={preferences.checkInReminderTime}
                onChange={(e) => handleCheckInTimeChange(e.target.value)}
                disabled={saving}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p className="text-sm text-gray-600">
                You'll receive a motivational reminder referencing your goals
              </p>
            </div>

            {/* Task Reminders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <label className="font-medium text-gray-900">Task Reminders</label>
                </div>
                <button
                  onClick={handleToggleTaskReminders}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.taskReminders ? 'bg-emerald-600' : 'bg-gray-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.taskReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {preferences.taskReminders && (
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Remind me before task starts
                  </label>
                  <select
                    value={preferences.taskReminderMinutes}
                    onChange={(e) =>
                      handleTaskReminderMinutesChange(Number(e.target.value))
                    }
                    disabled={saving}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value={5}>5 minutes before</option>
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before</option>
                    <option value={30}>30 minutes before</option>
                  </select>
                </div>
              )}
            </div>

            {/* Notification Tone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-600" />
                <label className="font-medium text-gray-900">Notification Style</label>
              </div>
              <select
                value={preferences.tone || 'gentle'}
                onChange={(e) => {
                  const newPreferences = {
                    ...preferences,
                    tone: e.target.value as 'gentle' | 'direct' | 'minimal',
                  };
                  savePreferences(newPreferences);
                }}
                disabled={saving}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="gentle">Gentle - Supportive and encouraging</option>
                <option value="direct">Direct - Concise and to the point</option>
                <option value="minimal">Minimal - Brief and minimal text</option>
              </select>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Gentle:</strong> "How's it going? 💙 No pressure, just want to help you finish strong!"
                </p>
                <p>
                  <strong>Direct:</strong> "Task status? Done/Working/Stuck?"
                </p>
                <p>
                  <strong>Minimal:</strong> "Task done?"
                </p>
              </div>
            </div>

            {/* Notification Channels */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-medium text-gray-900">Notification Channels</h3>

              {/* Browser Notifications */}
              {notificationsSupported && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Browser Notifications
                      </p>
                      {browserPermission === 'denied' && (
                        <p className="text-xs text-red-600">
                          Permission denied. Enable in browser settings.
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleToggleBrowserNotifications}
                    disabled={saving || browserPermission === 'denied'}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.channels.browser ? 'bg-emerald-600' : 'bg-gray-200'
                    } ${
                      saving || browserPermission === 'denied'
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.channels.browser ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-xs text-gray-600">
                      Fallback when browser notifications fail
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleEmailNotifications}
                  disabled={saving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.channels.email ? 'bg-emerald-600' : 'bg-gray-200'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.channels.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {saving && (
        <div className="mt-4 text-sm text-gray-600 text-center">Saving...</div>
      )}
    </div>
  );
}
