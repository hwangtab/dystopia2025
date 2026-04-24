// Single source of truth for per-route SEO meta used by the prerender
// step. Kept as pure data (no React) so Node can consume it during build.
// The page components still call <SEO /> at runtime; this data is what
// non-JS crawlers (Facebook, LinkedIn, Naver, Kakao) see in the raw HTML.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const albumData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/albums.json'), 'utf-8')
);

const SITE_URL = 'https://www.dystopia2025.kr';
const DEFAULT_OG = {
  url: `${SITE_URL}/images/hero.jpg`,
  width: 1181,
  height: 1181,
  alt: '삼각전파사 Dystopia 2025 앨범 커버',
  type: 'image/jpeg',
  twitterCard: 'summary',
};
const LANDSCAPE_TWITTER = 'summary_large_image';

const staticRoutes = [
  {
    path: '/',
    title: 'Dystopia 2025 - 삼각전파사 | 실험전자음악',
    description: "삼각전파사의 정규 1집 'Dystopia 2025'. 거대 서사가 아닌 해체된 파편들의 콜라주로 이 시대의 모순을 표현하는 실험전자음악 앨범.",
    ogType: 'website',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/MainPage.jsx', 'index.html'],
  },
  {
    path: '/album',
    title: 'Dystopia 2025 앨범 | 삼각전파사',
    description: "삼각전파사의 정규 1집 'Dystopia 2025' 전체 트랙 리스트와 앨범 소개. 음악적 실험성과 메시지 사이의 균형을 잃지 않은 흔치 않은 수작.",
    ogType: 'music.album',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/AlbumPage.jsx', 'src/data/albums.json'],
  },
  {
    path: '/artist',
    title: '아티스트 소개 - 삼각전파사 | Triangle Waver',
    description: '삼각전파사(Triangle Waver)는 한국의 실험전자음악 아티스트입니다. 음악적 실험성과 사회적 메시지를 결합하여 현대 사회의 모순을 표현합니다.',
    ogType: 'profile',
    og: {
      url: `${SITE_URL}/images/5.jpg`,
      width: 1280,
      height: 960,
      alt: '삼각전파사 아티스트 사진',
      type: 'image/jpeg',
      twitterCard: LANDSCAPE_TWITTER,
    },
    sourceFiles: ['src/pages/ArtistPage.jsx'],
  },
  {
    path: '/events',
    title: '공연 일정 | 삼각전파사',
    description: '삼각전파사의 공연 및 이벤트 일정. Dystopia 2025 앨범 관련 라이브 공연, 페스티벌, 음악 이벤트 정보를 확인하세요.',
    ogType: 'website',
    og: {
      url: `${SITE_URL}/images/7.jpg`,
      width: 1280,
      height: 860,
      alt: '삼각전파사 라이브 공연 현장',
      type: 'image/jpeg',
      twitterCard: LANDSCAPE_TWITTER,
    },
    sourceFiles: ['src/pages/EventsPage.jsx', 'src/data/events.json'],
  },
  {
    path: '/gallery',
    title: '갤러리 | 삼각전파사',
    description: '삼각전파사의 Dystopia 2025 관련 이미지 갤러리. 앨범 아트워크, 공연 사진, 프로모 이미지 등을 확인하세요.',
    ogType: 'website',
    og: {
      url: `${SITE_URL}/images/book.jpg`,
      width: 1280,
      height: 945,
      alt: '삼각전파사 Dystopia 2025 아트워크 갤러리',
      type: 'image/jpeg',
      twitterCard: LANDSCAPE_TWITTER,
    },
    sourceFiles: ['src/pages/GalleryPage.jsx'],
  },
  {
    path: '/media',
    title: '미디어 | 삼각전파사',
    description: '삼각전파사의 뉴스레터, 미디어 자료, 프레스 키트, 인터뷰 및 세미나 정보를 확인하세요.',
    ogType: 'website',
    og: {
      url: `${SITE_URL}/images/2.jpg`,
      width: 1280,
      height: 854,
      alt: '삼각전파사 미디어 및 프레스 자료',
      type: 'image/jpeg',
      twitterCard: LANDSCAPE_TWITTER,
    },
    sourceFiles: ['src/pages/MediaPage.jsx', 'src/data/media.json'],
  },
  {
    path: '/contact',
    title: '문의하기 | 삼각전파사',
    description: '삼각전파사에게 문의하세요. 공연 문의, 언론 보도, 협업 제안 및 뉴스레터 구독을 할 수 있습니다.',
    ogType: 'website',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/ContactPage.jsx'],
  },
  {
    path: '/privacy',
    title: '개인정보처리방침 | 삼각전파사',
    description: '삼각전파사 Dystopia 2025 웹사이트의 개인정보 수집 및 이용에 관한 정책입니다.',
    ogType: 'website',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/PrivacyPolicyPage.jsx'],
  },
  {
    path: '/terms',
    title: '이용약관 | 삼각전파사',
    description: '삼각전파사 Dystopia 2025 웹사이트의 이용약관입니다.',
    ogType: 'website',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/TermsOfServicePage.jsx'],
  },
];

const trackRoutes = albumData.album.tracks.map((t) => ({
  path: `/album/track/${t.id}`,
  title: `${t.title} - Dystopia 2025 | 삼각전파사`,
  description:
    t.description ||
    `${t.title} - 삼각전파사의 Dystopia 2025 앨범 수록곡. ${t.theme} 테마의 실험적 전자음악.`,
  ogType: 'music.song',
  og: DEFAULT_OG,
  sourceFiles: ['src/pages/TrackDetailPage.jsx', 'src/data/albums.json'],
}));

export const SITE = {
  url: SITE_URL,
  name: '삼각전파사',
  locale: 'ko_KR',
};

export const routes = [...staticRoutes, ...trackRoutes];
