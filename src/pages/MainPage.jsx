  import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaCalendarAlt, FaHeadphones } from 'react-icons/fa';

// Components
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';
import TypingEffect from '../components/TypingEffect'; // Import TypingEffect

// Data
import albumData from '../data/albums.json';
import eventsData from '../data/events.json';
import newsData from '../data/news.json';

const MainPage = () => {
  const [scrollY, setScrollY] = useState(0);
  
  // Get featured events
  const featuredEvents = eventsData.events.filter(event => event.isFeatured).slice(0, 2);
  
  // Get featured news
  const featuredNews = newsData.news.filter(news => news.isFeatured).slice(0, 2);
  
  // Handle scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: (custom) => ({
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut",
        delay: custom * 0.2
      }
    })
  };
  
  return (
    <ParallaxBackground className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: `url('/images/hero.jpg')`, // Changed to hero image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // filter: 'blur(8px)', // Removed blur effect
            transform: `scale(1.1) translateY(${scrollY * 0.1}px)`
          }}
        />
        
        <div className="container-custom mx-auto relative z-10 pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-blender mb-4">
              <span className="block text-accent-magenta"> {/* Use magenta */}
                <GlitchText text="DYSTOPIA" intensity="extreme" /> {/* Changed intensity */}
              </span>
              <span className="block text-accent-blue"> {/* Use blue */}
                <GlitchText text="2025" intensity="extreme" /> {/* Changed intensity */}
              </span>
            </h1>
            {/* Apply TypingEffect to the paragraph */}
            <TypingEffect 
              text="거대 서사가 아닌 해체된 파편들의 콜라주로 이 시대의 모순을 표현하는 'Dystopia 2025'는 실험성과 대중성, 예술과 정치 사이의 좁은 길을 성공적으로 탐색하며, 그 과정에서 우리가 마주한 디스토피아의 실체를 가장 솔직하게 드러냅니다" // Removed period
              speed={30} // Adjust typing speed (milliseconds per character)
              // Applied Pretendard font, italic style, and break-keep
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto block font-pretendard italic break-keep" 
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            // Added flex flex-col items-center
            className="flex flex-col items-center gap-4 mt-12" 
          >
            {/* Button Row */}
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link to="/album" className="btn-primary text-lg px-8 py-3">
              <FaHeadphones className="inline-block mr-2" />
              앨범 듣기
            </Link>
            <Link to="/events" className="btn-secondary text-lg px-8 py-3">
                <FaCalendarAlt className="inline-block mr-2" />
                공연 일정
              </Link>
            </div> {/* This closing div belongs to the button row */}

            {/* Moved Arrow inside and adjusted classes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }} // Slightly increased delay
              className="mt-16 text-gray-400" // Removed absolute positioning, added margin-top
            >
              <div className="animate-bounce">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </motion.div> {/* This closes the arrow motion.div */}
        </motion.div> {/* This closes the button group + arrow motion.div */}
       </div> {/* This closes the container div */}
      </section>
      
      {/* Album Section */}
      <section className="py-24 bg-primary-dark bg-opacity-80">
        <div className="container-custom mx-auto">
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div variants={fadeInUp} custom={0}>
              <h2 className="text-3xl md:text-4xl font-blender mb-6">
                <GlitchText text="앨범 소개" intensity="low" interactive={true} />
              </h2>
              <div className="text-gray-300 space-y-4">
                <p>{albumData.album.description.split('\n\n')[0]}</p>
                <p>{albumData.album.description.split('\n\n')[1]}</p>
                <p className="text-accent-blue font-medium text-lg"> {/* Use blue */}
                  {albumData.album.description.split('\n\n')[2]}
                </p>
              </div>
              <div className="mt-8">
                <Link to="/album" className="btn-primary">
                  더 알아보기
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp} 
              custom={1}
              className="relative"
            >
              <div className="aspect-square relative overflow-hidden rounded-lg shadow-xl">
                <img 
                  src="/images/hero.jpg" 
                  alt="Dystopia 2025 Album Cover" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-60"></div>
                
                {/* Changed link to point to the main album page */}
                <Link 
                  to="/album" 
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-accent-magenta bg-opacity-80 flex items-center justify-center transform transition-transform group-hover:scale-110 shadow-lg group-hover:shadow-neon-magenta"> {/* Use magenta */}
                    <FaPlay className="text-white text-2xl ml-1" />
                  </div>
                </Link>
              </div>
              
              
              
              {/* Removed rounded-lg from release date box */}
              <div className="absolute -bottom-4 -right-4 bg-primary-dark p-4 rounded-lg shadow-lg border border-accent-blue/30"> {/* Use blue */} {/* Restored rounded-lg */}
                <div className="text-accent-blue font-blender">2025.05.02</div> {/* Use blue */} {/* Ensured font-blender */}
                <div className="text-white font-medium">정규 1집 발매</div>
              </div>
            </motion.div>
          </motion.div> {/* Restored missing closing motion.div tag for the grid */}
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-24 bg-primary-dark bg-opacity-80">
        <div className="container-custom mx-auto text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.h2 
              variants={fadeInUp}
              custom={0}
              className="text-3xl md:text-4xl font-blender mb-6"
            >
              <GlitchText text="우리는 이미 디스토피아에 살고 있는가?" intensity="medium" interactive={true} />
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              custom={1}
              // Applied Pretendard font, italic style, and break-keep
              className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 font-pretendard italic break-keep" 
            >
              삼각전파사의 'Dystopia 2025'와 함께 현대 한국 사회의 구조적 모순을 전자음으로 해부하는 여정에 동참하세요
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              custom={2}
            >
              <Link to="/contact" className="btn-primary text-lg px-8 py-3">
                뉴스레터 구독하기
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </ParallaxBackground>
  );
};

export default MainPage;
