import { clientConfig } from '@/lib/config/client-config';

// Google's fixed certification-authority id for the AdSense ads.txt record.
const GOOGLE_CERTIFICATION_AUTHORITY_ID = 'f08c47fec0942fa0';

/**
 * Serves /ads.txt (IAB Authorized Digital Sellers). The record is generated
 * from the configured AdSense publisher id, so there is a single source of
 * truth and the file simply 404s until a publisher id is set — exactly the
 * pre-approval state Google expects, with no stale/placeholder seller line.
 */
export function GET(): Response {
  const publisherId = clientConfig.adsensePublisherId;

  if (!publisherId) {
    return new Response('Not found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const body = `google.com, ${publisherId}, DIRECT, ${GOOGLE_CERTIFICATION_AUTHORITY_ID}\n`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
