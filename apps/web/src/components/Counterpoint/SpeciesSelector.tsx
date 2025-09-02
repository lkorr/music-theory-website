const speciesInfo = {
  1: "Note against note - basic counterpoint",
  2: "Two notes against one - passing tones allowed",
  3: "Four notes against one - more melodic freedom",
  4: "Syncopated counterpoint - suspensions and resolutions",
  5: "Florid counterpoint - mix of all species",
};

export default function SpeciesSelector({ selectedSpecies, handleSpeciesChange }) {
  return (
    <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">Species Type</h3>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((species) => (
            <button
              key={species}
              onClick={() => handleSpeciesChange(species)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedSpecies === species
                  ? "bg-[#151515] text-white"
                  : "bg-white/30 text-black hover:bg-white/40"
              }`}
            >
              Species {species}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 text-sm text-black/70">
        {speciesInfo[selectedSpecies]}
      </div>
    </div>
  );
}
