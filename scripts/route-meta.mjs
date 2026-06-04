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
const faqItems = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'src/data/faq.json'), 'utf-8')
);

const galleryImageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
const galleryImagesForSchema = galleryImageNumbers.map((n, i) => ({
  url: `/images/${n}.jpg`,
  title: `Dystopia 2025 Gallery ${i + 1}`,
  caption: `삼각전파사 Dystopia 2025 갤러리 이미지 ${i + 1}`,
}));

// Breadcrumb helper that mirrors the runtime-injected trail per route.
const crumb = (items) => getBreadcrumbSchema(items);

// Apex matches the CNAME and is the only host with a valid TLS cert
// (GitHub Pages issues the cert for the CNAME value; `www.` returns the
// shared *.github.io fallback and fails verification). Sitemap, canonical,
// and og:url all point here so Google and social crawlers don't get
// redirected to a host that won't handshake.
const SITE_URL = 'https://dystopia2025.kr';
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
      // Only upcoming events become JSON-LD. Past startDate triggers
      // Google Search Console's "Event: startDate in the past" warning
      // and drops the page from Event rich results entirely.
      ...eventsData.events
        .filter((e) => new Date(e.date) >= new Date())
        .slice(0, 3)
        .map(getEventSchema),
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
