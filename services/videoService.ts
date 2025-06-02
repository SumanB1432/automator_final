import axios from 'axios';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';

export const fetchEducationalVideos = async (skill: string): Promise<any[]> => {
  if (process.env.USE_MOCK_VIDEOS === 'true') {
    console.log(`Using mock videos for ${skill}`);
    return [
      {
        id: `mock-${skill}-1`,
        title: `Mock ${skill} Tutorial`,
        description: `Mock tutorial for ${skill}`,
        thumbnail: 'https://via.placeholder.com/120',
        url: `https://www.youtube.com/watch?v=mock-${skill}`
      }
    ];
  }

  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key is missing');
    return [];
  }

  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: `${skill} tutorial`,
        type: 'video',
        maxResults: 5,
        key: YOUTUBE_API_KEY
      }
    });

    const items = response.data.items;
    if (!items || items.length === 0) {
      console.warn(`No videos found for ${skill}`);
      return [];
    }

    const videoIds = items.map((item: any) => item.id.videoId).join(',');

    const detailsResponse = await axios.get(YOUTUBE_VIDEO_DETAILS_URL, {
      params: {
        part: 'status',
        id: videoIds,
        key: YOUTUBE_API_KEY
      }
    });

    const availableIds = detailsResponse.data.items
      .filter((item: any) => item.status.embeddable && item.status.privacyStatus === 'public')
      .map((item: any) => item.id);

    const videos = items
      .filter((item: any) => {
        const isAvailable = availableIds.includes(item.id.videoId);
        const hasValidThumbnail = item.snippet.thumbnails?.medium?.url && !item.snippet.thumbnails.medium.url.includes('hqdefault.jpg');
        const isNotLive = item.snippet.liveBroadcastContent !== 'live';
        const hasTitle = item.snippet.title?.trim().length > 0;
        return isAvailable && hasValidThumbnail && isNotLive && hasTitle;
      })
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

    console.log(`Fetched ${videos.length} videos for ${skill}`);
    return videos;
  } catch (error: any) {
    console.error(`Error fetching videos for ${skill}:`, {
      message: error.message,
      status: error.response?.status,
      errorCode: error.response?.data?.error?.code,
      errorMessage: error.response?.data?.error?.message,
      errors: error.response?.data?.error?.errors
    });
    return [];
  }
};