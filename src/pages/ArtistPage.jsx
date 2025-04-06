import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaMusic, FaBook } from 'react-icons/fa';

// Components
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';

const ArtistPage = () => {
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
          {/* Artist Header */}
          <motion.div variants={fadeInUp} className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-blender mb-6">
              <GlitchText text="삼각전파사" intensity="low" interactive={true} />
              <span className="block text-accent-blue text-2xl md:text-3xl mt-2">TRIANGLE WAVER</span> {/* Use blue */}
            </h1>
            {/* Applied Pretendard font, italic style, and break-keep, removed period */}
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-pretendard italic break-keep"> 
              한국 실험전자음악의 새로운 지평을 개척하는 아방가르드 음악가
            </p>
          </motion.div>
          
          {/* Artist Bio */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
            <motion.div variants={fadeInUp} className="lg:col-span-1">
              <div className="aspect-square relative overflow-hidden rounded-lg shadow-xl mb-6">
                <img 
                  src="/images/5.jpg" 
                  alt="삼각전파사 (Triangle Waver)" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark to-transparent opacity-60"></div>
              </div>
              
              <div className="bg-primary bg-opacity-30 backdrop-blur-sm p-5 rounded-lg">
                <h3 className="text-lg font-blender mb-4 text-white">아티스트 정보</h3>
                <div className="space-y-2 text-gray-300">
                  <p><span className="text-gray-500">활동명:</span> 삼각전파사 (Triangle Waver)</p>
                  <p><span className="text-gray-500">본명:</span> 장호진</p>
                  <p><span className="text-gray-500">활동 시작:</span> 2015년</p>
                  <p><span className="text-gray-500">장르:</span> 실험전자음악, 아방가르드</p>
                  <p><span className="text-gray-500">직업:</span> 음악가, SF 작가</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="lg:col-span-2">
              <h2 className="text-2xl font-blender mb-6 text-accent-blue">
                <GlitchText text="아티스트 소개" intensity="low" interactive={true} />
              </h2> {/* Use blue */}
              <div className="space-y-4 text-gray-300">
                {/* Removed critic intro line */}
                <p>
                  삼각전파사는 한국 실험전자음악계에서 독특한 행보를 이어오는 아방가르드 음악가입니다. 2015년부터 전자음악과 사회비평의 결합을 모색해온 그는 예술성과 정치성의 경계를 날카롭게 허물어왔습니다.
                </p>
                <p>
                  그의 음악적 특징은 왜곡된 신디사이저와 그로테스크한 전자음향을 통해 현대 사회의 구조적 모순을 표현하는 데 있습니다. 젠트리피케이션, 노동문제, 군사화 등 한국 사회의 디스토피아적 현실을 포착하는 그의 작업은 단순한 사운드 디자인을 넘어 강력한 정치적 메시지를 담고 있습니다.
                </p>
                 {/* SF 작가 활동 관련 문단 제거됨 */}
                 <p>
                  특히 주목할 점은 계몽적 시선을 벗어나 당사자성을 회복하는 그의 접근방식입니다. 거대 서사가 아닌 일상의 구체적 현실에 초점을 맞추는 그의 음악은, 우리가 이미 디스토피아 속에 살고 있음을 인식시킵니다. 차가운 전자음 속에 뜨거운 저항의 메시지를 담아내는 삼각전파사의 음악은 21세기 한국 사회의 새로운 저항 언어를 모색합니다.
                </p>
              </div>
              
              {/* 음악적 철학 섹션은 유지하거나 필요에 따라 수정/제거 가능 */}
              <h2 className="text-2xl font-blender mb-6 mt-12 text-accent-blue">
                <GlitchText text="음악적 철학" intensity="low" interactive={true} />
              </h2> {/* Use blue */}
              <div className="space-y-6 text-gray-300">
                <div>
                  <h3 className="text-xl font-blender mb-2 text-white">1. 실험성과 정치성의 융합</h3>
                  <p>
                    전자음악의 실험적 언어로 정치적 메시지를 전달합니다. 미학적 혁신과 사회적 발언은 분리된 것이 아니라, 서로를 강화하는 힘으로 작용합니다.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-blender mb-2 text-white">2. 민중음악의 현대적 재해석</h3>
                  <p>
                    1980년대 민중가요가 통기타와 장구로 시대의 아픔을 노래했다면, 삼각전파사는 전자음으로 21세기의 현실을 해부합니다. 이는 저항 음악의 문법 자체를 현대화하는 시도입니다.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-blender mb-2 text-white">3. 시선의 전환</h3>
                  <p>
                    통일, 민족, 민주화와 같은 거대 서사가 아닌 우리 주변의 절박한 현실에 초점을 맞춥니다. 젠트리피케이션, 산업재해, 군사기지 등 구체적 현실에 주목합니다.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-blender mb-2 text-white">4. 당사자성의 회복</h3>
                  <p>
                    추상적 구호가 아닌, 고통받는 이웃들의 목소리를 담아냅니다. 계몽적 태도를 넘어선 공감과 연대의 음악을 추구합니다.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* SF Writer Section */}
          <motion.div variants={fadeInUp} className="mb-16">
            <h2 className="text-2xl font-blender mb-6 text-accent-blue">
              <GlitchText text="SF 작가로서의 활동" intensity="low" interactive={true} />
            </h2> {/* Use blue */}
            <div className="bg-primary-dark bg-opacity-50 backdrop-blur-sm p-6 rounded-lg overflow-hidden"> {/* Added overflow-hidden */}
              <p className="text-gray-300 mb-4">
                삼각전파사는 SF작가 장호진으로도 활동하며, 문학과 음악 두 영역을 넘나드는 창작 활동을 펼치고 있습니다. 2006년 과학기술 창작문예 당선으로 문학계에 데뷔한 그는 한국 SF 분야에서도 독특한 작품 세계를 구축하고 있습니다.
              </p>
              <p className="text-gray-300 mb-4">
                그의 SF 소설은 디스토피아적 미래 사회에 대한 상상과 현실 비판을 결합한 작품들로, 음악 작업과도 맥을 같이 합니다. 'Dystopia 2025' 앨범 작업과 함께 SF 소설 '다시 만날 세계'의 집필을 마쳤으며, 음악과 문학의 경계를 허무는 크로스미디어 프로젝트를 시도하고 있습니다.
              </p>
              {/* 기획안에 명시되지 않은 주요 작품 및 수상 경력 섹션 제거 */}
            </div>
          </motion.div>
          
          {/* Discography & Bibliography - 기획안에 명시되지 않은 정보 제거 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"> {/* Changed gap-8 to gap-12 */}
            {/* Discography Card */}
            <motion.div 
              variants={fadeInUp} 
              className="bg-primary bg-opacity-30 backdrop-blur-sm p-6 rounded-lg border border-transparent transition-all duration-300 overflow-hidden" // Added overflow-hidden
            >
              <div className="flex items-center mb-4">
                <FaMusic className="text-accent-magenta text-2xl mr-3" /> {/* Use magenta */}
                <h2 className="text-2xl font-blender text-white">
                  <GlitchText text="디스코그래피" intensity="low" interactive={true} />
                </h2>
              </div>
              
              <ul className="space-y-4">
                <li>
                  <h3 className="text-lg font-medium text-accent-blue">Dystopia 2025</h3> {/* Use blue */}
                  <p className="text-gray-400">정규 1집 (2025)</p>
                  <Link to="/album" className="text-gray-300 hover:text-accent-magenta transition-colors text-sm"> {/* Use magenta */}
                    자세히 보기 →
                  </Link>
                </li>
                {/* 기획안에 명시되지 않은 다른 디스코그래피 항목 제거 */}
              </ul>
            </motion.div>
            
            {/* Bibliography Card */}
            <motion.div 
              variants={fadeInUp} 
              className="bg-primary bg-opacity-30 backdrop-blur-sm p-6 rounded-lg border border-transparent transition-all duration-300 overflow-hidden" // Added overflow-hidden
            >
              <div className="flex items-center mb-4">
                <FaBook className="text-accent-blue text-2xl mr-3" /> {/* Use blue */}
                <h2 className="text-2xl font-blender text-white">
                  <GlitchText text="저서" intensity="low" interactive={true} />
                </h2>
              </div>
              
              <ul className="space-y-4">
                <li>
                  <h3 className="text-lg font-medium text-accent-blue">다시 만날 세계</h3> {/* Use blue */}
                  <p className="text-gray-400">단편집</p>
                  <p className="text-gray-300 text-sm">앨범과 연계된 SF 소설</p>
                </li>
                 {/* 기획안에 명시되지 않은 다른 저서 항목 제거 */}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </ParallaxBackground>
  );
};

export default ArtistPage;
