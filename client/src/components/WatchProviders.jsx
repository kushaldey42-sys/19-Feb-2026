import Spinner from './Spinner';

export default function WatchProviders({ providers, loading, error }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-300 text-sm">
        {error}
      </div>
    );
  }

  if (!providers?.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-gray-400 text-sm">
        Not available right now.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {providers.map((provider, index) => (
        <article
          key={`${provider.name}-${provider.region}-${index}`}
          className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
            {provider.logoUrl ? (
              <img src={provider.logoUrl} alt={`${provider.name} logo`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-400 font-semibold">APP</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold truncate">{provider.name}</h4>
            <p className="text-gray-400 text-xs mt-1">
              {provider.region || 'N/A'} {provider.format ? `| ${provider.format}` : ''}
            </p>
            <p className="text-gray-300 text-xs mt-1">
              {provider.price != null && provider.price !== '' ? `$${provider.price}` : 'Included / Unknown pricing'}
            </p>
            {provider.webUrl ? (
              <a
                href={provider.webUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex mt-3 px-3 py-1.5 rounded bg-netflix-red hover:bg-netflix-red-hover text-white text-xs font-medium transition"
              >
                Watch Now
              </a>
            ) : (
              <span className="inline-flex mt-3 px-3 py-1.5 rounded bg-gray-700 text-gray-300 text-xs font-medium">
                Link unavailable
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
