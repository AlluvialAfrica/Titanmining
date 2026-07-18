import { logger } from './logger';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
}

const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT || '';

/**
 * Track a user event for analytics/telemetry.
 * In production with an endpoint configured, events are sent via Beacon API.
 * Otherwise, events are logged via the structured logger.
 */
export function trackEvent(event: string, properties?: Record<string, string | number | boolean>) {
  const payload: AnalyticsEvent = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  logger.debug(`[Analytics] ${event}`, properties);

  if (ANALYTICS_ENDPOINT) {
    try {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    } catch {
      // Beacon failed silently - non-critical
    }
  }
}

// Pre-defined event names for consistency
export const AnalyticsEvents = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  REPORT_SUBMITTED: 'report_submitted',
  REPORT_QUEUED_OFFLINE: 'report_queued_offline',
  KPI_SUBMITTED: 'kpi_submitted',
  USER_CREATED: 'user_created',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  REGISTRATION_STARTED: 'registration_started',
  REGISTRATION_COMPLETED: 'registration_completed',
} as const;
