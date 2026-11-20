import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { getTrailerByTitle, searchMovies } from '../api/movies';
import MovieRow from '../components/MovieRow';
import Spinner from '../components/Spinner';
import TrailerModal from '../components/TrailerModal';

const HERO_PLACEHOLDER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80';
const HOME_ROW_CONFIG = [
  { id: 'trending', title: 'Trending Now', query: 'batman' },
  { id: 'action', title: 'Action Hits', query: 'mission impossible' },
  { id: 'scifi', title: 'Sci-Fi Picks', query: 'star wars' },
  { id: 'comedy', title: 'Comedy Night', query: 'comedy' },
  { id: 'family', title: 'Family Watch', query: 'disney' },
  { id: 'classic', title: 'Classic Favorites', query: 'godfather' },
];

function getInitialHomeRows() {
  return HOME_ROW_CONFIG.map((row) => ({
    ...row,
    movies: [],
    loading: true,
  }));
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [homeRows, setHomeRows] = useState(() => getInitialHomeRows());
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);
  const [movieTitle, setMovieTitle] = useState('');
  const [trailerData, setTrailerData] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const [trailerError, setTrailerError] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Initial curated home rows
  useEffect(() => {
    let cancelled = false;
    setHomeRows(getInitialHomeRows());

    HOME_ROW_CONFIG.forEach((row) => {
      searchMovies(row.query, 1)
        .then((data) => {
          if (cancelled) return;
          const movies = data?.Response === 'False' ? [] : (data.Search || []);
          setHomeRows((prev) => prev.map((item) => (
            item.id === row.id ? { ...item, movies, loading: false } : item
          )));
        })
        .catch(() => {
          if (cancelled) return;
          setHomeRows((prev) => prev.map((item) => (
            item.id === row.id ? { ...item, movies: [], loading: false } : item
          )));
        });
      });

    return () => { cancelled = true; };
  }, []);

  // Debounced search
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      setSearchPage(1);
      setTotalResults(0);
      setSearchError('');
      return;
    }
    let cancelled = false;
    setLoadingSearch(true);
    setSearchError('');
    searchMovies(debouncedSearch, 1)
      .then((data) => {
        if (cancelled) return;
        if (data.Response === 'False') {
          setSearchResults([]);
          setSearchError(data.Error || 'No results');
          setTotalResults(0);
        } else {
          setSearchResults(data.Search || []);
          setTotalResults(Number(data.totalResults) || 0);
          setSearchPage(1);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSearchResults([]);
          setSearchError('Search failed. Try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSearch(false);
      });
    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const loadMoreSearch = () => {
    if (!debouncedSearch.trim() || loadingSearch || searchResults.length >= totalResults) return;
    const nextPage = searchPage + 1;
    setLoadingSearch(true);
    searchMovies(debouncedSearch, nextPage)
      .then((data) => {
        if (data.Search?.length) {
          setSearchResults((prev) => [...prev, ...data.Search]);
          setSearchPage(nextPage);
        }
      })
      .finally(() => setLoadingSearch(false));
  };

  const totalPages = totalResults ? Math.ceil(totalResults / 10) : 0;
  const hasMore = searchPage < totalPages && searchResults.length < totalResults;

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

  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[320px] flex items-end pb-16 md:pb-24 px-4 md:px-8">
        <div className="absolute inset-0">
          <img
            src={HERO_PLACEHOLDER}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Movies & More
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Search for any movie. Add to your list. Enjoy.
          </p>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for a movie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 pl-4 pr-12 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:border-netflix-red focus:ring-1 focus:ring-netflix-red outline-none transition"
            />
            {loadingSearch && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-netflix-red border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mt-6">
        {searchQuery.trim() ? (
          <>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-8">
              Search: &quot;{debouncedSearch}&quot;
            </h2>
            {loadingSearch && searchResults.length === 0 ? (
              <div className="px-4 md:px-8"><Spinner className="py-12" /></div>
            ) : searchError ? (
              <p className="text-gray-400 px-4 md:px-8">{searchError}</p>
            ) : searchResults.length > 0 ? (
              <>
                <MovieRow title="Results" movies={searchResults} onPreviewTrailer={openTrailer} />
                {hasMore && (
                  <div className="flex justify-center px-4 md:px-8">
                    <button
                      onClick={loadMoreSearch}
                      disabled={loadingSearch}
                      className="px-6 py-2 rounded bg-netflix-red hover:bg-netflix-red-hover text-white font-medium disabled:opacity-50"
                    >
                      {loadingSearch ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </>
        ) : (
          <>
            {homeRows.map((row) => (
              <MovieRow
                key={row.id}
                title={row.title}
                movies={row.movies}
                loading={row.loading}
                onPreviewTrailer={openTrailer}
              />
            ))}
          </>
        )}
      </div>
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
