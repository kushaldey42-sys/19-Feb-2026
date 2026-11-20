import axios from 'axios';

const API_BASE = '/api';

export async function searchMovies(query, page = 1) {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetch(`${API_BASE}/movies/search?${params}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getMovieById(id) {
  const res = await fetch(`${API_BASE}/movies/${id}`, { credentials: 'include' });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Movie not found');
    throw new Error('Failed to load movie');
  }
  return res.json();
}

export async function getTrailerByTitle(title) {
  const params = new URLSearchParams({ title: title.trim() });
  const res = await fetch(`${API_BASE}/movies/trailer?${params}`, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to load trailer');
  }
  return res.json();
}

export async function getWatchmodeByTitle(title, year = '') {
  const normalizedTitle = title?.trim();
  if (!normalizedTitle) {
    throw new Error('Title is required');
  }

  const response = await axios.get(`${API_BASE}/watchmode/${encodeURIComponent(normalizedTitle)}`, {
    withCredentials: true,
    params: year ? { year } : {},
  });
  return response.data;
}

export async function getFavorites() {
  const res = await fetch(`${API_BASE}/favorites`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load favorites');
  return res.json();
}

export async function addFavorite(movie) {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      imdbID: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      type: movie.Type,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add favorite');
  return data;
}

export async function removeFavorite(imdbID) {
  const res = await fetch(`${API_BASE}/favorites/${imdbID}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to remove favorite');
  return res.json();
}

export async function checkFavorite(imdbID) {
  const res = await fetch(`${API_BASE}/favorites/check/${imdbID}`, { credentials: 'include' });
  if (!res.ok) return false;
  const data = await res.json();
  return data.isFavorite;
}
