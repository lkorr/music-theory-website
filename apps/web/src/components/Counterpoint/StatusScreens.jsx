export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-sm font-bold">♪</span>
        </div>
        <p className="text-black font-medium">Loading exercises...</p>
      </div>
    </div>
  );
}

export function ErrorScreen({ error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9D6E8] to-[#D8D6F9] flex items-center justify-center">
      <div className="text-center bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <p className="text-red-600 font-medium mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#151515] text-white px-4 py-2 rounded-full font-medium hover:bg-[#333] transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
