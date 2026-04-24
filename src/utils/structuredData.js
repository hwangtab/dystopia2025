/**
 * Structured Data Utilities for Schema.org JSON-LD
 * Generates various types of structured data for SEO and AI crawlers
 */

const siteUrl = 'https://www.dystopia2025.kr';

/**
 * Website Schema
 */
export const getWebsiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dystopia 2025 - 삼각전파사',
    url: siteUrl,
    description: '삼각전파사의 정규 1집 Dystopia 2025 공식 웹사이트',
    inLanguage: 'ko-KR'
});

/**
 * Organization (Music Group) Schema
 */
export const getOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    name: '삼각전파사',
    alternateName: 'Triangle Waver',
    description: '한국의 실험전자음악 아티스트',
    genre: ['Experimental Electronic', 'Avant-garde', 'Electronic'],
    url: `${siteUrl}/artist`,
    image: `${siteUrl}/images/hero.jpg`,
    logo: `${siteUrl}/favicon.svg`,
    foundingDate: '2024',
    foundingLocation: {
        '@type': 'Country',
        name: 'South Korea'
    },
    sameAs: [
        'https://www.instagram.com/hojin7576/',
        'https://www.facebook.com/trianglewaver23'
    ]
});

/**
 * Convert "mm:ss" or "hh:mm:ss" string to ISO 8601 duration (e.g., PT3M25S)
 */
const toIsoDuration = (durationStr) => {
    if (!durationStr || typeof durationStr !== 'string') return undefined;
    const parts = durationStr.split(':').map(Number);
    if (parts.some(Number.isNaN)) return undefined;
    let h = 0, m = 0, s = 0;
    if (parts.length === 3) [h, m, s] = parts;
    else if (parts.length === 2) [m, s] = parts;
    else return undefined;
    // `PT` alone isn't falsy, so `|| 'PT0S'` doesn't fire. Guard explicitly.
    if (h === 0 && m === 0 && s === 0) return 'PT0S';
    return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s ? `${s}S` : ''}`;
};

const sumIsoDurations = (tracks) => {
    const totalSec = tracks.reduce((sum, t) => {
        if (!t.duration) return sum;
        const parts = t.duration.split(':').map(Number);
        if (parts.some(Number.isNaN)) return sum;
        if (parts.length === 2) return sum + parts[0] * 60 + parts[1];
        if (parts.length === 3) return sum + parts[0] * 3600 + parts[1] * 60 + parts[2];
        return sum;
    }, 0);
    if (totalSec <= 0) return 'PT0S';
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s ? `${s}S` : ''}`;
};

/**
 * Music Album Schema
 */
export const getMusicAlbumSchema = (albumData) => ({
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: albumData.album.title,
    byArtist: {
        '@type': 'MusicGroup',
        name: albumData.album.artist,
        alternateName: 'Triangle Waver'
    },
    datePublished: albumData.album.releaseDate,
    genre: ['Experimental Electronic', 'Avant-garde'],
    image: `${siteUrl}${albumData.album.coverImage || '/images/hero.jpg'}`,
    description: albumData.album.description,
    url: `${siteUrl}/album`,
    inLanguage: 'ko-KR',
    numTracks: albumData.album.tracks.length,
    duration: sumIsoDurations(albumData.album.tracks),
    ...(() => {
        const y = new Date(albumData.album.releaseDate).getFullYear();
        return Number.isFinite(y) ? { copyrightYear: y } : {};
    })(),
    copyrightHolder: {
        '@type': 'MusicGroup',
        name: albumData.album.artist
    },
    albumProductionType: 'https://schema.org/StudioAlbum',
    albumReleaseType: 'https://schema.org/AlbumRelease',
    track: albumData.album.tracks.map((track, index) => ({
        '@type': 'MusicRecording',
        name: track.title,
        position: index + 1,
        duration: toIsoDuration(track.duration),
        url: `${siteUrl}/album/track/${track.id}`,
        byArtist: {
            '@type': 'MusicGroup',
            name: albumData.album.artist
        }
    }))
});

/**
 * Music Recording Schema (for individual tracks)
 */
export const getMusicRecordingSchema = (track, albumData) => ({
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: track.title,
    description: track.description || `${albumData.album.title}의 수록곡`,
    duration: toIsoDuration(track.duration),
    url: `${siteUrl}/album/track/${track.id}`,
    byArtist: {
        '@type': 'MusicGroup',
        name: albumData.album.artist,
        alternateName: 'Triangle Waver'
    },
    inAlbum: {
        '@type': 'MusicAlbum',
        name: albumData.album.title,
        url: `${siteUrl}/album`
    },
    genre: ['Experimental Electronic', 'Avant-garde'],
    inLanguage: 'ko-KR',
    recordingOf: {
        '@type': 'MusicComposition',
        name: track.title,
        composer: {
            '@type': 'MusicGroup',
            name: albumData.album.artist
        }
    }
});

/**
 * Event Schema
 */
export const getEventSchema = (event) => ({
    '@context': 'https://schema.org',
    '@type': event.type === 'concert' ? 'MusicEvent' : 'Event',
    name: event.title,
    description: event.description,
    startDate: event.date,
    location: {
        '@type': 'Place',
        name: event.location,
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'KR'
        }
    },
    performer: {
        '@type': 'MusicGroup',
        name: '삼각전파사',
        alternateName: 'Triangle Waver'
    },
    organizer: {
        '@type': 'Organization',
        name: event.organizer || '삼각전파사'
    },
    eventStatus: (() => {
        const s = (event.status || '').toLowerCase();
        if (s === 'cancelled' || s === 'canceled') return 'https://schema.org/EventCancelled';
        if (s === 'postponed' || s === 'rescheduled') return 'https://schema.org/EventPostponed';
        if (s === 'moved_online' || s === 'online') return 'https://schema.org/EventMovedOnline';
        // Default: the event was (or is) scheduled. Past dates stay Scheduled;
        // Google indexes historical events that way.
        return 'https://schema.org/EventScheduled';
    })(),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `${siteUrl}/events`
});

/**
 * Breadcrumb List Schema
 */
export const getBreadcrumbSchema = (items) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${siteUrl}${item.path}`
    }))
});

/**
 * FAQ Page Schema
 */
export const getFAQPageSchema = (faqs) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
        }
    }))
});

/**
 * Image Gallery Schema
 */
export const getImageGallerySchema = (images) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: '삼각전파사 갤러리',
    description: 'Dystopia 2025 관련 이미지 갤러리',
    url: `${siteUrl}/gallery`,
    image: images.map(img => ({
        '@type': 'ImageObject',
        contentUrl: `${siteUrl}${img.url}`,
        caption: img.caption || img.title,
        name: img.title
    }))
});

/**
 * Collection Page Schema (for Media page)
 */
export const getCollectionPageSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '미디어 - 삼각전파사',
    description: '삼각전파사의 뉴스레터, 미디어 자료',
    url: `${siteUrl}/media`,
    about: {
        '@type': 'MusicGroup',
        name: '삼각전파사'
    }
});

/**
 * Contact Page Schema
 */
export const getContactPageSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: '문의하기 - 삼각전파사',
    description: '삼각전파사에 문의하기',
    url: `${siteUrl}/contact`,
    mainEntity: {
        '@type': 'MusicGroup',
        name: '삼각전파사',
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: ['Korean', 'English']
        }
    }
});
