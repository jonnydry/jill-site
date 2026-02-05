// Vercel Serverless Function - Get Jonny's Currently Playing (Visual Only)
// Polls Spotify every 30 seconds, caches result

const SPOTIFY_CLIENT_ID = 'cf26eec6b65f463a9832d4c696752c58';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

let cachedData = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

async function getAccessToken() {
  if (!SPOTIFY_CLIENT_SECRET || !REFRESH_TOKEN) {
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
    console.error('Token refresh failed:', await response.text());
    return null;
  }
  
  const data = await response.json();
  return data.access_token;
}

async function fetchCurrentlyPlaying() {
  const now = Date.now();
  
  // Return cached if fresh
  if (cachedData && (now - lastFetch) < CACHE_TTL) {
    return cachedData;
  }
  
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return {
      is_playing: false,
      setup_required: true,
      message: 'Spotify not connected'
    };
  }
  
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  
  if (response.status === 204) {
    cachedData = { is_playing: false, message: 'Nothing playing' };
    lastFetch = now;
    return cachedData;
  }
  
  if (!response.ok) {
    return { is_playing: false, error: 'API error' };
  }
  
  const data = await response.json();
  
  cachedData = {
    is_playing: data.is_playing,
    track: data.item ? {
      name: data.item.name,
      artist: data.item.artists.map(a => a.name).join(', '),
      album: data.item.album.name,
      image: data.item.album.images[0]?.url,
      duration_ms: data.item.duration_ms,
      progress_ms: data.progress_ms
    } : null,
    timestamp: now
  };
  
  lastFetch = now;
  return cachedData;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    const data = await fetchCurrentlyPlaying();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ is_playing: false, error: error.message });
  }
}
