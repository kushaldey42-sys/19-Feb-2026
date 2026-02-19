import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black relative overflow-hidden">
      {/* Background gradient / blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/20 via-netflix-black to-netflix-black" />
      <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc88b/4b0c1c4e-0cdf-4c4e-8b8f-8f8f8f8f8f8f/site-ui.jpg')] bg-cover bg-center opacity-20" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="bg-black/75 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Sign In
          </h1>
          <p className="text-gray-400 text-sm mb-6">Welcome back. Sign in to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded bg-red-500/20 text-red-400 text-sm border border-red-500/30">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded bg-gray-800/80 border border-gray-600 text-white placeholder-gray-500 focus:border-netflix-red focus:ring-1 focus:ring-netflix-red outline-none transition"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded bg-gray-800/80 border border-gray-600 text-white placeholder-gray-500 focus:border-netflix-red focus:ring-1 focus:ring-netflix-red outline-none transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded font-semibold bg-netflix-red hover:bg-netflix-red-hover text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            New to Netflix?{' '}
            <Link to="/signup" className="text-netflix-red hover:underline font-medium">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
