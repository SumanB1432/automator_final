import { Resume, JobDescription, Skill, Phase } from '@/types';

// Fallback implementation if AI analysis fails
export const extractSkillsFromText = (text: string): string[] => {
  // Simple implementation that looks for common tech skills
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'AWS',
    'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'GitLab',
    'Agile', 'Scrum', 'Project Management', 'Team Leadership',
    'REST API', 'GraphQL', 'Redux', 'State Management',
    'UI/UX Design', 'Figma', 'Adobe XD', 'Sketch',
    'Testing', 'Jest', 'Cypress', 'Selenium',
    'Machine Learning', 'AI', 'Data Science', 'Big Data',
    'DevOps', 'Cloud Computing', 'Serverless',
  ];
  // Case-insensitive matching
  return commonSkills.filter(skill =>
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
};

export const findSkillGaps = (
  resumeSkills: string[],
  jobSkills: string[]
): string[] => {
  // Convert all skills to lowercase for case-insensitive comparison
  const normalizedResumeSkills = resumeSkills.map(s => s.toLowerCase());
  // Find skills in job descriptions that are not in the resume
  return jobSkills.filter(
    skill => !normalizedResumeSkills.includes(skill.toLowerCase())
  );
};

// New function to fetch educational videos using Gemini AI
export const fetchEducationalVideos = async (skill: string): Promise<{
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration: string;
  viewCount: number;
  progress: number;
  isCompleted: boolean;
}[]> => {
  console.log(`fetchEducationalVideos called for skill: ${skill}`);
  try {
    // TODO: Implement actual video search API call here.
    // You will need an API key for a video search service (e.g., YouTube Data API).
    // Replace the mock response below with the actual API call and response processing.

    // Example placeholder for API call:
    // const response = await fetch(`YOUR_VIDEO_SEARCH_API_ENDPOINT?q=${skill}&key=${apiKey}`);
    // const data = await response.json();
    // Process 'data' to extract video information and return in the specified format.

    // Replace with your actual video search API key (e.g., YouTube Data API)
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY; // Or get it from a secure source
    // console.log('VITE_REACT_APP_YOUTUBE_API_KEY:', apiKey);
    // console.log('import.meta.env:', import.meta.env);
    if (!apiKey) {
      console.error('Video search API key is not configured.');
      return []; // Return empty if API key is missing
    }

    // Example using YouTube Data API v3 search endpoint
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(skill + ' tutorial')}&type=video&key=${apiKey}&maxResults=5`;

    const response = await fetch(youtubeApiUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('Error fetching videos:', data);
      return [];
    }

    const videos = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnailUrl: item.snippet.thumbnails.high.url,
      duration: 'N/A', // YouTube search results don't include duration directly, requires another API call
      viewCount: 0, // YouTube search results don't include view count directly
      progress: 0,
      isCompleted: false
    }));

    console.log(`Fetched videos for ${skill}:`, videos);

    return videos;
  } catch (error) {
    console.error(`Error fetching videos for ${skill}:`, error);
    // Fallback: Return empty array to avoid breaking UI
    return [];
  }
};

export const getVideoRecommendations = async (skills: string[]) => {
  const videoPromises = skills.map(skill =>
    fetchEducationalVideos(skill)
  );
  const videoResults = await Promise.all(videoPromises);
  return videoResults.flat();
};

export const createLearningPath = (missingSkills: string[]): Phase[] => {
  // Group skills into phases
  const fundamentalSkills = missingSkills.slice(0, Math.ceil(missingSkills.length / 3));
  const intermediateSkills = missingSkills.slice(
    Math.ceil(missingSkills.length / 3),
    Math.ceil(missingSkills.length * 2 / 3)
  );
  const advancedSkills = missingSkills.slice(Math.ceil(missingSkills.length * 2 / 3));
  // Create phases with empty skills (videos will be added later)
  return [
    {
      id: 'phase-1',
      name: 'Fundamental Skills',
      description: 'Master these core skills first to build a strong foundation',
      skills: fundamentalSkills.map((skillName, index) => ({
        id: `skill-${index + 1}`,
        name: skillName,
        videos: [],
        isCompleted: false,
      })),
      isUnlocked: true,
      isCompleted: false,
      progress: 0
    },
    {
      id: 'phase-2',
      name: 'Intermediate Skills',
      description: 'Build upon your foundation with these intermediate-level skills',
      skills: intermediateSkills.map((skillName, index) => ({
        id: `skill-${fundamentalSkills.length + index + 1}`,
        name: skillName,
        videos: [],
        isCompleted: false,
      })),
      isUnlocked: false,
      isCompleted: false,
      progress: 0
    },
    {
      id: 'phase-3',
      name: 'Advanced Skills',
      description: 'Master these advanced skills to stand out from other candidates',
      skills: advancedSkills.map((skillName, index) => ({
        id: `skill-${fundamentalSkills.length + intermediateSkills.length + index + 1}`,
        name: skillName,
        videos: [],
        isCompleted: false,
      })),
      isUnlocked: false,
      isCompleted: false,
      progress: 0
    }
  ];
};

// Helper function to get mock video data for a skill
export const getMockVideosForSkill = (skillName: string) => {
  // Deprecated: Return empty array to prevent dummy videos
  return [];
};

// New function to analyze text using Gemini AI, including video recommendations
export const analyzeWithGeminiAI = async (
  resumeText: string,
  jobDescriptions: string[]
): Promise<{
  resumeSkills: string[],
  jobSkills: string[],
  missingSkills: string[]
}> => {
  try {
    const apiKey = localStorage.getItem('geminiApiKey');
    console.log('Retrieved API Key:', apiKey);

    if (!apiKey) {
      console.error('No API key found in localStorage');
      alert('Please enter your Gemini API key in the settings page');
      throw new Error('No API key found');
    }
    if (!/^[A-Za-z0-9-_]{39}$/.test(apiKey)) {
      console.error('Invalid API key format:', apiKey);
      alert('Invalid API key format - Please check your Gemini API key in settings');
      throw new Error('Invalid API key format');
    }

    const prompt = `
      I need to analyze a resume and job descriptions to identify skills and skill gaps.

      RESUME TEXT:
        ${resumeText}

      JOB DESCRIPTIONS:
        ${jobDescriptions.join('\n\n---\n\n')}

      Please extract and return the following in a JSON format:
      1. All skills mentioned in the resume
      2. All skills required in the job descriptions
      3. Skills that appear in the job descriptions but are missing from the resume

      Format your response as valid JSON with these keys:
      {
        "resumeSkills": ["skill1", "skill2", ...],
        "jobSkills": ["skill1", "skill2", ...],
        "missingSkills": ["skill1", "skill2", ...]
      }
    `;

    // Mock Gemini AI response (replace with actual API call in production)
    const resumeSkills = extractSkillsFromText(resumeText);
    const allJobSkills = jobDescriptions
      .flatMap(text => extractSkillsFromText(text))
      .filter((skill, index, self) => self.indexOf(skill) === index);
    const missingSkills = findSkillGaps(resumeSkills, allJobSkills);

    // In production, replace with actual Gemini API call
    /*
    const response = await fetch('https://api.gemini.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, model: 'gemini-1.5-flash' })
    });
    const data = await response.json();
    const { resumeSkills, jobSkills, missingSkills } = JSON.parse(data.result);
    */

    return {
      resumeSkills,
      jobSkills: allJobSkills,
      missingSkills
    };
  } catch (error) {
    console.error('Error in Gemini analysis:', error);
    // Fallback to basic analysis
    const resumeSkills = extractSkillsFromText(resumeText);
    const allJobSkills = jobDescriptions
      .flatMap(text => extractSkillsFromText(text))
      .filter((skill, index, self) => self.indexOf(skill) === index);
    const missingSkills = findSkillGaps(resumeSkills, allJobSkills);
    return {
      resumeSkills,
      jobSkills: allJobSkills,
      missingSkills
    };
  }
};