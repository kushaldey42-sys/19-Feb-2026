import express from 'express';

const router = express.Router();
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'daaf6ce3';
const BASE_URL = 'https://www.omdbapi.com';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_SEARCH_API = 'https://www.googleapis.com/youtube/v3/search';

function buildYoutubeSearchUrl(title) {
  const query = `${title} official trailer`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/**
 * GET /api/movies/search?q=batman&page=1
 * Search movies by title (OMDB)
 */
router.get('/search', async (req, res) => {
  try {
    const { q = '', page = 1 } = req.query;
    if (!q.trim()) {
      return res.json({ Search: [], totalResults: '0', Response: 'True' });
    }

    const url = `${BASE_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(q.trim())}&page=${page}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'False') {
      return res.json({ Search: [], totalResults: '0', Response: 'True', Error: data.Error });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch movies', error: err.message });
  }
});

/**
 * GET /api/movies/trailer?title=movie+title
 * Find trailer video ID on YouTube by movie title
 */
router.get('/trailer', async (req, res) => {
  const rawTitle = typeof req.query.title === 'string' ? req.query.title.trim() : '';
  const searchUrl = buildYoutubeSearchUrl(rawTitle);

  if (!rawTitle) {
    return res.status(400).json({
      found: false,
      videoId: null,
      embedUrl: null,
      searchUrl,
      message: 'Movie title is required',
    });
  }

  if (!YOUTUBE_API_KEY) {
    return res.json({
      found: false,
      videoId: null,
      embedUrl: null,
      searchUrl,
      message: 'Trailer service not configured',
    });
  }

  try {
    const params = new URLSearchParams({
      key: YOUTUBE_API_KEY,
      part: 'snippet',
      q: `${rawTitle} official trailer`,
      type: 'video',
      maxResults: '1',
      videoEmbeddable: 'true',
      safeSearch: 'moderate',
    });

    const response = await fetch(`${YOUTUBE_SEARCH_API}?${params}`);
    if (!response.ok) {
      throw new Error(`YouTube API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const firstResult = data?.items?.[0];
    const videoId = firstResult?.id?.videoId || null;

    if (!videoId) {
      return res.json({
        found: false,
        videoId: null,
        embedUrl: null,
        searchUrl,
      });
    }

    return res.json({
      found: true,
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      searchUrl,
    });
  } catch (err) {
    return res.json({
      found: false,
      videoId: null,
      embedUrl: null,
      searchUrl,
      message: 'Could not fetch trailer right now',
      error: err.message,
    });
  }
});

/**
 * GET /api/movies/:id
 * Get single movie details by IMDB ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${BASE_URL}/?apikey=${OMDB_API_KEY}&i=${id}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'False') {
      return res.status(404).json({ message: data.Error || 'Movie not found' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch movie details', error: err.message });
  }
});

export default router;
