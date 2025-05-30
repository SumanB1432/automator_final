"use client";
import  { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, CheckCircle, PlayCircle, Plus } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Skill } from '@/types';
import VideoPlayerModal from './VideoPlayerModal';

interface SkillCardProps {
  skill: Skill;
  isLocked?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isLocked = false }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{
    id: string;
    title: string;
    url: string;
  } | null>(null);
  const { completeSkill, completeVideo } = useAppContext();
  
  const completedVideos = skill.videos.filter(video => video.isCompleted).length;
  const totalVideos = skill.videos.length;
  const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  const handleVideoClick = (video: any) => {
    setSelectedVideo({
      id: video.id,
      title: video.title,
      url: video.url
    });
  };

  const handleVideoComplete = () => {
    if (selectedVideo) {
      completeVideo(skill.id, selectedVideo.id);
      setSelectedVideo(null);
    }
  };

  return (
    <>
       <Card className={`skill-card ${skill.isCompleted ? 'border-success' : ''} ${isLocked ? 'opacity-60' : ''}`}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {skill.isCompleted && (
                <CheckCircle className="h-5 w-5 text-success" />
              )}
              <CardTitle className="text-lg">
                {skill.name}
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={skill.isCompleted ? "outline" : "default"}>
                {completedVideos}/{totalVideos} Videos
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                className="p-0 h-8 w-8"
                onClick={() => !isLocked && setExpanded(!expanded)}
                disabled={isLocked}
              >
                {expanded ? 
                  <ChevronUp className="h-5 w-5" /> : 
                  <ChevronDown className="h-5 w-5" />
                }
              </Button>
            </div>
          </div>
          
          <div className="w-full mt-2">
            <div className="progress-bar">
              <div 
                className="progress-value" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>
        
        {expanded && !isLocked && (
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-3 mt-2">
              {skill.videos.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No videos available for this skill at the moment.
                </div>
              ) : (
                skill.videos.map((video) => (
                  <div 
                    key={video.id}
                    className={`rounded-md border ${video.isCompleted ? 'bg-muted/40 border-success/30' : 'bg-white'}`}
                  >
                    <div className="flex items-start p-3">
                      <div 
                        className="flex-shrink-0 relative mr-3 overflow-hidden cursor-pointer" 
                        style={{ width: '120px', height: '67px' }}
                        onClick={() => handleVideoClick(video)}
                      >
                        <img 
                          src={video.thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover rounded-md" 
                        />
                        {video.isCompleted ? (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-white" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors">
                            <PlayCircle className="h-10 w-10 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium leading-tight line-clamp-2">
                          {video.title}
                        </h4>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <span className="mr-2">{video.duration}</span>
                          <span>{video.viewCount} views</span>
                        </div>
                      </div>
                      <Button 
                        variant={video.isCompleted ? "outline" : "default"}
                        size="icon"
                        className="ml-2"
                        onClick={() => handleVideoClick(video)}
                        disabled={video.isCompleted}
                      >
                        {video.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-primary" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        )}
      </Card>

    <VideoPlayerModal
      isOpen={!!selectedVideo}
      onClose={() => setSelectedVideo(null)}
      video={selectedVideo}
      onVideoCompleted={handleVideoComplete}
    />
  </>
);
};

export default SkillCard;
