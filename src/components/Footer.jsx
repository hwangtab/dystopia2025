import React, { useState, useRef } from 'react'; // Import useState, useRef
import emailjs from '@emailjs/browser'; // Import emailjs
import { Link } from 'react-router-dom';
import { FaInstagram, FaYoutube, FaBandcamp, FaSpotify, FaTwitter } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Import motion for messages

const FooterComponent = () => {
  const currentYear = new Date().getFullYear();
  const newsletterFormRef = useRef();

  // EmailJS Credentials (Should match ContactPage.jsx)
  const EMAILJS_SERVICE_ID = 'service_lop4659';
  const EMAILJS_NEWSLETTER_TEMPLATE_ID = 'template_wxwj093'; // Use the provided template ID
  const EMAILJS_PUBLIC_KEY = 'E5wHxyFgSkrjQhYVG';

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({
    submitted: false,
    success: false,
    message: '',
    loading: false
  });

  // Handler for the newsletter subscription form
  const handleNewsletterSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    if (!newsletterEmail) return;

    setNewsletterStatus({ loading: true, submitted: false, success: false, message: '' });

    const templateParams = {
      email: newsletterEmail,
      date: new Date().toLocaleDateString('ko-KR'), // Add date if needed
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NEWSLETTER_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
      .then((response) => {
        console.log('Footer Newsletter SUCCESS!', response.status, response.text);
        setNewsletterStatus({
          submitted: true,
          success: true,
          message: '구독 신청 완료!',
          loading: false
        });
        setNewsletterEmail(''); // Clear input on success
      }, (error) => {
        console.log('Footer Newsletter FAILED...', error);
        setNewsletterStatus({
          submitted: true,
          success: false,
          message: `오류: ${error.text || '서버 오류'}.`,
          loading: false
        });
      });
  };
  

  return (
    <footer className="bg-primary-dark py-12"> {/* Removed top border */}
      <div className="container-custom mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-blender text-white">
                <span className="text-accent-magenta">DYSTOPIA</span> {/* Use magenta */}
                <span className="text-accent-blue">2025</span> {/* Use blue */}
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              왜곡된 신디사이저와 그로테스크한 전자음향으로 현대 사회의 구조적 모순을 담아낸 'Dystopia 2025'는 디지털 시대의 새로운 민중음악을 개척했다는 점에서 의미가 크며, 1980년대 통기타가 아닌 2020년대 전자음으로 저항을 노래하는 이 앨범은 우리가 이미 살고 있는 디스토피아의 가장 정직한 초상화입니다.
            </p>
            <div className="flex space-x-4 mt-4">
              {/* Use magenta for social icon hover */}
              {/* Instagram Link */}
              <a href="https://www.instagram.com/hojin7576/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-magenta transition-colors hover:drop-shadow-[0_0_5px_var(--color-accent-magenta)]">
                <FaInstagram size={20} />
              </a>
              {/* Facebook Link Added */}
              <a href="https://www.facebook.com/trianglewaver23" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent-magenta transition-colors hover:drop-shadow-[0_0_5px_var(--color-accent-magenta)]">
                {/* Assuming you might need FaFacebook icon, import it if needed */}
                {/* <FaFacebook size={20} />  */}
                 {/* Placeholder text if icon not available */}
                 <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512" fill="currentColor"><path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z"/></svg>
              </a>
              {/* Removed YouTube, Bandcamp, Spotify, Twitter */}
            </div>
          </div>

          {/* Quick Links - Use blue for hover */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-white text-lg font-blender mb-4">바로가기</h3>
            <Link to="/" className="text-gray-400 hover:text-accent-blue transition-colors font-blender">HOME</Link>
            <Link to="/album" className="text-gray-400 hover:text-accent-blue transition-colors font-blender">ALBUM</Link>
            <Link to="/artist" className="text-gray-400 hover:text-accent-blue transition-colors font-blender">ARTIST</Link>
            <Link to="/events" className="text-gray-400 hover:text-accent-blue transition-colors font-blender">EVENTS</Link>
            <Link to="/gallery" className="text-gray-400 hover:text-accent-blue transition-colors font-blender">GALLERY</Link>
            <Link to="/media" className="text-gray-400 hover:text-accent-blue transition-colors font-blender">MEDIA</Link>
            <Link to="/contact" className="text-gray-400 hover:text-accent-blue transition-colors font-blender">CONTACT</Link>
          </div>

          {/* Newsletter - Use blue for focus ring and button */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-white text-lg font-blender mb-2">뉴스레터 구독</h3>
            <p className="text-gray-400 text-sm mb-2"> {/* Added mb-2 */}
              삼각전파사의 최신 소식과 공연 정보를 받아보세요.
            </p>

            {/* Newsletter Form Status Message */}
            {newsletterStatus.submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2 rounded-md mb-2 text-xs border ${
                  newsletterStatus.success
                    ? 'bg-accent-green/10 border-accent-green text-accent-green'
                    : 'bg-accent-pink/10 border-accent-pink text-accent-pink'
                }`}
              >
                {newsletterStatus.message}
              </motion.div>
            )}

            {/* Hide form on successful submission */}
            {!(newsletterStatus.submitted && newsletterStatus.success) && (
              <form ref={newsletterFormRef} onSubmit={handleNewsletterSubmit} className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-300"
                  required
                  disabled={newsletterStatus.loading} // Disable input while loading
                />
                <button
                  type="submit"
                  className={`bg-accent-blue text-primary-dark px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors font-medium ${newsletterStatus.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={newsletterStatus.loading}
                >
                  {newsletterStatus.loading ? (
                     <svg className="animate-spin h-5 w-5 text-primary-dark mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  ) : (
                    '구독하기'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} 삼각전파사 (Triangle Waver). All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-500 hover:text-white text-sm">개인정보처리방침</Link>
            <Link to="/terms" className="text-gray-500 hover:text-white text-sm">이용약관</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Footer = React.memo(FooterComponent); // Wrap with React.memo

export default Footer;
