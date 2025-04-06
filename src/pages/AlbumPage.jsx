import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';

// Components
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';
import AudioPlayer from '../components/AudioPlayer';

// Data
import albumData from '../data/albums.json';

const AlbumPage = () => {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false); // State for triggering autoplay
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleTrackSelect = (track, autoPlay = false) => { // Add autoPlay parameter
    setSelectedTrack(track);
    setShouldAutoPlay(autoPlay); // Set autoplay based on button click
  };
  
  const handleTrackEnd = () => {
    // Find the next track
    const currentIndex = albumData.album.tracks.findIndex(track => track.id === selectedTrack.id);
    if (currentIndex < albumData.album.tracks.length - 1) {
      setSelectedTrack(albumData.album.tracks[currentIndex + 1]);
    } else {
      setSelectedTrack(null);
    }
  };
  
  // Animation variants
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
        <motion.div variants={fadeInUp} className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-blender mb-6">
            <GlitchText text="Dystopia 2025" intensity="low" interactive={true} />
          </h1>
          {/* Applied Pretendard font, italic style, and break-keep, removed period */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-pretendard italic break-keep"> 
            음악적 실험성과 메시지 사이의 균형을 잃지 않은 흔치 않은 수작
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Album Cover and Info */}
          <div className="lg:col-span-1">
            <motion.div 
              className="sticky top-24"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-square relative overflow-hidden rounded-lg shadow-xl mb-6">
                <img 
                  src="/images/hero.jpg" 
                  alt="Dystopia 2025 Album Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-60"></div>
              </div>
              {/* Missing closing div for motion.div was here */}
              
              <div className="mb-6">
                {/* Temporarily replace GlitchText with plain text */}
                <h1 className="text-3xl mb-2 text-white"> {/* Ensure text color is visible */}
                  {albumData.album.title} 
                </h1>
                <p className="text-xl text-gray-300">{albumData.album.artist}</p>
                <p className="text-accent-blue mt-2"> {/* Use blue */}
                  {new Date(albumData.album.releaseDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {selectedTrack && (
                <div className="mb-6">
                  {/* Pass shouldAutoPlay and reset it after initial render */}
                  <AudioPlayer 
                    key={selectedTrack.id} // Keep key for re-mounting player on track change
                    track={selectedTrack} 
                    onEnded={handleTrackEnd} 
                    autoPlay={shouldAutoPlay} 
                    onAutoPlayComplete={() => setShouldAutoPlay(false)} // Callback to reset autoplay trigger
                  />
                </div>
              )}
              
              <div className="bg-primary bg-opacity-30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-lg font-blender mb-4 text-white">크레딧</h3>
                {albumData.album.credits.map((credit, index) => (
                  <div key={index} className="mb-2 last:mb-0">
                    <span className="text-gray-500">{credit.role}:</span>{' '}
                    <span className="text-gray-300">{credit.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Album Description and Tracks */}
          <div className="lg:col-span-2">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp} className="mb-12">
                <h2 className="text-2xl font-blender mb-6 text-accent-blue">앨범 소개</h2> {/* Use blue */}
                {albumData.album.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className={`mb-4 ${index === 2 ? 'text-accent-magenta font-medium text-lg' : 'text-gray-300'}`}> {/* Use magenta */}
                    {paragraph}
                  </p>
                ))}
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <h2 className="text-2xl font-blender mb-6 text-accent-blue">트랙리스트</h2> {/* Use blue */}
                <div className="space-y-4">
                  {albumData.album.tracks.map((track, index) => (
                    // Wrap the entire track item with Link
                    <Link 
                      key={track.id} 
                      to={`/album/track/${track.id}`} 
                      className="block" // Make Link a block element
                    >
                      <motion.div 
                        className={`bg-primary-dark bg-opacity-50 backdrop-blur-sm rounded-lg overflow-hidden transition-all duration-300 ease-in-out border border-transparent hover:border-accent-blue/50 hover:shadow-neon-blue ${ /* Reverted to blue neon */
                          selectedTrack?.id === track.id ? 'border-l-4 border-accent-magenta shadow-neon-magenta/40' : 'border-l-4 border-transparent' /* Reverted selected border to magenta */
                        } overflow-hidden`} // Added overflow-hidden
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center">
                        <div className="flex items-center mb-3 md:mb-0">
                          <div className="w-8 h-8 flex items-center justify-center mr-4">
                            {selectedTrack?.id === track.id ? (
                              <div className="w-3 h-3 bg-accent-magenta rounded-full animate-pulse"></div> /* Use magenta */
                            ) : (
                              <span className="text-accent-blue font-mono">{(index + 1).toString().padStart(2, '0')}</span> /* Use blue */
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden"> {/* Added overflow-hidden */}
                            <h3 className="text-lg font-blender text-white">{track.title}</h3>
                            <p className="text-gray-400 text-sm">{track.duration}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center ml-12 md:ml-auto space-x-3">
                          {/* Play button - stop propagation to prevent link navigation */}
                          <button 
                            onClick={(e) => {
                              e.preventDefault(); // Prevent Link navigation
                              e.stopPropagation(); // Stop event bubbling
                              handleTrackSelect(track, true); 
                            }} 
                            className="w-10 h-10 rounded-full bg-accent-magenta/20 hover:bg-accent-magenta/40 flex items-center justify-center transition-colors z-10 relative" /* Add z-index */
                            aria-label={`Play ${track.title}`}
                          >
                            <FaPlay className="text-accent-magenta" /> {/* Use magenta */}
                          </button>
                          
                          {/* Info icon (no longer a Link) - stop propagation */}
                          <div 
                            className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center transition-colors z-10 relative" /* Add z-index */
                            aria-label={`View details for ${track.title}`}
                            onClick={(e) => {
                              e.preventDefault(); // Prevent Link navigation
                              e.stopPropagation(); // Stop event bubbling
                              navigate(`/album/track/${track.id}`); // Navigate to track detail page
                            }}
                          >
                            <FaInfoCircle className="text-accent-blue" /> {/* Use blue */}
                          </div>
                        </div>
                      </div>
                      
                    </motion.div>
                  </Link>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ParallaxBackground>
  );
};

export default AlbumPage;
