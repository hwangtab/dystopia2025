import PropTypes from 'prop-types';

/**
 * StructuredData Component
 * Renders JSON-LD structured data for SEO and AI crawlers
 */
const StructuredData = ({ data }) => {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
};

StructuredData.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
    ]).isRequired,
};

export default StructuredData;
