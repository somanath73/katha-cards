// Fail closed: default to the production site rather than a wildcard, so a
// forgotten ALLOWED_ORIGIN secret can't open checkout to any origin.
const ALLOWED = Deno.env.get('ALLOWED_ORIGIN') || 'https://somanath73.github.io'

export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
