import { useState, useRef } from 'react'; // Import useRef
import emailjs from '@emailjs/browser'; // Import emailjs
import { motion } from 'framer-motion';
import { FaEnvelope, FaInstagram, FaYoutube, FaBandcamp, FaSpotify, FaTwitter } from 'react-icons/fa';

// Components
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';

const ContactPage = () => {
  const formRef = useRef(); // Ref for the main contact form
  const newsletterFormRef = useRef(); // Ref for the newsletter form

  // EmailJS Credentials (Replace with your actual IDs)
  const EMAILJS_SERVICE_ID = 'service_lop4659';
  const EMAILJS_TEMPLATE_ID = 'template_wxwj093';
  const EMAILJS_NEWSLETTER_TEMPLATE_ID = 'template_wxwj093'; // Use the provided template ID
  const EMAILJS_PUBLIC_KEY = 'E5wHxyFgSkrjQhYVG';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '', // Added phone
    service: '', // Added service
    subject: '', // Kept subject, though not in template - maybe add to message?
    message: '',
    newsletter: true // For the checkbox in the main form
  });

  const [contactFormStatus, setContactFormStatus] = useState({
    submitted: false,
    success: false,
    message: '',
    loading: false
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({
    submitted: false,
    success: false,
    message: '',
    loading: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }; // <-- Keep this one

  // Handler for the main contact form
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactFormStatus({ loading: true, submitted: false, success: false, message: '' });

    const currentDate = new Date().toLocaleDateString('ko-KR'); // Format date as needed

    // Prepare template params matching your EmailJS template
    const templateParams = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: `Subject: ${formData.subject}\n\n${formData.message}\n\nNewsletter Opt-in: ${formData.newsletter ? 'Yes' : 'No'}`, // Combine subject/newsletter into message if not separate fields in template
      date: currentDate,
      service: formData.service,
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
      .then((response) => {
         console.log('SUCCESS!', response.status, response.text);
         setContactFormStatus({
           submitted: true,
           success: true,
           message: '메시지가 성공적으로 전송되었습니다. 빠른 시일 내에 답변 드리겠습니다.',
           loading: false
         });
         // Reset form on success
         setFormData({
           name: '',
           email: '',
           phone: '',
           service: '',
           subject: '',
           message: '',
           newsletter: true
         });
      }, (error) => {
         console.log('FAILED...', error);
         setContactFormStatus({
           submitted: true,
           success: false,
           message: `메시지 전송에 실패했습니다: ${error.text || '서버 오류'}. 잠시 후 다시 시도해주세요.`,
           loading: false
         });
      });
  };

  // Handler for the newsletter subscription form
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return; // Basic validation

    setNewsletterStatus({ loading: true, submitted: false, success: false, message: '' });

    const templateParams = {
      email: newsletterEmail,
      date: new Date().toLocaleDateString('ko-KR'), // Add date if needed by template
    };

    // Use a different template ID for newsletter subscriptions
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NEWSLETTER_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY)
      .then((response) => {
        console.log('Newsletter SUCCESS!', response.status, response.text);
        setNewsletterStatus({
          submitted: true,
          success: true,
          message: '뉴스레터 구독 신청이 완료되었습니다!',
          loading: false
        });
        setNewsletterEmail(''); // Clear input on success
      }, (error) => {
        console.log('Newsletter FAILED...', error);
        setNewsletterStatus({
          submitted: true,
          success: false,
          message: `구독 신청 중 오류가 발생했습니다: ${error.text || '서버 오류'}.`,
          loading: false
        });
      });
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
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Page Header */}
          <motion.div variants={fadeInUp} className="mb-16 text-center"> {/* Changed mb-12 to mb-16 */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-blender mb-6">
              <GlitchText text="연락하기" intensity="low" interactive={true} />
            </h1>
            {/* Applied Pretendard font, italic style, and break-keep, removed period */}
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-pretendard italic break-keep"> 
              삼각전파사에게 메시지를 보내거나 뉴스레터를 구독하세요
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <div className="bg-primary-dark bg-opacity-50 backdrop-blur-sm rounded-lg p-6 md:p-8 overflow-hidden"> {/* Added overflow-hidden */}
                <h2 className="text-2xl font-blender mb-6 text-accent-blue">메시지 보내기</h2> {/* Use blue */}
                
                {/* Display Contact Form Success/Error Messages */}
                {contactFormStatus.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 border ${
                      contactFormStatus.success
                        ? 'bg-accent-green/10 border-accent-green text-accent-green'
                        : 'bg-accent-pink/10 border-accent-pink text-accent-pink'
                    }`}
                  >
                    {contactFormStatus.message}
                  </motion.div>
                )}

                {/* Hide form on successful submission */}
                {!(contactFormStatus.submitted && contactFormStatus.success) && (
                   <form ref={formRef} onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name Input */}
                      <div>
                        <label htmlFor="name" className="block text-gray-300 mb-2 font-medium">이름</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-300"
                          required
                        />
                      </div>
                      {/* Email Input */}
                      <div>
                        <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">이메일</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-300"
                          required
                        />
                      </div>
                      {/* Phone Input (Added) */}
                      <div>
                        <label htmlFor="phone" className="block text-gray-300 mb-2 font-medium">연락처</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-300"
                          // Not making required, adjust if needed
                        />
                      </div>
                      {/* Subject Selection (Changed from Inquiry Type) */}
                      <div>
                        <label htmlFor="service" className="block text-gray-300 mb-2 font-medium">주제</label>
                        <select
                          id="service" // Keep id/name as 'service' to match state and template variable
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-300 appearance-none"
                          required
                        >
                          <option value="" disabled>주제 선택...</option>
                          <option value="Booking Inquiry">공연 문의</option>
                          <option value="Collaboration Proposal">협업 제안</option>
                          <option value="Fan Message">팬 메시지</option>
                          <option value="Press Inquiry">언론 문의</option>
                          <option value="General Question">일반 질문</option>
                          <option value="Other">기타</option>
                        </select>
                      </div>
                    </div>

                    {/* Subject Input */}
                    <div>
                      <label htmlFor="subject" className="block text-gray-300 mb-2 font-medium">제목</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-300"
                          required
                        />
                      </div>

                    {/* Message Textarea */}
                    <div>
                      <label htmlFor="message" className="block text-gray-300 mb-2 font-medium">메시지</label>
                      <textarea
                        id="message"
                        name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows="5"
                          className="w-full bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue transition-all duration-300"
                          required
                        ></textarea>
                      </div>

                    {/* Newsletter Checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="newsletter"
                        name="newsletter"
                        checked={formData.newsletter}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-600 text-accent-magenta focus:ring-accent-magenta mr-2 cursor-pointer"
                      />
                      <label htmlFor="newsletter" className="text-gray-300 cursor-pointer">뉴스레터 업데이트 받기 (선택 사항)</label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className={`btn-primary w-full md:w-auto ${contactFormStatus.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={contactFormStatus.loading}
                    >
                      {contactFormStatus.loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          전송 중...
                        </span>
                      ) : (
                        '메시지 보내기'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
            
            {/* Contact Info */}
            <motion.div variants={fadeInUp} className="lg:col-span-1">
              {/* Reverted hover effects to blue neon */}
              <div className="bg-primary-dark bg-opacity-50 backdrop-blur-sm rounded-lg p-6 md:p-8 mb-8 border border-transparent hover:border-accent-blue/50 hover:shadow-neon-blue transition-all duration-300 overflow-hidden"> {/* Added overflow-hidden */}
                <h2 className="text-2xl font-blender mb-6 text-accent-blue">연락처</h2> {/* Use blue */}
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaEnvelope className="text-accent-magenta mt-1 mr-3 flex-shrink-0" /> {/* Use magenta */}
                    <div>
                      {/* Removed the h3 "이메일" label */}
                      <a 
                        href="mailto:takemet9@gmail.com" 
                        className="text-gray-300 hover:text-accent-magenta transition-colors break-all" /* Added break-all for long emails */
                      >
                        takemet9@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Reverted hover effects to blue neon */}
              <div className="bg-primary-dark bg-opacity-50 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-transparent hover:border-accent-blue/50 hover:shadow-neon-blue transition-all duration-300 overflow-hidden"> {/* Added overflow-hidden */}
                <h2 className="text-2xl font-blender mb-6 text-accent-blue">소셜 미디어</h2> {/* Use blue */}
                
                <div className="space-y-4">
                  {/* Instagram Link */}
                  <a 
                    href="https://www.instagram.com/hojin7576/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-gray-300 hover:text-accent-magenta transition-colors hover:drop-shadow-[0_0_5px_var(--color-accent-magenta)]"
                  >
                    <FaInstagram className="mr-3" />
                    <span>@hojin7576</span>
                  </a>
                  
                  {/* Facebook Link Added */}
                   <a 
                    href="https://www.facebook.com/trianglewaver23" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-gray-300 hover:text-accent-magenta transition-colors hover:drop-shadow-[0_0_5px_var(--color-accent-magenta)]"
                  >
                    {/* Placeholder SVG - Import FaFacebook if needed */}
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor" className="mr-3"><path d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z"/></svg>
                    <span>Triangle Waver</span>
                  </a>

                  {/* Removed YouTube, Bandcamp, Spotify, Twitter */}
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Newsletter Section */}
          <motion.div variants={fadeInUp} className="mt-16">
            <div className="bg-primary bg-opacity-30 backdrop-blur-sm rounded-lg p-8 text-center">
              <h2 className="text-2xl font-blender mb-4 text-white">뉴스레터 구독</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                삼각전파사의 최신 소식, 공연 일정, 새 음악 발매 소식을 가장 먼저 받아보세요.
              </p>

              {/* Newsletter Form Status */}
               {newsletterStatus.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg mb-4 max-w-lg mx-auto text-sm border ${
                      newsletterStatus.success
                        ? 'bg-accent-green/10 border-accent-green text-accent-green'
                        : 'bg-accent-pink/10 border-accent-pink text-accent-pink'
                    }`}
                  >
                    {newsletterStatus.message}
                  </motion.div>
                )}

              {/* Hide newsletter form on successful submission */}
              {!(newsletterStatus.submitted && newsletterStatus.success) && (
                <form ref={newsletterFormRef} onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="이메일 주소"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-md sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-accent-blue mb-2 sm:mb-0 transition-all duration-300"
                    required
                  />
                  <button
                    type="submit"
                    className={`bg-accent-blue text-primary-dark px-6 py-3 rounded-md sm:rounded-l-none hover:bg-opacity-80 transition-colors font-medium ${newsletterStatus.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

              <p className="text-gray-500 text-sm mt-4">
                구독은 언제든지 취소할 수 있습니다. 개인정보는 안전하게 보호됩니다.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </ParallaxBackground>
  );
};

export default ContactPage;
