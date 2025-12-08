import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({
    title = 'Dystopia 2025 - 삼각전파사',
    description = '삼각전파사의 공식 웹사이트. Dystopia 2025 앨범 정보, 아티스트 소개, 공연 소식 등을 확인하세요.',
    keywords = '삼각전파사, Triangle Waver, Dystopia 2025, 실험전자음악, 아방가르드, 한국 전자음악',
    ogImage = 'https://www.dystopia2025.kr/images/hero.jpg',
    ogType = 'website',
    twitterCard = 'summary_large_image',
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
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content="삼각전파사" />
            <meta property="og:locale" content="ko_KR" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Additional Meta for AI Crawlers */}
            <meta name="application-name" content="Dystopia 2025" />
            <meta name="theme-color" content="#1a1a2e" />
        </Helmet>
    );
};

SEO.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    keywords: PropTypes.string,
    ogImage: PropTypes.string,
    ogType: PropTypes.string,
    twitterCard: PropTypes.string,
    canonical: PropTypes.string,
    noindex: PropTypes.bool,
};

export default SEO;
