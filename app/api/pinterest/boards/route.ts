import { NextRequest, NextResponse } from 'next/server';

// Get user's Pinterest boards
export async function GET(request: NextRequest) {
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token required' }, { status: 401 });
  }

  try {
    const boardsResponse = await fetch('https://api.pinterest.com/v5/boards', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!boardsResponse.ok) {
      const errorData = await boardsResponse.text();
      console.error('Pinterest boards error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch boards', details: errorData },
        { status: boardsResponse.status }
      );
    }

    const boardsData = await boardsResponse.json();
    return NextResponse.json({ boards: boardsData.items || [] });
  } catch (err) {
    console.error('Fetch boards error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
