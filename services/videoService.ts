import axios from 'axios';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEO_DETAILS_URL = 'https://www.googleapis.com/youtube/v3/videos';

export const fetchEducationalVideos = async (skill: string) => {
  try {
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: 'snippet',
        q: `${skill} tutorial`, // Search query for skill tutorials
        type: 'video',
        maxResults: 5, // Number of results to return
        key: YOUTUBE_API_KEY
      }
    });

    const items = response.data.items;
    const videoIds = items.map((item: any) => item.id.videoId).join(',');

    // Fetch video details to check availability
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

    return items
      .filter((item: any) => {
        const isAvailable = availableIds.includes(item.id.videoId);
        const hasValidThumbnail = item.snippet.thumbnails && item.snippet.thumbnails.medium && item.snippet.thumbnails.medium.url && !item.snippet.thumbnails.medium.url.includes('hqdefault.jpg');
        const isNotLive = item.snippet.liveBroadcastContent !== 'live';
        const hasTitle = item.snippet.title && item.snippet.title.trim().length > 0;
        return isAvailable && hasValidThumbnail && isNotLive && hasTitle;
      })
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};