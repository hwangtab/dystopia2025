import React from 'react';
import { motion } from 'framer-motion';
import GlitchText from '../components/GlitchText'; // Assuming GlitchText is reusable

const TermsOfServicePage = () => {
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
          <GlitchText text="이용약관" intensity="low" interactive={true} />
        </h1>
        
        {/* Updated Content for Portfolio Site */}
        <div className="prose prose-invert max-w-none text-gray-300 space-y-6"> {/* Increased space-y */}
          <h2 className="text-xl font-blender text-accent-blue">
            <GlitchText text="제1조 (목적)" intensity="low" interactive={true} />
          </h2>
          <p>
            본 약관은 이용자가 삼각전파사(이하 '아티스트')의 공식 웹사이트(이하 '사이트')에서 제공하는 정보 및 관련 서비스(이하 '서비스')를 이용함에 있어 아티스트와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>

          <h2 className="text-xl font-blender text-accent-blue">
            <GlitchText text="제2조 (서비스 내용)" intensity="low" interactive={true} />
          </h2>
          <p>
            본 사이트는 아티스트 삼각전파사의 음악 활동, 앨범 정보, 공연 소식, 관련 미디어 자료(사진, 영상 등) 및 기타 관련 정보를 제공합니다. 서비스의 내용은 추가되거나 변경될 수 있으며, 변경 시 사이트를 통해 공지합니다.
          </p>

          <h2 className="text-xl font-blender text-accent-blue">
            <GlitchText text="제3조 (저작권)" intensity="low" interactive={true} />
          </h2>
          <p>
            본 사이트에 게시된 모든 콘텐츠(텍스트, 이미지, 오디오, 비디오, 디자인 등을 포함하되 이에 국한되지 않음)에 대한 저작권 및 기타 지식재산권은 아티스트 또는 정당한 권리자에게 귀속됩니다. 이용자는 아티스트 또는 정당한 권리자의 사전 서면 동의 없이 콘텐츠를 복제, 수정, 배포, 전시, 공연하거나 2차적 저작물을 작성하는 등 상업적인 목적으로 사용할 수 없습니다.
          </p>

          <h2 className="text-xl font-blender text-accent-blue">
            <GlitchText text="제4조 (이용자의 의무)" intensity="low" interactive={true} />
          </h2>
          <p>
            이용자는 본 약관 및 관련 법령을 준수해야 하며, 다음 각 호의 행위를 하여서는 안 됩니다.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>아티스트 또는 제3자의 명예를 손상시키거나 불이익을 주는 행위</li>
            <li>공공질서 및 미풍양속에 위반되는 내용의 정보, 문장, 도형 등을 타인에게 유포하는 행위</li>
            <li>범죄와 결부된다고 객관적으로 판단되는 행위</li>
            <li>아티스트의 사전 승낙 없이 서비스를 이용하여 영리행위를 하는 행위</li>
            <li>기타 관련 법령이나 본 약관에 위배되는 행위</li>
          </ul>

          <h2 className="text-xl font-blender text-accent-blue">
            <GlitchText text="제5조 (면책 조항)" intensity="low" interactive={true} />
          </h2>
          <p>
            아티스트는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. 또한, 아티스트는 이용자의 귀책사유로 인한 서비스 이용의 장애 또는 이용자가 사이트에 게재한 정보, 자료, 사실의 신뢰도, 정확성 등 내용에 관하여는 책임을 지지 않습니다. 본 사이트에서 제공하는 정보는 이용자의 판단에 따라 사용되어야 하며, 그 결과에 대한 책임은 전적으로 이용자 본인에게 있습니다.
          </p>
          
          <h2 className="text-xl font-blender text-accent-blue">
            <GlitchText text="제6조 (약관의 효력 및 변경)" intensity="low" interactive={true} />
          </h2>
           <p>
             본 약관은 사이트에 게시함으로써 효력이 발생합니다. 아티스트는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있으며, 변경된 약관은 사이트에 공지함으로써 효력을 발생합니다. 이용자는 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.
           </p>

          <p className="mt-10 text-sm text-gray-500"> {/* Increased mt */}
            <strong>부칙</strong><br />
            본 약관은 2025년 4월 4일부터 시행됩니다.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfServicePage;
