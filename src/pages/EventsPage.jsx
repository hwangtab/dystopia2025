import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Components
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';

// Data
import eventsData from '../data/events.json';

const EventsPage = () => {
  const [expandedEvent, setExpandedEvent] = useState(null);

  const toggleEvent = (eventId) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
    } else {
      setExpandedEvent(eventId);
    }
  };

  // Group events by month
  const groupedEvents = eventsData.events.reduce((acc, event) => {
    const date = new Date(event.date);
    const monthYear = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }

    acc[monthYear].push(event);
    return acc;
  }, {});

  // Sort months chronologically
  const sortedMonths = Object.keys(groupedEvents).sort((a, b) => {
    const [yearA, monthA] = a.split('년 ');
    const [yearB, monthB] = b.split('년 ');

    if (yearA !== yearB) {
      return parseInt(yearA) - parseInt(yearB);
    }

    return parseInt(monthA) - parseInt(monthB);
  });

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

  // Format date (Removed time formatting from here)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
      // Removed hour, minute, hour12 options
    };

    return date.toLocaleDateString('ko-KR', options);
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
          <motion.div variants={fadeInUp} className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-blender mb-6">
              <GlitchText text="공연 일정" intensity="low" interactive={true} />
            </h1>
            {/* Applied Pretendard font, italic style, and break-keep, removed period */}
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-pretendard italic break-keep"> 
              삼각전파사의 'Dystopia 2025' 앨범 발매 기념 공연 및 전국 투어 일정을 확인하세요
            </p>
          </motion.div>

          {/* Featured Events Section Removed */}

          {/* All Events */}
          <motion.div variants={fadeInUp}>
            <h2 className="text-2xl font-blender mb-8 text-accent-blue">전체 공연 일정</h2> {/* Use blue */}

            {eventsData.events.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg mb-2">현재 예정된 공연이 없습니다.</p>
                <p>새로운 공연 소식은 추후 공지될 예정입니다.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {sortedMonths.map((month) => (
                  <div key={month} className="bg-primary bg-opacity-30 backdrop-blur-sm rounded-lg overflow-hidden">
                    <h3 className="text-xl font-blender bg-primary-dark bg-opacity-50 p-4 text-white">
                      {month}
                    </h3>
                    <div className="divide-y divide-gray-800">
                      {groupedEvents[month].map((event) => (
                        <div key={event.id} className="p-0 overflow-hidden"> {/* Added overflow-hidden */}
                          {/* Added hover effects to the clickable div */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-primary-dark hover:bg-opacity-30 transition-all duration-300 ease-in-out border border-transparent hover:border-accent-magenta/50 hover:shadow-neon-magenta" // Reverted to magenta neon
                            onClick={() => toggleEvent(event.id)}
                          >
                            <div className="flex justify-between items-center">
                            <div className="flex items-start">
                              <div className="w-16 h-16 flex flex-col items-center justify-center bg-primary-dark rounded-lg mr-4 text-center border border-accent-blue/20"> {/* Add subtle border */}
                                <span className="text-2xl font-blender text-accent-blue"> {/* Use blue */}
                                  {new Date(event.date).getDate()}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {new Date(event.date).toLocaleDateString('ko-KR', { weekday: 'short' })}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-lg font-medium text-white">{event.title}</h4>
                                  {/* Use event.time directly */}
                                  <p className="text-gray-400 text-sm">
                                    {event.time} | {event.venue}
                                  </p>
                                </div>
                              </div>
                              <div>
                                {expandedEvent === event.id ? (
                                  <FaChevronUp className="text-gray-400" />
                                ) : (
                                  <FaChevronDown className="text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {expandedEvent === event.id && (
                            <motion.div
                              className="px-4 pb-4 pt-2 ml-20"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex items-center text-gray-400 text-sm mb-3">
                                <FaMapMarkerAlt className="mr-2 text-accent-magenta" /> {/* Use magenta */}
                                {event.address}
                              </div>
                              <p className="text-gray-300 mb-4">
                                {event.description}
                              </p>
                              {/* Correctly access the nested bookingLink */}
                              {event.tickets?.bookingLink && ( // Add optional chaining for safety
                                <a
                                  href={event.tickets.bookingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                              className="inline-flex items-center text-accent-blue hover:text-accent-magenta transition-colors" /* Use blue, magenta hover */
                                >
                                  <FaTicketAlt className="mr-2" />
                                  티켓 예매하기
                                </a>
                              )}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          {/* Added mb-16 to this final block */}
          <motion.div variants={fadeInUp} className="mt-16 mb-16 bg-primary-dark bg-opacity-50 backdrop-blur-sm rounded-lg p-6">
            <h2 className="text-2xl font-blender mb-4 text-white">공연 관련 안내</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <span className="text-accent-blue font-medium">티켓 예매:</span> 웹사이트에 공개된 URL을 통해 예매 가능합니다. 공연 2주 전부터 예매가 시작되며, 조기 매진될 수 있으니 서둘러 예매해주세요. {/* Use blue */}
              </p>
              <p>
                <span className="text-accent-blue font-medium">입장 안내:</span> 공연 시작 30분 전부터 입장이 가능합니다. 공연 시작 후에는 입장이 제한될 수 있으니 시간을 엄수해주세요. {/* Use blue */}
              </p>
              <p>
                <span className="text-accent-blue font-medium">공연 문의:</span> 공연 관련 문의사항은 인스타그램 DM으로 연락 주시기 바랍니다. {/* Use blue */}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </ParallaxBackground>
  );
};

export default EventsPage;
