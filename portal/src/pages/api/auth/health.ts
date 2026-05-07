import type { APIRoute } from 'astro';

export const prerender = false;

const jsonHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};

const supabaseUrl =
  import.meta.env.PUBLIC_SUPABASE_URL ??
  process.env.PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  '';

export const GET: APIRoute = async () => {
  if (!supabaseUrl) {
    return new Response(JSON.stringify({ available: false }), {
      status: 200,
      headers: jsonHeaders,
    });
  }

  try {
    const healthUrl = new URL('/auth/v1/health', supabaseUrl);
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });

    return new Response(JSON.stringify({ available: response.ok }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ available: false }), {
      status: 200,
      headers: jsonHeaders,
    });
  }
};
