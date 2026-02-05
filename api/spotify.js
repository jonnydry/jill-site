// Vercel Serverless Function - Spotify Currently Playing
// Keeps client secret server-side, never exposed to browser

const SPOTIFY_CLIENT_ID = 'cf26eec6b65f463a9832d4c696752c58';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET; // Set in Vercel dashboard
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN; // Will be set after first auth

async function getAccessToken() {
  if (!SPOTIFY_CLIENT_SECRET) {
    throw new Error('SPOTIFY_CLIENT_SECRET not configured');
  }
  
  if (!REFRESH_TOKEN) {
    // No refresh token yet - need to do initial OAuth flow
    return null;
  }
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  
  const data = await response.json();
  return data.access_token;
}

async function getCurrentlyPlaying(accessToken) {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  });
  
  if (response.status === 204) {
    return { is_playing: false, message: 'Nothing playing' };
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch currently playing');
  }
  
  return await response.json();
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
      return res.status(503).json({
        error: 'Not configured',
        message: 'Spotify not yet connected. Visit /mood.html to connect.'
      });
    }
    
    const data = await getCurrentlyPlaying(accessToken);
    
    res.status(200).json({
      is_playing: data.is_playing,
      track: data.item ? {
        name: data.item.name,
        artist: data.item.artists.map(a => a.name).join(', '),
        album: data.item.album.name,
        image: data.item.album.images[0]?.url,
        duration_ms: data.item.duration_ms,
        progress_ms: data.progress_ms
      } : null,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Spotify API error:', error);
    res.status(500).json({ error: error.message });
  }
}
