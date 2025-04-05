import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the pathname changes
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array ensures effect runs only when pathname changes

  return null; // This component does not render anything
}

export default ScrollToTop;
