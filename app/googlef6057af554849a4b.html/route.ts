export async function GET() {
  return new Response('google-site-verification: googlef6057af554849a4b.html', {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
