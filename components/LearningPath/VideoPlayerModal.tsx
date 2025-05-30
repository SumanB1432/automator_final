"use client"
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X, AlertCircle, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    url: string;
  } | null;
  onVideoCompleted: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  video,
  onVideoCompleted
}) => {
  const [loadError, setLoadError] = useState(false);
  const [alternativeVideos, setAlternativeVideos] = useState<{title: string, url: string}[]>([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);

  useEffect(() => {
    // Reset states when a new video is loaded
    if (isOpen) {
      setLoadError(false);
      setAlternativeVideos([]);
    }
  }, [isOpen, video]);

  const handleVideoEnded = () => {
    onVideoCompleted();
  };

  const handleError = async () => {
    console.error("Video failed to load:", video?.url);
    setLoadError(true);
    
    if (video) {
      // Try to find alternative videos using Gemini
      await findAlternativeVideos(video.title);
    }
  };

  const findAlternativeVideos = async (videoTitle: string) => {
    setIsLoadingAlternatives(true);
    
    try {
      // Check if we have a Gemini API key
      const apiKey = localStorage.getItem('geminiApiKey');
      
      if (!apiKey) {
        console.log('No Gemini API key found, skipping alternative video search');
        setIsLoadingAlternatives(false);
        setAlternativeVideos([{
          title: 'Error: API Key Missing',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        }]);
        return;
      }
      
      const prompt = `
        I need to find alternative YouTube tutorial videos for a skill-learning platform. 
        The original video titled "${videoTitle}" is no longer available or cannot be embedded.
        Please suggest 3 alternative YouTube videos that teach similar content.
        
        Format your response as valid JSON with this structure:
        {
          "alternatives": [
            {
              "title": "Video Title 1",
              "url": "https://www.youtube.com/embed/VIDEO_ID_1"
            },
            {
              "title": "Video Title 2", 
              "url": "https://www.youtube.com/embed/VIDEO_ID_2"
            },
            {
              "title": "Video Title 3",
              "url": "https://www.youtube.com/embed/VIDEO_ID_3"
            }
          ]
        }
        
        Make sure the URLs use the embed format (youtube.com/embed/VIDEO_ID) and are for videos that are likely to be embeddable.
      `;
      
      // Call Gemini API
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAlternativeVideos([{
            title: 'Error: Invalid API Key',
            url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          }]);
          throw new Error('Invalid API Key');
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the text from the response
      let responseText = '';
      try {
        responseText = data.candidates[0].content.parts[0].text;
      } catch (e) {
        console.error('Error parsing Gemini response:', e);
        throw new Error('Invalid response format from Gemini');
      }
      
      // Extract the JSON part from the response
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                        responseText.match(/{[\s\S]*}/);
                        
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Gemini response');
      }
      
      let jsonStr = jsonMatch[0];
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonMatch[1];
      }
      
      // Parse the JSON
      const result = JSON.parse(jsonStr);
      
      if (result.alternatives && Array.isArray(result.alternatives)) {
        setAlternativeVideos(result.alternatives);
      }
    } catch (error) {
      console.error('Error finding alternative videos:', error);
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  if (!video) return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl">No Video Available</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-md">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <DialogDescription className="text-center mb-6">
            Sorry, we couldn't find any available or embeddable videos for this skill at the moment.<br />
            Please try searching for another skill or check back later.
          </DialogDescription>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Extract video ID for direct YouTube link
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(video.url);
  const directYouTubeLink = videoId ? `https://www.youtube.com/watch?v=${videoId}` : video.url;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-xl">{video.title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        {loadError ? (
          <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-md">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <DialogDescription className="text-center mb-6">
              Unable to load the embedded video. This might be due to content security restrictions from YouTube or the video is no longer available.
            </DialogDescription>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button 
                variant="default" 
                className="w-full"
                onClick={() => window.open(directYouTubeLink, '_blank')}
              >
                Try on YouTube
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onVideoCompleted}
              >
                Mark as Completed
              </Button>
            </div>
            
            {alternativeVideos.length > 0 && (
              <div className="mt-6 w-full">
                <Separator className="my-4" />
                <h3 className="font-medium text-center mb-4">Alternative Videos</h3>
                <div className="space-y-4">
                  {alternativeVideos.map((altVideo, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <h4 className="font-medium text-sm mb-2">{altVideo.title}</h4>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(altVideo.url.replace('/embed/', '/watch?v='), '_blank')}
                        >
                          <Youtube className="h-4 w-4 mr-2" /> Watch on YouTube
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {isLoadingAlternatives && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">Looking for alternative videos...</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
              <iframe
                src={video.url}
                title={video.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onEnded={handleVideoEnded}
                onError={handleError}
              />
            </div>
            <div className="flex justify-between space-x-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => window.open(directYouTubeLink, '_blank')}
              >
                <Youtube className="h-4 w-4 mr-2" /> Open in YouTube
              </Button>
              <Button onClick={onVideoCompleted}>
                Mark as Completed
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;
