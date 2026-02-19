import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const passwordRules = [
  'At least 8 characters',
  'One uppercase letter',
  'One lowercase letter',
  'One number',
];

function checkPassword(password) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
  ];
}

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const pwdChecks = checkPassword(password);
  const confirmMatch = !confirmPassword || password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!pwdChecks.every(Boolean)) {
      setError('Please meet all password requirements');
      return;
    }
    setLoading(true);
    try {
      await signup(fullName, email, password, confirmPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-netflix-red/20 via-netflix-black to-netflix-black" />
      <div className="absolute inset-0 bg-[url('https://assets.nflxext.com/ffe/siteui/vlv3/9d3533b2-0e2b-40b2-95e0-ecd7979cc88b/4b0c1c4e-0cdf-4c4e-8b8f-8f8f8f8f8f8f/site-ui.jpg')] bg-cover bg-center opacity-20" />

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="bg-black/75 backdrop-blur-md rounded-lg shadow-2xl border border-white/10 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            Sign Up
          </h1>
          <p className="text-gray-400 text-sm mb-6">Create an account to start exploring movies.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-red-500/20 text-red-400 text-sm border border-red-500/30">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                minLength={2}
                className="w-full px-4 py-3 rounded bg-gray-800/80 border border-gray-600 text-white placeholder-gray-500 focus:border-netflix-red focus:ring-1 focus:ring-netflix-red outline-none transition"
              />
            </div>
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
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                {passwordRules.map((rule, i) => (
                  <li key={i} className={pwdChecks[i] ? 'text-green-400' : ''}>
                    {pwdChecks[i] ? '✓ ' : '○ '}{rule}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full px-4 py-3 rounded bg-gray-800/80 border text-white placeholder-gray-500 focus:ring-1 outline-none transition ${
                  confirmMatch ? 'border-gray-600 focus:border-netflix-red focus:ring-netflix-red' : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                }`}
              />
              {!confirmMatch && (
                <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !pwdChecks.every(Boolean) || password !== confirmPassword}
              className="w-full py-3 rounded font-semibold bg-netflix-red hover:bg-netflix-red-hover text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-netflix-red hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
