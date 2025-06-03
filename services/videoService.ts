export const fetchEducationalVideos = async (skill: string): Promise<any[]> => {
  try {
    const response = await axios.get(`/api/youtube?q=${encodeURIComponent(skill)}`);
    const items = response.data.items;

    if (!items || items.length === 0) {
      console.warn(`No videos found for ${skill}`);
      return [];
    }

    const videos = items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return videos;
  } catch (error: any) {
    console.error(`Error fetching videos for ${skill}:`, error);
    return [];
  }
};
