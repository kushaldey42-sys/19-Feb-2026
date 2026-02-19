import express from 'express';
import Favorite from '../models/Favorite.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All favorite routes require authentication
router.use(protect);

/**
 * GET /api/favorites - Get user's favorites
 */
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

/**
 * POST /api/favorites - Add movie to favorites
 */
router.post('/', async (req, res) => {
  try {
    const { imdbID, title, year, poster, type } = req.body;
    if (!imdbID) {
      return res.status(400).json({ message: 'imdbID is required' });
    }

    const existing = await Favorite.findOne({ userId: req.user._id, imdbID });
    if (existing) {
      return res.status(400).json({ message: 'Already in favorites' });
    }

    const favorite = await Favorite.create({
      userId: req.user._id,
      imdbID,
      title: title || '',
      year: year || '',
      poster: poster || '',
      type: type || 'movie',
    });
    res.status(201).json(favorite);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

/**
 * DELETE /api/favorites/:imdbID - Remove from favorites
 */
router.delete('/:imdbID', async (req, res) => {
  try {
    const deleted = await Favorite.findOneAndDelete({
      userId: req.user._id,
      imdbID: req.params.imdbID,
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

/**
 * GET /api/favorites/check/:imdbID - Check if movie is favorited
 */
router.get('/check/:imdbID', async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user._id,
      imdbID: req.params.imdbID,
    });
    res.json({ isFavorite: !!favorite });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

export default router;
