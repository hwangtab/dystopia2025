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
    inLanguage: 'ko-KR',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/?s={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
    }
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
    foundingDate: '2024',
    foundingLocation: {
        '@type': 'Country',
        name: 'South Korea'
    }
});

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
    image: `${siteUrl}/images/hero.jpg`,
    description: albumData.album.description,
    url: `${siteUrl}/album`,
    inLanguage: 'ko-KR',
    albumProductionType: 'http://schema.org/StudioAlbum',
    albumReleaseType: 'http://schema.org/AlbumRelease',
    track: albumData.album.tracks.map((track, index) => ({
        '@type': 'MusicRecording',
        name: track.title,
        position: index + 1,
        duration: track.duration,
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
    duration: track.duration,
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
    eventStatus: event.status === 'upcoming' ?
        'https://schema.org/EventScheduled' :
        'https://schema.org/EventPostponed',
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
