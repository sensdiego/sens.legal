import type { APIRoute } from 'astro';
import { ImageResponse } from '@vercel/og';

export const prerender = false;

type Node = string | { type: string; props: { style?: Record<string, string | number>; children?: Node | Node[] } };

function el(type: string, style: Record<string, string | number>, ...children: Node[]): Node {
  return {
    type,
    props: { style, children: children.length === 1 ? children[0] : children },
  };
}

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const cssUrl = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@700&display=swap';
  const cssResponse = await fetch(cssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const css = await cssResponse.text();
  const woff2 = css.match(/url\(([^)]+\.woff2)\)/)?.[1];
  if (!woff2) throw new Error('og.png: woff2 url not found in Google Fonts CSS');
  const fontResponse = await fetch(woff2);
  fontCache = await fontResponse.arrayBuffer();
  return fontCache;
}

export const GET: APIRoute = async () => {
  const fontData = await loadFont();

  const root = el(
    'div',
    {
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '88px',
      background: '#FAFAF8',
      fontFamily: 'Instrument Sans',
    },
    el(
      'div',
      { display: 'flex', flexDirection: 'column' },
      el(
        'div',
        { fontSize: 128, color: '#1A1A18', letterSpacing: '-0.02em', lineHeight: 1 },
        'Silo',
      ),
      el(
        'div',
        { fontSize: 24, color: '#5C5C58', marginTop: 12, letterSpacing: '0.02em' },
        'Technical Data Room',
      ),
    ),
    el(
      'div',
      { display: 'flex', flexDirection: 'column' },
      el(
        'div',
        { fontSize: 38, color: '#1A1A18', maxWidth: 900, lineHeight: 1.25 },
        'Legal reasoning is structural, auditable, and more than vector retrieval.',
      ),
      el(
        'div',
        {
          fontSize: 20,
          color: '#9C9C96',
          marginTop: 36,
          fontFamily: 'monospace',
          letterSpacing: '0.04em',
        },
        'silo.legal',
      ),
    ),
  );

  return new ImageResponse(root as never, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Instrument Sans', data: fontData, weight: 700, style: 'normal' }],
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/png',
    },
  });
};
