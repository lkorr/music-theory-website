// React Router API route

interface YouTubeLiveStream {
  id: string;
  url: string;
  title: string;
  thumbnailUrl: string;
}

interface CacheEntry {
  data: YouTubeLiveStream | null;
  timestamp: number;
}

// In-memory cache to reduce API calls
let cache: CacheEntry | null = null;
const CACHE_DURATION = 2.5 * 60 * 1000; // 2.5 minutes in milliseconds

export async function GET(): Promise<Response> {
  try {
    // Check if we have cached data that's still valid
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return new Response(
        JSON.stringify({ 
          isLive: !!cache.data,
          stream: cache.data,
          cached: true
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      return new Response(
        JSON.stringify({ 
          error: 'YouTube API credentials not configured',
          isLive: false,
          stream: null
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Search for live streams on the channel
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error('YouTube API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch YouTube data',
          isLive: false,
          stream: null
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    
    let liveStream: YouTubeLiveStream | null = null;

    if (data.items && data.items.length > 0) {
      const item = data.items[0]; // Get the first (most recent) live stream
      liveStream = {
        id: item.id.videoId,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || ''
      };
    }

    // Update cache
    cache = {
      data: liveStream,
      timestamp: Date.now()
    };

    return new Response(
      JSON.stringify({
        isLive: !!liveStream,
        stream: liveStream,
        cached: false
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error checking YouTube live status:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        isLive: false,
        stream: null
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}