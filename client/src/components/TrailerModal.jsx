import { useEffect } from 'react';

export default function TrailerModal({
  open,
  movieTitle,
  trailerData,
  loading,
  error,
  onClose,
  videoId,
  searchUrl,
  message,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const resolvedVideoId = videoId || trailerData?.videoId || null;
  const hasVideo = Boolean(resolvedVideoId);
  const fallbackUrl = searchUrl || trailerData?.searchUrl || '';
  const fallbackMessage = error || message || trailerData?.message || 'Try opening the search results on YouTube.';
  const embedUrl = hasVideo
    ? `https://www.youtube.com/embed/${resolvedVideoId}?autoplay=1&rel=0&modestbranding=1`
    : '';

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-4xl rounded-xl border border-white/10 bg-netflix-black shadow-2xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Trailer preview for ${movieTitle}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close trailer modal"
          className="absolute right-3 top-3 z-10 w-9 h-9 rounded-full bg-black/70 text-white text-xl leading-none hover:bg-netflix-red transition"
        >
          X
        </button>

        <div className="p-4 md:p-5 border-b border-white/10">
          <h3 className="text-white text-lg md:text-xl font-semibold pr-10">
            Preview Trailer: {movieTitle}
          </h3>
        </div>

        <div className="p-4 md:p-5">
          {loading ? (
            <div className="aspect-video w-full rounded-lg bg-black/50 border border-white/10 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hasVideo ? (
            <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10 bg-black">
              <iframe
                className="w-full h-full"
                src={embedUrl}
                title={`${movieTitle} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full rounded-lg bg-black/50 border border-white/10 flex flex-col items-center justify-center text-center px-6">
              <p className="text-gray-200 text-lg font-semibold mb-2">Trailer not available.</p>
              <p className="text-gray-400 text-sm mb-4">{fallbackMessage}</p>
              {fallbackUrl && (
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded bg-netflix-red hover:bg-netflix-red-hover text-white font-medium transition"
                >
                  Open on YouTube
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
