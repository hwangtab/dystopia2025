// Single source of truth for per-route SEO meta used by the prerender
// step. Kept as pure data (no React) so Node can consume it during build.
// The page components still call <SEO /> at runtime; this data is what
// non-JS crawlers (Facebook, LinkedIn, Naver, Kakao) see in the raw HTML.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getWebsiteSchema,
  getOrganizationSchema,
  getMusicAlbumSchema,
  getMusicRecordingSchema,
  getEventSchema,
  getBreadcrumbSchema,
  getFAQPageSchema,
  getImageGallerySchema,
  getCollectionPageSchema,
  getContactPageSchema,
} from '../src/utils/structuredData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const albumData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/albums.json'), 'utf-8')
);
const eventsData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/events.json'), 'utf-8')
);

// Mirror the FAQ content used at runtime in ContactPage. If these strings
// drift out of sync with the visible copy, Google flags a FAQPage mismatch,
// so both lists must stay identical character-for-character.
const faqItems = [
  {
    question: '삼각전파사의 음악 장르는 무엇인가요?',
    answer: '삼각전파사(Triangle Waver)는 실험전자음악과 아방가르드를 기반으로, 사회비평적 메시지를 전자음향으로 표현하는 한국의 독립 아티스트입니다.',
  },
  {
    question: 'Dystopia 2025 앨범은 언제 발매되나요?',
    answer: '정규 1집 Dystopia 2025는 2025년 5월 2일 공식 발매되었습니다. 전체 8곡이 수록되어 있으며, 앨범 페이지에서 트랙별 소개와 가사를 확인할 수 있습니다.',
  },
  {
    question: '공연 일정은 어디서 확인할 수 있나요?',
    answer: '삼각전파사의 모든 라이브 공연, 페스티벌, 음악 이벤트 일정은 공연 일정 페이지(/events)에서 확인할 수 있습니다. 뉴스레터를 구독하시면 가장 먼저 공지를 받아보실 수 있습니다.',
  },
  {
    question: '언론 문의나 인터뷰 요청은 어떻게 하나요?',
    answer: '문의 폼의 주제에서 “언론 문의”를 선택하시거나 인스타그램 @hojin7576로 메시지를 보내주시면 됩니다. 프레스 키트는 미디어 페이지에서 다운로드할 수 있습니다.',
  },
  {
    question: '뉴스레터는 어떻게 구독하나요?',
    answer: '이 페이지 하단의 뉴스레터 구독 폼에 이메일을 입력하시면 됩니다. 새 음악 발매, 공연 일정, 미디어 소식을 가장 먼저 받아보실 수 있으며 언제든 구독 해지가 가능합니다.',
  },
];

const galleryImageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
const galleryImagesForSchema = galleryImageNumbers.map((n, i) => ({
  url: `/images/${n}.jpg`,
  title: `Dystopia 2025 Gallery ${i + 1}`,
  caption: `삼각전파사 Dystopia 2025 갤러리 이미지 ${i + 1}`,
}));

// Breadcrumb helper that mirrors the runtime-injected trail per route.
const crumb = (items) => getBreadcrumbSchema(items);

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
    jsonLd: [
      getWebsiteSchema(),
      getOrganizationSchema(),
      crumb([{ name: '홈', path: '/' }]),
    ],
  },
  {
    path: '/album',
    title: 'Dystopia 2025 앨범 | 삼각전파사',
    description: "삼각전파사의 정규 1집 'Dystopia 2025' 전체 트랙 리스트와 앨범 소개. 음악적 실험성과 메시지 사이의 균형을 잃지 않은 흔치 않은 수작.",
    ogType: 'music.album',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/AlbumPage.jsx', 'src/data/albums.json'],
    jsonLd: [
      getMusicAlbumSchema(albumData),
      crumb([{ name: '홈', path: '/' }, { name: '앨범', path: '/album' }]),
    ],
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
    jsonLd: [
      getOrganizationSchema(),
      crumb([{ name: '홈', path: '/' }, { name: '아티스트', path: '/artist' }]),
    ],
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
    jsonLd: [
      ...eventsData.events.slice(0, 3).map(getEventSchema),
      crumb([{ name: '홈', path: '/' }, { name: '공연 일정', path: '/events' }]),
    ],
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
    jsonLd: [
      getImageGallerySchema(galleryImagesForSchema),
      crumb([{ name: '홈', path: '/' }, { name: '갤러리', path: '/gallery' }]),
    ],
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
    jsonLd: [
      getCollectionPageSchema(),
      crumb([{ name: '홈', path: '/' }, { name: '미디어', path: '/media' }]),
    ],
  },
  {
    path: '/contact',
    title: '문의하기 | 삼각전파사',
    description: '삼각전파사에게 문의하세요. 공연 문의, 언론 보도, 협업 제안 및 뉴스레터 구독을 할 수 있습니다.',
    ogType: 'website',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/ContactPage.jsx'],
    jsonLd: [
      getContactPageSchema(),
      getFAQPageSchema(faqItems),
      crumb([{ name: '홈', path: '/' }, { name: '문의하기', path: '/contact' }]),
    ],
  },
  {
    path: '/privacy',
    title: '개인정보처리방침 | 삼각전파사',
    description: '삼각전파사 Dystopia 2025 웹사이트의 개인정보 수집 및 이용에 관한 정책입니다.',
    ogType: 'website',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/PrivacyPolicyPage.jsx'],
    jsonLd: [
      crumb([{ name: '홈', path: '/' }, { name: '개인정보처리방침', path: '/privacy' }]),
    ],
  },
  {
    path: '/terms',
    title: '이용약관 | 삼각전파사',
    description: '삼각전파사 Dystopia 2025 웹사이트의 이용약관입니다.',
    ogType: 'website',
    og: DEFAULT_OG,
    sourceFiles: ['src/pages/TermsOfServicePage.jsx'],
    jsonLd: [
      crumb([{ name: '홈', path: '/' }, { name: '이용약관', path: '/terms' }]),
    ],
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
  jsonLd: [
    getMusicRecordingSchema(t, albumData),
    crumb([
      { name: '홈', path: '/' },
      { name: '앨범', path: '/album' },
      { name: t.title, path: `/album/track/${t.id}` },
    ]),
  ],
}));

export const SITE = {
  url: SITE_URL,
  name: '삼각전파사',
  locale: 'ko_KR',
};

export const routes = [...staticRoutes, ...trackRoutes];
