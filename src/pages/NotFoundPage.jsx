import { Link } from 'react-router-dom';

import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';
import SEO from '../components/SEO';

const NotFoundPage = () => (
  <ParallaxBackground className="min-h-screen pt-24 pb-16">
    <SEO
      title="페이지를 찾을 수 없습니다 | 삼각전파사"
      description="요청하신 페이지를 찾을 수 없습니다."
      canonical="/404"
      noindex
    />

    <div className="container-custom mx-auto py-24 text-center">
      <p className="text-accent-magenta font-blender text-sm tracking-wider mb-4">404</p>
      <h1 className="text-3xl md:text-5xl font-blender mb-6">
        <GlitchText text="페이지를 찾을 수 없습니다" intensity="low" interactive />
      </h1>
      <p className="text-gray-300 max-w-xl mx-auto mb-8 break-keep">
        요청하신 주소가 존재하지 않거나 이동되었습니다. 앨범과 공연 정보는 아래 링크에서 다시 확인할 수 있습니다.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/" className="btn-primary">
          홈으로 돌아가기
        </Link>
        <Link to="/album" className="btn-secondary">
          앨범 보기
        </Link>
      </div>
    </div>
  </ParallaxBackground>
);

export default NotFoundPage;
