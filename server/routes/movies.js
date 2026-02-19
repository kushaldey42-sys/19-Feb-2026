import express from 'express';

const router = express.Router();
const OMDB_API_KEY = process.env.OMDB_API_KEY || 'daaf6ce3';
const BASE_URL = 'https://www.omdbapi.com';

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
