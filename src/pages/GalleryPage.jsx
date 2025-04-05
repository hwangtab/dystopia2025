import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Components
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';

// Dynamically import images directly from the public/images directory
// Target only .jpg files and filter out specific ones like hero.jpg
const imageModules = import.meta.glob('/public/images/*.jpg', { eager: true });
const images = Object.keys(imageModules)
  .filter(path => !path.endsWith('/hero.jpg')) // Exclude hero.jpg
  .sort() // Sort paths alphabetically/numerically
  .map((path) => imageModules[path].default);

// Log the loaded image paths to the console for debugging
console.log('Loaded gallery images:', images);

const GalleryPage = () => {
  // Removed galleryImages state and useEffect
  const [selectedImage, setSelectedImage] = useState(null); // State for lightbox image path
  const [currentIndex, setCurrentIndex] = useState(0); // State for lightbox index

  // Handle image click to open lightbox
  const handleImageClick = (imagePath, index) => {
    setSelectedImage(imagePath);
    setCurrentIndex(index);
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Navigate to previous image
  const prevImage = () => {
    const newIndex = (currentIndex - 1 + images.length) % images.length; // Use images.length
    setSelectedImage(images[newIndex]); // Use images array
    setCurrentIndex(newIndex);
  };

  // Navigate to next image
  const nextImage = () => {
    const newIndex = (currentIndex + 1) % images.length; // Use images.length
    setSelectedImage(images[newIndex]); // Use images array
    setCurrentIndex(newIndex);
  };

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, currentIndex, images]); // Use images constant in dependency array

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
        staggerChildren: 0.05
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
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
            <GlitchText text="갤러리" intensity="low" interactive={true} />
          </h1>
          {/* Applied Pretendard font, italic style, and break-keep, removed period */}
          <p className="text-xl text-gray-300 max-w-3xl mx-auto font-pretendard italic break-keep"> 
            삼각전파사의 'Dystopia 2025' 앨범 아트워크, 공연 사진, 뮤직비디오 스틸컷을 감상하세요
          </p>
        </motion.div>

        {/* Simplified Gallery Grid */}
        {images.length > 0 ? ( // Use images directly
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Map over the dynamically loaded image paths */}
            {images.map((imagePath, index) => ( // Use images directly
              <motion.div
                key={index}
                variants={fadeInUp}
                className="aspect-square overflow-hidden rounded-lg border-2 border-transparent hover:border-accent-blue/50 hover:shadow-neon-blue transition-all duration-300 cursor-pointer"
                onClick={() => handleImageClick(imagePath, index)}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={imagePath}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Updated Empty State */
          <motion.div
            variants={fadeInUp}
            className="text-center py-16 mb-16" // Kept mb-16 here too for consistency if it's the last element
            initial="initial" // Add initial/animate for consistency if needed
            animate="animate"
          >
            <p className="text-gray-400 text-lg">
              표시할 이미지가 없습니다. (public/images/ 폴더 확인)
            </p>
          </motion.div>
        )}

        {/* Lightbox Implementation */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center p-4" /* Increased z-index */
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox} // Close on backdrop click
            >
              {/* Close Button */}
              {/* Close Button */}
              <button
                className="absolute top-16 right-4 text-white hover:text-accent-magenta transition-colors z-[110]" /* Moved down from top-4, Increased z-index */
                onClick={(e) => {
                  e.stopPropagation(); // Prevent backdrop click
                  closeLightbox();
                }}
                aria-label="Close image viewer"
              >
                <FaTimes size={24} />
              </button>

              {/* Previous Button */}
              <button
                className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 text-white hover:text-accent-magenta transition-colors z-[110] p-2 bg-black/30 rounded-full" /* Increased z-index */
                onClick={(e) => {
                  e.stopPropagation(); // Prevent closing lightbox
                  prevImage();
                }}
                aria-label="Previous image"
              >
                <FaChevronLeft size={24} />
              </button>

              {/* Next Button */}
              <button
                className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 text-white hover:text-accent-magenta transition-colors z-[110] p-2 bg-black/30 rounded-full" /* Increased z-index */
                onClick={(e) => {
                  e.stopPropagation(); // Prevent closing lightbox
                  nextImage();
                }}
                aria-label="Next image"
              >
                <FaChevronRight size={24} />
              </button>

              {/* Image Container */}
              <motion.div
                className="relative max-w-[90vw] max-h-[90vh]" /* Reverted max size to 90% */
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()} // Prevent closing lightbox when clicking image
              >
                <img
                  src={selectedImage}
                  alt={`Gallery image ${currentIndex + 1}`}
                  className="max-w-full max-h-[90vh] object-contain block" /* Reverted max-h here too */
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ParallaxBackground>
  );
};

export default GalleryPage;
