import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const { imdbID, Title, Year, Poster, Type } = movie;
  const posterUrl = Poster && Poster !== 'N/A' ? Poster : 'https://via.placeholder.com/300x450/1a1a1a/666?text=No+Poster';

  return (
    <Link
      to={`/movie/${imdbID}`}
      className="flex-shrink-0 w-36 sm:w-44 md:w-52 group"
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg transition transform group-hover:scale-105 group-hover:shadow-xl">
        <img
          src={posterUrl}
          alt={Title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-2 px-0.5">
        <h3 className="font-semibold text-white text-sm md:text-base truncate group-hover:text-netflix-red transition">
          {Title}
        </h3>
        <p className="text-gray-400 text-xs">
          {Year} {Type ? `• ${Type}` : ''}
        </p>
      </div>
    </Link>
  );
}
