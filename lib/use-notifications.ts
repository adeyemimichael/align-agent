/**
 * React hook for browser notifications
 * Handles permission requests and notification sending
 */

import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  sendBrowserNotification,
  areNotificationsSupported,
  getNotificationPermission,
} from './notifications';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(areNotificationsSupported());
    setPermission(getNotificationPermission());
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback(
    async (title: string, body: string, data?: any) => {
      if (permission !== 'granted') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          return false;
        }
      }
      return sendBrowserNotification(title, body, data);
    },
    [permission, requestPermission]
  );

  return {
    permission,
    supported,
    requestPermission,
    sendNotification,
  };
}
