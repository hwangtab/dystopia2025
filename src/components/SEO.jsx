import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({
    title = 'Dystopia 2025 - 삼각전파사',
    description = '삼각전파사의 공식 웹사이트. Dystopia 2025 앨범 정보, 아티스트 소개, 공연 소식 등을 확인하세요.',
    keywords = '삼각전파사, Triangle Waver, Dystopia 2025, 실험전자음악, 아방가르드, 한국 전자음악',
    ogImage = 'https://www.dystopia2025.kr/images/hero.jpg',
    ogImageWidth = 1181,
    ogImageHeight = 1181,
    ogImageAlt,
    ogType = 'website',
    twitterCard = 'summary',
    canonical,
    noindex = false,
}) => {
    const siteUrl = 'https://www.dystopia2025.kr';
    const currentUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="삼각전파사 (Triangle Waver)" />

            {/* Language and Region */}
            <meta name="language" content="Korean" />
            <meta httpEquiv="content-language" content="ko-KR" />
            <meta name="geo.region" content="KR" />
            <meta name="geo.placename" content="South Korea" />

            {/* Canonical URL */}
            <link rel="canonical" href={currentUrl} />

            {/* Robots */}
            {noindex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <>
                    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                    <meta name="googlebot" content="index, follow" />
                </>
            )}

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content={String(ogImageWidth)} />
            <meta property="og:image:height" content={String(ogImageHeight)} />
            <meta property="og:image:alt" content={ogImageAlt || `${title} 대표 이미지`} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="삼각전파사" />
            <meta property="og:locale" content="ko_KR" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
            <meta name="twitter:image:alt" content={ogImageAlt || `${title} 대표 이미지`} />

            {/* Additional Meta for AI Crawlers.
                theme-color lives in index.html only — Helmet duplicates
                don't reliably replace existing <meta> with the same name,
                so the static value (#050818) stays the single source. */}
            <meta name="application-name" content="Dystopia 2025" />
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    ogImage: PropTypes.string,
    ogImageWidth: PropTypes.number,
    ogImageHeight: PropTypes.number,
    ogImageAlt: PropTypes.string,
    ogType: PropTypes.string,
    twitterCard: PropTypes.string,
    canonical: PropTypes.string,
    noindex: PropTypes.bool,
};

export default SEO;
