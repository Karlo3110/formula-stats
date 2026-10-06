/**
 * External image hosts the app may load. Shared by next.config (image
 * optimizer allowlist) and the runtime URL check, so they cannot drift.
 */
export const DRIVER_MEDIA_HOST = 'media.formula1.com';
export const FLAG_HOST = 'flagcdn.com';

export const IMAGE_HOSTS: ReadonlyArray<string> = [DRIVER_MEDIA_HOST, FLAG_HOST];
