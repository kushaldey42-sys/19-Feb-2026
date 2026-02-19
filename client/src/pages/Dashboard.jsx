import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { searchMovies } from '../api/movies';
import MovieRow from '../components/MovieRow';
import Spinner from '../components/Spinner';

const HERO_PLACEHOLDER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Initial trending (batman as default)
  useEffect(() => {
    let cancelled = false;
    setLoadingTrending(true);
    searchMovies('batman', 1)
      .then((data) => {
        if (!cancelled && data.Search) setTrending(data.Search);
      })
      .catch(() => {
        if (!cancelled) setTrending([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingTrending(false);
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
                <MovieRow title="Results" movies={searchResults} />
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
            {loadingTrending ? (
              <div className="px-4 md:px-8"><Spinner className="py-12" /></div>
            ) : (
              <MovieRow title="Trending" movies={trending} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
