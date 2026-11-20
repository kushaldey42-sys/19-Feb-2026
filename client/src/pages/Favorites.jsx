import { useState, useEffect } from 'react';
import { getFavorites, getTrailerByTitle } from '../api/movies';
import MovieRow from '../components/MovieRow';
import Spinner from '../components/Spinner';
import TrailerModal from '../components/TrailerModal';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);
  const [movieTitle, setMovieTitle] = useState('');
  const [trailerData, setTrailerData] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerError, setTrailerError] = useState('');

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch(() => setError('Failed to load your list'))
      .finally(() => setLoading(false));
  }, []);

  // Map to same shape as search results for MovieRow/MovieCard
  const movies = favorites.map((f) => ({
    imdbID: f.imdbID,
    Title: f.title,
    Year: f.year,
    Poster: f.poster,
    Type: f.type,
  }));

  const closeTrailer = () => {
    setShowTrailer(false);
    setLoadingTrailer(false);
    setTrailerError('');
    setTrailerData(null);
    setMovieTitle('');
  };

  const openTrailer = async (title) => {
    const cleanTitle = title?.trim();
    if (!cleanTitle) return;

    setMovieTitle(cleanTitle);
    setShowTrailer(true);
    setLoadingTrailer(true);
    setTrailerError('');
    setTrailerData(null);

    try {
      const data = await getTrailerByTitle(cleanTitle);
      setTrailerData(data);
    } catch {
      setTrailerError('Could not load trailer right now.');
      setTrailerData({
        found: false,
        videoId: null,
        embedUrl: null,
        searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${cleanTitle} official trailer`)}`,
      });
    } finally {
      setLoadingTrailer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
        My List
      </h1>
      <p className="text-gray-400 mb-6">
        Movies and shows you&apos;ve added to your list.
      </p>

      {error && (
        <p className="text-red-400 mb-4">{error}</p>
      )}

      {movies.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t added anything yet. Search and add from the home page.</p>
      ) : (
        <MovieRow title="Your favorites" movies={movies} onPreviewTrailer={openTrailer} />
      )}
      <TrailerModal
        open={showTrailer}
        movieTitle={movieTitle}
        trailerData={trailerData}
        loading={loadingTrailer}
        error={trailerError}
        onClose={closeTrailer}
      />
    </div>
  );
}
