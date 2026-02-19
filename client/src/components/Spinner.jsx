export default function Spinner({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
