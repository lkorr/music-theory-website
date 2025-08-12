import { useNavigate } from 'react-router';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Page not found</p>
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Go Home
      </button>
    </div>
  );
}