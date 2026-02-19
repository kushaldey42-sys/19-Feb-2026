import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-3 bg-gradient-to-b from-black/80 to-transparent transition-all">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl md:text-3xl font-bold text-netflix-red" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
            NETFLIX
          </span>
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white transition">Home</Link>
          <Link to="/favorites" className="text-sm text-gray-300 hover:text-white transition">My List</Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 hidden sm:inline">{user?.fullName}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm bg-netflix-red hover:bg-netflix-red-hover text-white rounded transition"
            >
              Sign out
            </button>
          </div>
        </nav>
      </header>
      <main className="pt-16">{children}</main>
    </div>
  );
}
