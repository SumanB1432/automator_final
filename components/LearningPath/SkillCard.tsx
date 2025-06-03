"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  PlayCircle,
  Plus,
} from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { Skill } from "@/types";
import VideoPlayerModal from "./VideoPlayerModal";

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

  const completedVideos = skill.videos.filter(
    (video) => video.isCompleted
  ).length;
  const totalVideos = skill.videos.length;
  const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  const handleVideoClick = (video: any) => {
    setSelectedVideo({
      id: video.id,
      title: video.title,
      url: video.url,
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
      <div className="flex flex-col bg-[#11011E]">
        <Card
          className={`skill-card bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] ${
            skill.isCompleted ? "border-[#0FAE96]" : ""
          } ${isLocked ? "opacity-60" : ""}`}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {skill.isCompleted && (
                  <CheckCircle className="h-5 w-5 text-[#0FAE96]" />
                )}
                <CardTitle className="text-lg sm:text-xl font-raleway font-bold text-[#ECF1F0]">
                  {skill.name}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  className={`text-xs font-inter ${
                    skill.isCompleted
                      ? "border-[rgba(255,255,255,0.05)] text-[#B6B6B6]"
                      : "bg-[#0FAE96] text-white"
                  }`}
                >
                  {completedVideos}/{totalVideos} Videos
                </Badge>
                <Button
                  className="p-0 h-10 w-10 text-[#B6B6B6] hover:text-[#0FAE96] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] transition-colors"
                  onClick={() => !isLocked && setExpanded(!expanded)}
                  disabled={isLocked}
                >
                  {expanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {expanded ? "Collapse" : "Expand"} skill details
                  </span>
                </Button>
              </div>
            </div>

            <div className="w-full mt-3">
              <div className="progress-bar h-2 bg-[rgba(255,255,255,0.05)] rounded-full">
                <div
                  className="progress-value h-2 bg-[#0FAE96] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardHeader>

          {expanded && !isLocked && (
            <CardContent className="pt-0 px-4 pb-4">
              <div className="space-y-3 mt-3">
                {skill.videos.length === 0 ? (
                  <div className="text-sm text-[#B6B6B6] font-inter text-center py-4">
                    No videos available for this skill at the moment.
                  </div>
                ) : (
                  skill.videos.map((video) => (
                    <div
                      key={video.id}
                      className={`rounded-md border border-[rgba(255,255,255,0.05)] ${
                        video.isCompleted
                          ? "bg-[rgba(15,174,150,0.05)] border-[rgba(15,174,150,0.2)]"
                          : "bg-[rgba(255,255,255,0.02)]"
                      }`}
                    >
                      <div className="flex items-start p-3">
                        <div
                          className="flex-shrink-0 relative mr-3 overflow-hidden cursor-pointer"
                          style={{ width: "120px", height: "67px" }}
                          onClick={() => handleVideoClick(video)}
                        >
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                          {video.isCompleted ? (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <CheckCircle className="h-8 w-8 text-[#ECF1F0]" />
                            </div>
                          ) : (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors">
                              <PlayCircle className="h-10 w-10 text-[#0FAE96]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-raleway font-semibold text-[#ECF1F0] leading-tight line-clamp-2">
                            {video.title}
                          </h4>
                          <div className="flex items-center mt-1 text-xs text-[#B6B6B6] font-inter">
                            <span className="mr-2">{video.duration}</span>
                            <span>{video.viewCount} views</span>
                          </div>
                        </div>
                        <Button
                          className={`ml-2 h-10 w-10 flex items-center justify-center ${
                            video.isCompleted
                              ? "border-[rgba(255,255,255,0.05)] text-[#B6B6B6]"
                              : "bg-[#0FAE96] text-white"
                          } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0FAE96] transition-colors`}
                          onClick={() => handleVideoClick(video)}
                          disabled={video.isCompleted}
                        >
                          {video.isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-[#0FAE96]" />
                          ) : (
                            <PlayCircle className="h-5 w-5 text-[#ECF1F0]" />
                          )}
                          <span className="sr-only">
                            {video.isCompleted
                              ? "Video completed"
                              : "Play video"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

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
