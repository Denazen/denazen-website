// Cloudflare Pages Function — serves the ATProto OAuth client metadata
// JSON, varying its contents by the requesting Host so each app build
// variant has its own client_id.
//
// Each variant advertises BOTH an HTTPS redirect_uri AND a reverse-DNS
// custom-scheme redirect_uri. They serve different routing paths and
// both are load-bearing:
//
//   - HTTPS (`https://<host>/oauth-callback`): dispatched by the OS via
//     Universal Links / App Links. The rescue path for Android default
//     browsers (Firefox, DuckDuckGo, etc.) where in-sheet redirect
//     capture fails. Pairs with the assertion files at
//     /.well-known/apple-app-site-association and /.well-known/
//     assetlinks.json. See `denazen` repo: docs/plan-app-links-
//     redirect.md.
//
//   - Custom scheme (`com.denazen.<variant>:/oauth-callback`): matched
//     by `expo-web-browser`'s `openAuthSessionAsync` (ASWebAuthen-
//     ticationSession on iOS, Chrome Custom Tabs on Android) for
//     **in-sheet redirect capture** — the auth sheet sees the URL
//     match its registered scheme and closes itself in-process. This
//     is the happy path on iOS and on Android with Chrome.
//
// IMPORTANT: do NOT remove the custom-scheme entry. `@atproto/oauth-
// client-expo` validates that `redirect_uris` contains at least one
// custom-scheme URI and refuses to start `signIn()` if not present
// (throws `TypeError: A redirect URI with a custom scheme is required
// for Expo OAuth`). The library's primary capture path needs scheme
// matching even when App Links is the OS-level fallback. This
// constraint is logged in CLAUDE.md "Known fragile internal API
// usage". Re-test sign-in after any version bump of the OAuth client
// library in case the assertion changes.
//
// Routing:
//   GET https://dev.denazen.com/.well-known/oauth-client-metadata.json
//     → client_id: https://dev.denazen.com/.well-known/oauth-client-metadata.json
//     → redirect_uris:
//         [ "https://dev.denazen.com/oauth-callback",
//           "com.denazen.dev:/oauth-callback" ]
//
//   GET https://beta.denazen.com/.well-known/oauth-client-metadata.json
//     → client_id: https://beta.denazen.com/.well-known/oauth-client-metadata.json
//     → redirect_uris:
//         [ "https://beta.denazen.com/oauth-callback",
//           "com.denazen.beta:/oauth-callback" ]
//
//   GET https://denazen.com/.well-known/oauth-client-metadata.json
//     → client_id: https://denazen.com/.well-known/oauth-client-metadata.json
//     → redirect_uris:
//         [ "https://denazen.com/oauth-callback",
//           "com.denazen:/oauth-callback" ]
//
//   Any other host (preview *.pages.dev, localhost, www. variants):
//     → falls back to production metadata. Not used by any real client;
//       lets us sanity-check the function on the preview deployment.
//
// IMPORTANT: keep the static files at public/.well-known/oauth-client-
// metadata*.json deleted. Static files take priority over functions in
// Cloudflare Pages — if any of those exist, this function never runs.

interface VariantConfig {
  scheme: string;        // reverse-DNS of the host — must contain a `.` per RFC 7595
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
    logo_uri: 'https://denazen.com/images/brand/penrose-64.png',
    policy_uri: 'https://denazen.com/privacy/',
    tos_uri: 'https://denazen.com/terms/',
    application_type: 'native',
    redirect_uris: [
      `https://${clientUriHost}/oauth-callback`,
      `${variant.scheme}:/oauth-callback`,
    ],
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
