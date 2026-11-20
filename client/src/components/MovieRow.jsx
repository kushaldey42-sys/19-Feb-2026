import MovieCard from './MovieCard';

function RowSkeletonCard() {
  return (
    <div className="flex-shrink-0 w-36 sm:w-44 md:w-52 animate-pulse">
      <div className="aspect-[2/3] rounded-lg bg-white/10 border border-white/10" />
      <div className="mt-2 space-y-2">
        <div className="h-4 rounded bg-white/10 w-5/6" />
        <div className="h-3 rounded bg-white/10 w-2/3" />
        <div className="h-9 rounded bg-white/10 w-full mt-2" />
      </div>
    </div>
  );
}

export default function MovieRow({ title, movies, onPreviewTrailer, loading = false }) {
  if (!loading && !movies?.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-8">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto scroll-row pb-4 px-4 md:px-8">
        {loading
          ? Array.from({ length: 6 }, (_, index) => <RowSkeletonCard key={`skeleton-${title}-${index}`} />)
          : movies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} onPreviewTrailer={onPreviewTrailer} />
          ))}
      </div>
    </section>
  );
}
