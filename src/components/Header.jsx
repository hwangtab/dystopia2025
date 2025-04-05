import React, { useState, useEffect } from 'react'; // Import React
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes } from 'react-icons/fa';

// Components
import GlitchText from './GlitchText';

const HeaderComponent = () => { // Rename original component
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Navigation links
  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/album', label: 'ALBUM' },
    { path: '/artist', label: 'ARTIST' },
    { path: '/events', label: 'EVENTS' },
    { path: '/gallery', label: 'GALLERY' },
    { path: '/media', label: 'MEDIA' },
    { path: '/contact', label: 'CONTACT' }
  ];
  
  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Animation variants
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-primary-dark/80 backdrop-blur-md py-3 shadow-lg border-b border-accent-blue/30 shadow-neon-blue/20' // Use blue accent
          : 'bg-transparent py-5 border-b border-transparent' 
      }`}
    >
      <div className="container-custom mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-blender text-white">
            <span className="text-accent-magenta">DYSTOPIA</span> {/* Use magenta */}
            <span className="text-accent-blue">2025</span> {/* Use blue */}
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.path}
              to={link.path}
              className={`text-sm font-blender transition-colors ${ // Added font-blender, removed font-medium
                location.pathname === link.path 
                  ? 'text-accent-magenta' // Use magenta for active link
                  : 'text-gray-300 hover:text-accent-blue' // Use blue for hover
              }`}
            >
              <GlitchText text={link.label} interactive={true} intensity="low" glitchStyle="classic" />
            </Link>
          ))}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-primary-dark bg-opacity-95 backdrop-blur-md"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
          >
            <nav className="container-custom mx-auto px-4 py-6 flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className={`text-lg font-blender py-2 transition-colors ${ // Added font-blender, removed font-medium
                    location.pathname === link.path 
                      ? 'text-accent-magenta' // Use magenta for active link
                      : 'text-gray-300 hover:text-accent-blue' // Use blue for hover
                  }`}
                >
                  <GlitchText text={link.label} interactive={true} intensity="low" glitchStyle="classic" />
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Header = React.memo(HeaderComponent); // Wrap with React.memo

export default Header;
