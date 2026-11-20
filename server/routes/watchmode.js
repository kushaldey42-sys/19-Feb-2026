import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY || '';
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function extractYear(value) {
  const year = Number(value);
  return Number.isFinite(year) ? year : null;
}

function extractYoutubeId(url) {
  if (!url) return null;
  const match =
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  return match?.[1] || null;
}

function pickBestTitleMatch(results, movieTitle, movieYear) {
  if (!Array.isArray(results) || results.length === 0) return null;

  const targetName = normalizeText(movieTitle);
  const targetYear = extractYear(movieYear);

  let bestMatch = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const item of results) {
    const currentName = normalizeText(item?.name || item?.title);
    const currentYear = extractYear(item?.year);
    const currentType = normalizeText(item?.type);

    if (!item?.id || !currentName) continue;

    let score = 0;
    if (currentType === 'movie') score += 30;
    if (currentName === targetName) score += 40;
    if (currentName.includes(targetName) || targetName.includes(currentName)) score += 10;
    if (targetYear && currentYear && targetYear === currentYear) score += 20;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch || results[0] || null;
}

function normalizeProviders(sources) {
  if (!Array.isArray(sources)) return [];

  return sources.map((source) => ({
    name: source.name || source.source_name || 'Unknown Platform',
    type: source.type || 'unknown',
    webUrl: source.web_url || source.ios_url || source.android_url || '',
    region: source.region || 'N/A',
    price: source.price ?? null,
    format: source.format || null,
    logoUrl: source.logo_100px || source.logo_50px || source.logo_25px || source.icon_url || '',
  }));
}

function pickTrailerVideo(videos) {
  if (!Array.isArray(videos) || videos.length === 0) {
    return { trailerVideoId: null, trailerUrl: '' };
  }

  const trailerCandidate = videos.find((video) => {
    const kind = normalizeText(video?.type || video?.kind || video?.name || video?.title);
    const site = normalizeText(video?.site || video?.source);
    return kind.includes('trailer') && (site.includes('youtube') || extractYoutubeId(video?.url || video?.link || video?.embed_url));
  }) || videos.find((video) => normalizeText(video?.site || video?.source).includes('youtube'));

  if (!trailerCandidate) {
    return { trailerVideoId: null, trailerUrl: '' };
  }

  const trailerUrl = trailerCandidate.url || trailerCandidate.link || trailerCandidate.embed_url || '';
  const trailerVideoId = extractYoutubeId(trailerUrl) || trailerCandidate.video_id || null;

  return {
    trailerVideoId,
    trailerUrl,
  };
}

router.get('/:title', protect, async (req, res) => {
  const rawTitle = String(req.params.title || '').trim();
  const movieYear = String(req.query.year || '').trim();

  if (!rawTitle) {
    return res.status(400).json({
      found: false,
      watchmodeId: null,
      providers: [],
      trailerVideoId: null,
      trailerUrl: '',
      message: 'Movie title is required',
    });
  }

  if (!WATCHMODE_API_KEY) {
    return res.json({
      found: false,
      watchmodeId: null,
      providers: [],
      trailerVideoId: null,
      trailerUrl: '',
      message: 'Watchmode service not configured',
    });
  }

  try {
    const searchResponse = await axios.get(`${WATCHMODE_BASE_URL}/search/`, {
      params: {
        apiKey: WATCHMODE_API_KEY,
        search_field: 'name',
        search_value: rawTitle,
      },
      timeout: 10000,
    });

    const searchData = searchResponse?.data || {};
    const searchResults = searchData.title_results || searchData.results || [];
    const bestMatch = pickBestTitleMatch(searchResults, rawTitle, movieYear);

    if (!bestMatch?.id) {
      return res.json({
        found: false,
        watchmodeId: null,
        providers: [],
        trailerVideoId: null,
        trailerUrl: '',
        message: 'Not available on Watchmode',
      });
    }

    const watchmodeId = bestMatch.id;

    const [sourcesResponse, videosResponse] = await Promise.allSettled([
      axios.get(`${WATCHMODE_BASE_URL}/title/${watchmodeId}/sources/`, {
        params: { apiKey: WATCHMODE_API_KEY },
        timeout: 10000,
      }),
      axios.get(`${WATCHMODE_BASE_URL}/title/${watchmodeId}/videos/`, {
        params: { apiKey: WATCHMODE_API_KEY },
        timeout: 10000,
      }),
    ]);

    const sources =
      sourcesResponse.status === 'fulfilled'
        ? sourcesResponse.value?.data || []
        : [];
    const videos =
      videosResponse.status === 'fulfilled'
        ? videosResponse.value?.data || []
        : [];

    const providers = normalizeProviders(sources);
    const { trailerVideoId, trailerUrl } = pickTrailerVideo(videos);

    return res.json({
      found: providers.length > 0 || Boolean(trailerVideoId),
      watchmodeId,
      providers,
      trailerVideoId,
      trailerUrl,
      message: providers.length === 0 && !trailerVideoId ? 'Not available right now' : '',
    });
  } catch (err) {
    const status = err?.response?.status;
    const rateLimited = status === 429;

    return res.json({
      found: false,
      watchmodeId: null,
      providers: [],
      trailerVideoId: null,
      trailerUrl: '',
      message: rateLimited ? 'Watchmode API limit reached. Please try again later.' : 'Could not fetch Watchmode data right now',
    });
  }
});

export default router;
