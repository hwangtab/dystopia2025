import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlay } from 'react-icons/fa'; // Removed FaNewspaper, FaQuoteLeft

// Components
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';

// Data
import mediaData from '../data/media.json'; // Use media.json for videos
// Removed newsData import

const MediaPage = () => {
  // Removed activeTab state
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Animation variants (keep as they are)
  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Format date (keep as it is)
  const formatDate = (dateString) => {
    if (!dateString) return ''; // Handle cases where date might be missing
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('ko-KR', options);
  };

  // Helper function to convert YouTube watch URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
      // Return original URL if it's not a standard YouTube watch URL or ID extraction fails
      return url; 
    } catch (error) {
      console.error("Error parsing video URL:", error);
      return url; // Return original URL on error
    }
  };
  
  return (
    <ParallaxBackground className="pt-24 pb-16"> {/* Removed min-h-screen */}
      <motion.div
        className="container-custom mx-auto"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        {/* Page Header */}
        <motion.div variants={fadeInUp} className="mb-16 text-center"> {/* Changed mb-12 to mb-16 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-blender mb-6">
            <GlitchText text="미디어" intensity="low" interactive={true} /> {/* Changed title back */}
          </h1>
          {/* Applied Pretendard font, italic style, and break-keep, removed period */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-pretendard italic break-keep"> 
            삼각전파사의 뮤직비디오, 라이브 클립, 티저 등 다양한 영상을 감상하세요
          </p>
        </motion.div>

        {/* Removed Tab Navigation and Press Coverage Section */}

        {/* Video Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {mediaData.videos.length === 0 ? (
            <motion.div variants={fadeInUp} className="text-center py-16 text-gray-400">
              <p className="text-lg mb-2">등록된 영상이 없습니다.</p>
            </motion.div>
          ) : selectedVideo ? (
            // Video Player/Detail View
            <motion.div variants={fadeInUp} className="mb-12">
              <div className="bg-primary-dark bg-opacity-50 backdrop-blur-sm rounded-lg overflow-hidden">
                <div className="aspect-video w-full">
                  {/* Convert watch URL to embed URL */}
                  <iframe
                    src={getEmbedUrl(selectedVideo.videoUrl)}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-blender text-white mb-2">{selectedVideo.title}</h2>
                  <p className="text-accent-blue text-sm mb-4">{formatDate(selectedVideo.date)} {selectedVideo.duration ? `• ${selectedVideo.duration}` : ''}</p>
                  <p className="text-gray-300">{selectedVideo.description}</p>
                  <button
                    className="mt-4 text-gray-400 hover:text-accent-magenta transition-colors"
                    onClick={() => setSelectedVideo(null)}
                  >
                    ← 목록으로 돌아가기
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Video Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaData.videos.map((video) => (
                <motion.div
                  key={video.id}
                  variants={fadeInUp}
                  className="bg-primary-dark bg-opacity-50 backdrop-blur-sm rounded-lg overflow-hidden transition-all duration-300 ease-in-out cursor-pointer border border-transparent hover:border-accent-blue/50 hover:shadow-neon-blue overflow-hidden" // Added overflow-hidden
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="aspect-video relative overflow-hidden group">
                    <img
                      src={video.thumbnail || '/images/default-thumbnail.jpg'} // Add a default thumbnail
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-primary-dark bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-accent-magenta bg-opacity-80 flex items-center justify-center shadow-lg group-hover:shadow-neon-magenta">
                        <FaPlay className="text-white text-xl ml-1" />
                      </div>
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 px-2 py-1 rounded text-xs text-white">
                        {video.duration}
                      </div>
                    )}
                    {/* Optional: Add video type badge */}
                    {video.type && (
                       <div className="absolute top-2 left-2 bg-accent-blue px-2 py-1 rounded text-xs text-white">
                         {video.type}
                       </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-white mb-1 line-clamp-1">{video.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{formatDate(video.date)}</p>
                    <p className="text-gray-300 text-sm line-clamp-2">{video.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </motion.div>
    </ParallaxBackground>
  );
};

export default MediaPage;
