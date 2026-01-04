const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" color="black">
  <rect width="32" height="32" rx="8" fill="currentColor"/>
  <circle cx="16" cy="16" r="9" fill="none" stroke="white" stroke-width="2"/>
  <circle cx="21" cy="12" r="2" fill="white"/>
</svg>
`;

export async function GET() {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
