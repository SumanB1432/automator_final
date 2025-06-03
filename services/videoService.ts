export const fetchEducationalVideos = async (skill: string): Promise<any[]> => {
  try {
    const res = await fetch(`/api/youtube?q=${encodeURIComponent(skill)}`);
    const data = await res.json();

    if (!data.items) return [];

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (err) {
    console.error(`Error fetching videos for ${skill}:`, err);
    return [];
  }
};
