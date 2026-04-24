import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';

// Components
import AudioPlayer from '../components/AudioPlayer';
import GlitchText from '../components/GlitchText';
import ParallaxBackground from '../components/ParallaxBackground';
import SEO from '../components/SEO';
import StructuredData from '../components/StructuredData';

// Data
import albumData from '../data/albums.json';

// Structured Data
import { getMusicRecordingSchema, getBreadcrumbSchema } from '../utils/structuredData';

const TrackDetailPage = () => {
  const { trackId } = useParams();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the track in the album data
    const foundTrack = albumData.album.tracks.find(t => t.id === trackId);

    if (foundTrack) {
      setTrack(foundTrack);
    }

    setLoading(false);
  }, [trackId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-accent-cyan">Loading...</div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="container-custom mx-auto py-32 text-center">
        <SEO
          title="트랙을 찾을 수 없습니다 - Dystopia 2025"
          description="요청하신 트랙을 찾을 수 없습니다."
          noindex
        />
        <h1 className="text-3xl font-blender mb-4">트랙을 찾을 수 없습니다</h1>
        <p className="mb-8">요청하신 트랙이 존재하지 않습니다.</p>
        <Link to="/album" className="btn-primary">
          앨범으로 돌아가기
        </Link>
      </div>
    );
  }

  const pageVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5, ease: "easeIn" }
    }
  };

  return (
    <ParallaxBackground className="min-h-screen pt-24 pb-16">
      {/* SEO Meta Tags */}
      {track && (
        <>
          <SEO
            title={`${track.title} - Dystopia 2025 | 삼각전파사`}
            description={track.description || `${track.title} - 삼각전파사의 Dystopia 2025 앨범 수록곡. ${track.theme} 테마의 실험적 전자음악.`}
            keywords={`${track.title}, Dystopia 2025, 삼각전파사, ${track.theme}, 실험전자음악, 전자음악`}
            ogType="music.song"
            canonical={`/album/track/${track.id}`}
          />

          {/* Structured Data */}
          <StructuredData data={getMusicRecordingSchema(track, albumData)} />
          <StructuredData data={getBreadcrumbSchema([
            { name: '홈', path: '/' },
            { name: '앨범', path: '/album' },
            { name: track.title, path: `/album/track/${track.id}` }
          ])} />
        </>
      )}

      {/* Main Content */}
      <motion.div
        className="container-custom mx-auto"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
      >
        <Link
          to="/album"
          className="inline-flex items-center text-gray-400 hover:text-accent-blue mb-8 transition-colors" /* Use blue */
        >
          <FaArrowLeft className="mr-2" />
          Back to Album
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Track Info */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-5xl font-blender mb-2">
              <GlitchText text={track.title} intensity="low" interactive={true} />
            </h1>

            <div className="flex items-center mb-6">
              <span className="text-accent-magenta font-medium mr-4">{track.duration}</span> {/* Use magenta */}
              <span className="text-gray-400 bg-gray-800 px-3 py-1 rounded-full text-sm">
                {track.theme}
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-blender mb-2 text-accent-blue">
                <GlitchText text="About This Track" intensity="low" interactive={true} />
              </h2> {/* Use blue */}
              <p className="text-gray-300 mb-4">{track.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-blender mb-4 text-accent-blue">
                <GlitchText text="Lyrics" intensity="low" interactive={true} />
              </h2> {/* Use blue */}
              <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg border border-gray-800">
                {track.lyrics.split('\n').map((line, index) => (
                  <p key={index} className={`mb-2 ${index % 4 === 0 ? 'text-accent-magenta' : 'text-gray-300'}`}> {/* Use magenta */}
                    {line || <br />}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AudioPlayer track={track} /> {/* Restored */}

              <div className="mt-8 bg-primary bg-opacity-30 backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-lg font-blender mb-4 text-white">
                  <GlitchText text="Album Information" intensity="low" interactive={true} />
                </h3>
                <p className="text-gray-400 mb-2">
                  <span className="text-gray-500">Album:</span> {albumData.album.title}
                </p>
                <p className="text-gray-400 mb-2">
                  <span className="text-gray-500">Artist:</span> {albumData.album.artist}
                </p>
                <p className="text-gray-400">
                  <span className="text-gray-500">Release Date:</span> {new Date(albumData.album.releaseDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation between tracks */}
        <div className="mt-16 border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between">
            {getPreviousTrack(trackId) && (
              <Link
                to={`/album/track/${getPreviousTrack(trackId).id}`}
                className="flex items-center text-gray-400 hover:text-accent-magenta mb-4 md:mb-0 group transition-colors" /* Use magenta */
              >
                <FaArrowLeft className="mr-2 group-hover:text-accent-magenta transition-colors" /> {/* Use magenta */}
                <div>
                  <div className="text-sm text-gray-500">Previous Track</div>
                  <div className="font-medium">{getPreviousTrack(trackId).title}</div>
                </div>
              </Link>
            )}

            {getNextTrack(trackId) && (
              <Link
                to={`/album/track/${getNextTrack(trackId).id}`}
                className="flex items-center text-gray-400 hover:text-accent-magenta justify-end md:ml-auto group transition-colors" /* Use magenta */
              >
                <div className="text-right">
                  <div className="text-sm text-gray-500">Next Track</div>
                  <div className="font-medium">{getNextTrack(trackId).title}</div>
                </div>
                <FaArrowLeft className="ml-2 rotate-180 group-hover:text-accent-magenta transition-colors" /> {/* Use magenta */}
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </ParallaxBackground>
  );
};

// Helper functions to get previous and next tracks
const getPreviousTrack = (currentTrackId) => {
  const tracks = albumData.album.tracks;
  const currentIndex = tracks.findIndex(track => track.id === currentTrackId);

  if (currentIndex > 0) {
    return tracks[currentIndex - 1];
  }

  return null;
};

const getNextTrack = (currentTrackId) => {
  const tracks = albumData.album.tracks;
  const currentIndex = tracks.findIndex(track => track.id === currentTrackId);

  if (currentIndex < tracks.length - 1) {
    return tracks[currentIndex + 1];
  }

  return null;
};

export default TrackDetailPage;
