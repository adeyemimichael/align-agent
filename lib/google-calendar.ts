import { decryptToken } from './encryption';
import { ExternalAPIError } from './errors';

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  colorId?: string;
}

export interface CalendarEventResponse {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  htmlLink: string;
}

/**
 * Google Calendar API client
 */
export class GoogleCalendarClient {
  private accessToken: string;
  private refreshToken?: string;
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(encryptedAccessToken: string, encryptedRefreshToken?: string) {
    this.accessToken = decryptToken(encryptedAccessToken);
    if (encryptedRefreshToken) {
      this.refreshToken = decryptToken(encryptedRefreshToken);
    }
  }

  /**
   * Create a calendar event
   */
  async createEvent(
    calendarId: string = 'primary',
    event: CalendarEvent
  ): Promise<CalendarEventResponse> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalAPIError(
        'Google Calendar',
        `Failed to create event: ${response.status} ${response.statusText}`,
        { statusCode: response.status, errorText, event }
      );
    }

    return response.json();
  }

  /**
   * Update a calendar event
   */
  async updateEvent(
    eventId: string,
    event: CalendarEvent,
    calendarId: string = 'primary'
  ): Promise<CalendarEventResponse> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalAPIError(
        'Google Calendar',
        `Failed to update event: ${response.status} ${response.statusText}`,
        { statusCode: response.status, errorText, eventId }
      );
    }

    return response.json();
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalAPIError(
        'Google Calendar',
        `Failed to delete event: ${response.status} ${response.statusText}`,
        { statusCode: response.status, errorText, eventId }
      );
    }
  }

  /**
   * List events in a time range
   */
  async listEvents(
    timeMin: Date,
    timeMax: Date,
    calendarId: string = 'primary'
  ): Promise<CalendarEventResponse[]> {
    const url = new URL(`${this.baseUrl}/calendars/${calendarId}/events`);
    url.searchParams.set('timeMin', timeMin.toISOString());
    url.searchParams.set('timeMax', timeMax.toISOString());
    url.searchParams.set('singleEvents', 'true');
    url.searchParams.set('orderBy', 'startTime');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalAPIError(
        'Google Calendar',
        `Failed to list events: ${response.status} ${response.statusText}`,
        { statusCode: response.status, errorText, timeMin, timeMax }
      );
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Check for scheduling conflicts
   */
  async hasConflict(
    startTime: Date,
    endTime: Date,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    const events = await this.listEvents(startTime, endTime, calendarId);
    return events.length > 0;
  }
}

/**
 * Refresh Google OAuth access token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new ExternalAPIError(
      'Google Calendar',
      'Google OAuth credentials not configured',
      { missing: !clientId ? 'GOOGLE_CLIENT_ID' : 'GOOGLE_CLIENT_SECRET' }
    );
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ExternalAPIError(
      'Google Calendar',
      `Token refresh failed: ${response.status}`,
      { statusCode: response.status, errorText }
    );
  }

  return response.json();
}
