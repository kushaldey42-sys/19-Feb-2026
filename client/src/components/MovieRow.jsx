import MovieCard from './MovieCard';

export default function MovieRow({ title, movies }) {
  if (!movies?.length) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-8">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto scroll-row pb-4 px-4 md:px-8">
        {movies.map((movie) => (
          <MovieCard key={movie.imdbID} movie={movie} />
        ))}
      </div>
    </section>
  );
}
