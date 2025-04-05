import React from 'react';
import { motion } from 'framer-motion';
import GlitchText from '../components/GlitchText'; // Assuming GlitchText is reusable

const PrivacyPolicyPage = () => {
  // Animation variants (can reuse from other pages or define new ones)
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="container-custom mx-auto pt-24 pb-16 min-h-screen" // Added min-h-screen for content height
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="bg-primary-dark p-8 md:p-12 rounded-lg shadow-lg border border-gray-700/50">
        <h1 className="text-3xl md:text-4xl font-blender mb-8 text-center">
          <GlitchText text="개인정보처리방침" intensity="low" />
        </h1>
        
        {/* Placeholder Content */}
        <div className="prose prose-invert max-w-none text-gray-300 space-y-4">
          <p>
            [삼각전파사]('이하 '회사')는 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며, 관련 법령에 의거한 개인정보처리방침을 정하여 이용자 권익 보호에 최선을 다하고 있습니다.
          </p>
          <h2 className="text-xl font-blender text-accent-blue">1. 개인정보의 처리 목적</h2>
          <p>
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul>
            <li>뉴스레터 발송: 이메일 주소</li>
            <li>문의 처리: 이름, 이메일 주소, 문의 내용</li>
          </ul>

          <h2 className="text-xl font-blender text-accent-blue">2. 개인정보의 처리 및 보유 기간</h2>
          <p>
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
          </p>
          <ul>
            <li>뉴스레터 구독 정보: 구독 해지 시까지</li>
            <li>문의 정보: 문의 처리 완료 후 1년</li>
          </ul>
          
          <h2 className="text-xl font-blender text-accent-blue">3. 개인정보의 제3자 제공에 관한 사항</h2>
          <p>
            회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. (현재 제3자 제공 없음)
          </p>

          {/* Add more sections as needed: 
              4. 개인정보처리의 위탁에 관한 사항
              5. 정보주체와 법정대리인의 권리·의무 및 행사방법에 관한 사항
              6. 처리하는 개인정보의 항목
              7. 개인정보의 파기에 관한 사항
              8. 개인정보의 안전성 확보조치에 관한 사항
              9. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항 (쿠키 등)
              10. 개인정보 보호책임자에 관한 사항
              11. 개인정보처리방침의 변경에 관한 사항
              12. 권익침해 구제방법
          */}

          <p className="mt-8 text-sm text-gray-500">
            본 방침은 2025년 4월 4일부터 시행됩니다.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicyPage;
