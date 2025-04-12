import React from 'react';

const VideoSection = () => {
  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-[#11011E] relative px-4 sm:px-10 lg:px-20 py-10 sm:py-20">
      {/* Video Card */}
      <div className="relative z-10 w-full max-w-[1200px] max-h-[800px] aspect-video bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[24px] overflow-hidden shadow-xl">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/z6JgvamQCb0?rel=0"
          title="Demo Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </section>
  );
};

export default VideoSection;
