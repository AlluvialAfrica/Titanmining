import type { Metric } from 'web-vitals';
import { logger } from './logger';

/**
 * Reports Web Vitals metrics (CLS, INP, FCP, LCP, TTFB).
 * In production, these could be sent to an analytics endpoint.
 * In development, they are logged via the structured logger.
 */
export function reportWebVitals(onMetric?: (metric: Metric) => void) {
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    const handler = onMetric || ((metric: Metric) => {
      logger.debug(`[WebVital] ${metric.name}: ${Math.round(metric.value)}ms (rating: ${metric.rating})`);
    });

    onCLS(handler);
    onINP(handler);
    onFCP(handler);
    onLCP(handler);
    onTTFB(handler);
  });
}
