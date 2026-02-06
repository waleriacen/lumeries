import { NextRequest, NextResponse } from 'next/server';

// Create a Pin on Pinterest using the user's access token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, boardId, title, description, imageUrl, link } = body;

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 });
    }

    if (!boardId || !imageUrl) {
      return NextResponse.json({ error: 'Board ID and image URL required' }, { status: 400 });
    }

    // Create the pin
    const pinResponse = await fetch('https://api.pinterest.com/v5/pins', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        board_id: boardId,
        title: title || 'Mein Mondphasen-Poster',
        description: description || 'Erstellt mit Lumeries - Personalisiertes Mondposter kostenlos erstellen!',
        media_source: {
          source_type: 'image_url',
          url: imageUrl,
        },
        link: link || 'https://lumeries.com',
      }),
    });

    if (!pinResponse.ok) {
      const errorData = await pinResponse.text();
      console.error('Pinterest create pin error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create pin', details: errorData },
        { status: pinResponse.status }
      );
    }

    const pinData = await pinResponse.json();
    return NextResponse.json({ success: true, pin: pinData });
  } catch (err) {
    console.error('Create pin error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
