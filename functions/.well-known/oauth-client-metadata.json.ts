// Cloudflare Pages Function — serves the ATProto OAuth client metadata
// JSON, varying its contents by the requesting Host so each app build
// variant can have its own client_id and reverse-DNS URL scheme.
//
// Why this exists: ATProto OAuth requires the redirect URI scheme to be
// the reverse-DNS of the client_id host. With three build variants
// (dev / beta / production) hosting metadata at three subdomains, each
// gets its own scheme and they can coexist on a single device.
// See ADR 0002 for the original tactical-workaround context.
//
// Routing:
//   GET https://dev.denazen.com/.well-known/oauth-client-metadata.json
//     → client_id: https://dev.denazen.com/.well-known/oauth-client-metadata.json
//     → redirect_uris: ["com.denazen.dev:/oauth-callback"]
//
//   GET https://beta.denazen.com/.well-known/oauth-client-metadata.json
//     → client_id: https://beta.denazen.com/.well-known/oauth-client-metadata.json
//     → redirect_uris: ["com.denazen.beta:/oauth-callback"]
//
//   GET https://denazen.com/.well-known/oauth-client-metadata.json
//     → client_id: https://denazen.com/.well-known/oauth-client-metadata.json
//     → redirect_uris: ["com.denazen:/oauth-callback"]
//
//   Any other host (preview *.pages.dev, localhost, www. variants):
//     → falls back to production metadata. Not used by any real client;
//       lets us sanity-check the function on the preview deployment.
//
// IMPORTANT: keep the static files at public/.well-known/oauth-client-
// metadata*.json deleted. Static files take priority over functions in
// Cloudflare Pages — if any of those exist, this function never runs.

interface VariantConfig {
  scheme: string;        // reverse-DNS of the host
  client_name: string;
  client_uri_host: string; // host used for client_id + client_uri
}

const VARIANTS: Record<string, VariantConfig> = {
  'dev.denazen.com':  { scheme: 'com.denazen.dev',  client_name: 'Denazen Dev',  client_uri_host: 'dev.denazen.com'  },
  'beta.denazen.com': { scheme: 'com.denazen.beta', client_name: 'Denazen Beta', client_uri_host: 'beta.denazen.com' },
  'denazen.com':      { scheme: 'com.denazen',      client_name: 'Denazen',      client_uri_host: 'denazen.com'      },
};

const DEFAULT_VARIANT: VariantConfig = VARIANTS['denazen.com'];

export const onRequestGet: PagesFunction = ({ request }) => {
  const host = new URL(request.url).hostname.toLowerCase();
  const variant = VARIANTS[host] ?? DEFAULT_VARIANT;
  const clientUriHost = variant.client_uri_host;

  const metadata = {
    client_id: `https://${clientUriHost}/.well-known/oauth-client-metadata.json`,
    client_name: variant.client_name,
    client_uri: `https://${clientUriHost}`,
    // logo / policy / tos all reference the production host — assets and
    // legal copy live on prod regardless of which variant is requesting.
    logo_uri: 'https://denazen.com/images/brand/fox-64.png',
    policy_uri: 'https://denazen.com/privacy/',
    tos_uri: 'https://denazen.com/terms/',
    application_type: 'native',
    redirect_uris: [`${variant.scheme}:/oauth-callback`],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    scope: 'atproto transition:generic transition:chat.bsky',
    token_endpoint_auth_method: 'none',
    dpop_bound_access_tokens: true,
  };

  return new Response(JSON.stringify(metadata, null, 2) + '\n', {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      // Short cache. Bluesky's OAuth client refetches metadata when it
      // builds an authorization request; a 5-min TTL is a good balance
      // between performance and "redeploys take effect quickly" if we
      // ever need to ship a fix.
      'Cache-Control': 'public, max-age=300, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
