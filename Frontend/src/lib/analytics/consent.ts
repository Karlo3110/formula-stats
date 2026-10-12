/** localStorage key holding the visitor's cookie-banner choice. */
export const CONSENT_STORAGE_KEY = 'fs-cookie-consent';

export type ConsentChoice = 'accepted' | 'declined';

type ConsentState = 'granted' | 'denied';

type GtagConsent = (command: 'consent', action: 'update', params: { analytics_storage: ConsentState }) => void;

declare global {
  interface Window {
    gtag?: GtagConsent;
  }
}

/** Analytics cookies are allowed only after the visitor accepts the banner. */
export function analyticsConsentFor(choice: ConsentChoice | null): ConsentState {
  return choice === 'accepted' ? 'granted' : 'denied';
}

/** Tells Google Analytics (if loaded) about a new banner choice. */
export function applyAnalyticsConsent(choice: ConsentChoice): void {
  window.gtag?.('consent', 'update', { analytics_storage: analyticsConsentFor(choice) });
}
