import { CONSENT_STORAGE_KEY } from './consent';

/**
 * Inline bootstrap for gtag.js: sets the Consent Mode default from the stored
 * banner choice (denied until the visitor accepts) before any hit is sent,
 * then configures the property. `measurementId` must already be validated.
 */
export function buildGtagInit(measurementId: string): string {
  const id = JSON.stringify(measurementId);
  const key = JSON.stringify(CONSENT_STORAGE_KEY);
  return [
    'window.dataLayer = window.dataLayer || [];',
    'window.gtag = function gtag() { window.dataLayer.push(arguments); };',
    'var choice = null;',
    `try { choice = window.localStorage.getItem(${key}); } catch (e) {}`,
    "window.gtag('consent', 'default', { analytics_storage: choice === 'accepted' ? 'granted' : 'denied' });",
    "window.gtag('js', new Date());",
    `window.gtag('config', ${id});`,
  ].join('\n');
}
