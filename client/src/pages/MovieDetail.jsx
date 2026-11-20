import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMovieById,
  addFavorite,
  removeFavorite,
  checkFavorite,
  getWatchmodeByTitle,
  getTrailerByTitle,
} from '../api/movies';
import Spinner from '../components/Spinner';
import WatchProviders from '../components/WatchProviders';
import TrailerModal from '../components/TrailerModal';

function buildYoutubeSearchUrl(title) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official trailer`)}`;
}

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const [watchmodeLoading, setWatchmodeLoading] = useState(false);
  const [watchmodeError, setWatchmodeError] = useState('');
  const [watchmodeData, setWatchmodeData] = useState({
    found: false,
    watchmodeId: null,
    providers: [],
    trailerVideoId: null,
    trailerUrl: '',
    message: '',
  });

  const [showTrailer, setShowTrailer] = useState(false);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerError, setTrailerError] = useState('');
  const [trailerState, setTrailerState] = useState({
    videoId: null,
    searchUrl: '',
    message: '',
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getMovieById(id)
      .then((data) => {
        if (!cancelled) setMovie(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;

    checkFavorite(id)
      .then(setIsFavorite)
      .catch(() => setIsFavorite(false));
  }, [id]);

  useEffect(() => {
    if (!movie?.Title) return;

    let cancelled = false;
    setWatchmodeLoading(true);
    setWatchmodeError('');

    getWatchmodeByTitle(movie.Title, movie.Year)
      .then((data) => {
        if (cancelled) return;
        setWatchmodeData({
          found: Boolean(data?.found),
          watchmodeId: data?.watchmodeId || null,
          providers: Array.isArray(data?.providers) ? data.providers : [],
          trailerVideoId: data?.trailerVideoId || null,
          trailerUrl: data?.trailerUrl || '',
          message: data?.message || '',
        });
      })
      .catch(() => {
        if (!cancelled) {
          setWatchmodeError('Could not load streaming availability right now.');
          setWatchmodeData({
            found: false,
            watchmodeId: null,
            providers: [],
            trailerVideoId: null,
            trailerUrl: '',
            message: '',
          });
        }
      })
      .finally(() => {
        if (!cancelled) setWatchmodeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [movie?.Title, movie?.Year]);

  const toggleFavorite = async () => {
    if (!movie || favLoading) return;

    setFavLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(movie.imdbID);
        setIsFavorite(false);
      } else {
        await addFavorite(movie);
        setIsFavorite(true);
      }
    } catch {
      // Keep state on error.
    } finally {
      setFavLoading(false);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
    setLoadingTrailer(false);
    setTrailerError('');
    setTrailerState({ videoId: null, searchUrl: '', message: '' });
  };

  const openTrailer = async () => {
    if (!movie?.Title) return;

    const fallbackSearchUrl = buildYoutubeSearchUrl(movie.Title);

    setShowTrailer(true);
    setLoadingTrailer(true);
    setTrailerError('');
    setTrailerState({ videoId: null, searchUrl: fallbackSearchUrl, message: '' });

    try {
      if (watchmodeData?.trailerVideoId) {
        setTrailerState({
          videoId: watchmodeData.trailerVideoId,
          searchUrl: fallbackSearchUrl,
          message: '',
        });
        return;
      }

      const fallbackData = await getTrailerByTitle(movie.Title);
      setTrailerState({
        videoId: fallbackData?.videoId || null,
        searchUrl: fallbackData?.searchUrl || fallbackSearchUrl,
        message: fallbackData?.message || '',
      });
    } catch {
      setTrailerError('Could not load trailer right now.');
      setTrailerState({
        videoId: null,
        searchUrl: fallbackSearchUrl,
        message: 'Try opening the search results on YouTube.',
      });
    } finally {
      setLoadingTrailer(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="px-4 md:px-8 py-12 text-center">
        <p className="text-red-400 mb-4">{error || 'Movie not found'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded bg-netflix-red hover:bg-netflix-red-hover text-white"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const posterUrl = movie.Poster && movie.Poster !== 'N/A'
    ? movie.Poster
    : 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Poster';

  return (
    <div className="px-4 md:px-8 py-8 max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition"
      >
        {'<'} Back
      </button>

      <div className="flex flex-col md:flex-row gap-8 animate-slide-up">
        <div className="flex-shrink-0 w-full md:w-72">
          <img
            src={posterUrl}
            alt={movie.Title}
            className="w-full rounded-lg shadow-xl aspect-[2/3] object-cover"
          />
        </div>

        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{movie.Title}</h1>

          <div className="flex flex-wrap gap-2 text-gray-400 text-sm mb-4">
            {movie.Year && <span>{movie.Year}</span>}
            {movie.Runtime && movie.Runtime !== 'N/A' && <span>| {movie.Runtime}</span>}
            {movie.Rated && movie.Rated !== 'N/A' && <span>| {movie.Rated}</span>}
          </div>

          {movie.imdbRating && movie.imdbRating !== 'N/A' && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-amber-500/20 text-amber-400 text-sm font-medium mb-4">
              IMDb {movie.imdbRating}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`px-4 py-2 rounded font-medium transition ${
                isFavorite
                  ? 'bg-gray-600 text-white'
                  : 'bg-netflix-red hover:bg-netflix-red-hover text-white'
              } disabled:opacity-50`}
            >
              {favLoading ? '...' : isFavorite ? 'In My List' : '+ Add to My List'}
            </button>
            <button
              onClick={openTrailer}
              className="px-4 py-2 rounded font-medium bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
            >
              Watch Trailer
            </button>
          </div>

          {movie.Plot && movie.Plot !== 'N/A' && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Plot</h3>
              <p className="text-gray-300 leading-relaxed">{movie.Plot}</p>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Where to Watch</h3>
            <WatchProviders
              providers={watchmodeData.providers}
              loading={watchmodeLoading}
              error={watchmodeError}
            />
            {!watchmodeLoading && !watchmodeError && watchmodeData?.message ? (
              <p className="text-gray-500 text-xs mt-2">{watchmodeData.message}</p>
            ) : null}
          </div>

          <dl className="grid gap-2 text-sm">
            {movie.Released && movie.Released !== 'N/A' && (
              <>
                <dt className="text-gray-500">Released</dt>
                <dd className="text-gray-300">{movie.Released}</dd>
              </>
            )}
            {movie.Genre && movie.Genre !== 'N/A' && (
              <>
                <dt className="text-gray-500">Genre</dt>
                <dd className="text-gray-300">{movie.Genre}</dd>
              </>
            )}
            {movie.Director && movie.Director !== 'N/A' && (
              <>
                <dt className="text-gray-500">Director</dt>
                <dd className="text-gray-300">{movie.Director}</dd>
              </>
            )}
            {movie.Actors && movie.Actors !== 'N/A' && (
              <>
                <dt className="text-gray-500">Actors</dt>
                <dd className="text-gray-300">{movie.Actors}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      <TrailerModal
        open={showTrailer}
        movieTitle={movie.Title}
        loading={loadingTrailer}
        error={trailerError}
        videoId={trailerState.videoId}
        searchUrl={trailerState.searchUrl}
        message={trailerState.message}
        onClose={closeTrailer}
      />
    </div>
  );
}
