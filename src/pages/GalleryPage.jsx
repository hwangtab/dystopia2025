import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Components
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';

// Static manifest of gallery images. We reference public/images/* directly so
// the build-time optimizer's WebP/AVIF siblings line up with OptimizedImage's
// extension swap. Numeric sort keeps 1.jpg ahead of 11.jpg.
const galleryImageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
const images = galleryImageNumbers.map((n) => `/images/${n}.jpg`);

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
    <ParallaxBackground className="min-h-screen pt-24 pb-16">
      {/* SEO Meta Tags */}
      <SEO
        title="갤러리 | 삼각전파사"
        description="삼각전파사의 Dystopia 2025 관련 이미지 갤러리. 앨범 아트워크, 공연 사진, 프로모 이미지 등을 확인하세요."
        keywords="삼각전파사 갤러리, Dystopia 2025 이미지, 앨범 커버, 공연 사진, 프로모 이미지"
        ogImage="https://www.dystopia2025.kr/images/book.jpg"
        ogImageWidth={1280}
        ogImageHeight={945}
        ogImageAlt="삼각전파사 Dystopia 2025 아트워크 갤러리"
        twitterCard="summary_large_image"
        canonical="/gallery"
      />

      {/* JSON-LD is injected statically at build time via
          scripts/prerender-meta.mjs. */}

      {/* Main Content */}
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
                <OptimizedImage
                  src={imagePath}
                  alt={`삼각전파사 Dystopia 2025 갤러리 이미지 ${index + 1}`}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  imgClassName="w-full h-full object-cover"
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
                <OptimizedImage
                  src={selectedImage}
                  alt={`삼각전파사 Dystopia 2025 갤러리 이미지 ${currentIndex + 1}`}
                  priority
                  imgClassName="max-w-full max-h-[90vh] object-contain block"
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
