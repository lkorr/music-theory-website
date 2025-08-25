import { useRef, useState, useCallback, useEffect, useMemo, memo } from "react";
import { Play, Pause, Square, RotateCcw, Volume2, ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Eye, EyeOff, Info } from "lucide-react";

const getMidiNoteName = (midiNote) => {
    const noteNames = ["C","C# / Db","D","D# / Eb","E","F","F# / Gb","G","G# / Ab","A","A# / Bb","B"];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = noteNames[midiNote % 12];
    return `${note}${octave}`;
};

const isBlackKey = (midiNote) => {
    const noteInOctave = midiNote % 12;
    return [1, 3, 6, 8, 10].includes(noteInOctave);
};

// Memoized Note component to prevent unnecessary re-renders
const Note = memo(({ note, noteHeight, beatWidth, startNote, endNote, color, opacity = 1, onClick, isError }) => {
    const top = (endNote - note.note) * noteHeight;
    const left = note.beat * beatWidth;
    const width = note.duration * beatWidth - 2;
    
    return (
        <div
            className={`absolute rounded-sm cursor-pointer transition-all ${isError ? 'animate-pulse' : ''}`}
            style={{
                top: `${top}px`,
                left: `${left}px`,
                width: `${width}px`,
                height: `${noteHeight - 2}px`,
                backgroundColor: color,
                opacity: opacity,
                border: isError ? '2px solid red' : '1px solid rgba(0,0,0,0.3)',
                zIndex: 10
            }}
            onClick={() => onClick && onClick(note)}
        />
    );
});

Note.displayName = 'Note';

export default function OptimizedPianoRoll({
    isPlaying,
    setIsPlaying,
    handlePlayPause,
    resetExercise,
    tempo,
    setTempo,
    currentExercise,
    userNotes,
    setUserNotes,
    playNote,
    voiceRanges,
    pianoRollConfig,
    speciesNumber,
    voiceCategory,
}) {
    const [showLabels, setShowLabels] = useState(true);
    const [showVoiceRanges, setShowVoiceRanges] = useState(false);
    const [showGuidance, setShowGuidance] = useState(false);
    const [ruleViolations, setRuleViolations] = useState([]);
    const [validationResult, setValidationResult] = useState(null);
    const pianoRollRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const noteLabelsRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(0.6);
    const [isPanning, setIsPanning] = useState(false);
    const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });
    const [panStartScroll, setPanStartScroll] = useState({ x: 0, y: 0 });
    const [draggedNote, setDraggedNote] = useState(null);
    const headerScrollRef = useRef(null);

    // Piano roll dimensions and settings
    const noteHeight = 16;
    const beatWidth = 35 * zoomLevel;
    const startNote = 24; // C1
    const endNote = 96;   // C7
    const totalNotes = endNote - startNote + 1;

    const totalBeats = useMemo(() => {
        if (!currentExercise) return 64;
        const cantusFirmusEnd = Math.max(...currentExercise.cantus_firmus.map((n) => n.beat + n.duration));
        const exerciseMeasures = currentExercise.measureCount || Math.ceil(cantusFirmusEnd / 4);
        return Math.max(exerciseMeasures * 4 + 32, 80);
    }, [currentExercise]);

    const containerWidth = useMemo(() => {
        const maxBeats = Math.min(totalBeats + 20, 80);
        return maxBeats * beatWidth;
    }, [totalBeats, beatWidth]);

    // Handle note placement with species-specific constraints
    const handleNotePlace = useCallback((beat, midiNote) => {
        if (isPlaying) return;

        const duration = getNoteDurationForSpecies(speciesNumber);
        const quantizedBeat = quantizeBeatForSpecies(beat, speciesNumber);
        
        const newNote = {
            note: midiNote,
            beat: quantizedBeat,
            duration: duration,
            id: `user-${Date.now()}-${Math.random()}`
        };

        const existingNoteIndex = userNotes.findIndex(
            n => n.beat === newNote.beat && Math.abs(n.note - newNote.note) < 1
        );

        if (existingNoteIndex >= 0) {
            setUserNotes(userNotes.filter((_, i) => i !== existingNoteIndex));
        } else {
            if (speciesNumber === 1) {
                const measureStart = Math.floor(quantizedBeat / 4) * 4;
                const conflictingNotes = userNotes.filter(n => {
                    const noteMeasureStart = Math.floor(n.beat / 4) * 4;
                    return noteMeasureStart === measureStart;
                });
                
                if (conflictingNotes.length > 0) {
                    const filteredNotes = userNotes.filter(n => {
                        const noteMeasureStart = Math.floor(n.beat / 4) * 4;
                        return noteMeasureStart !== measureStart;
                    });
                    setUserNotes([...filteredNotes, newNote]);
                } else {
                    setUserNotes([...userNotes, newNote]);
                }
            } else {
                const measureStart = Math.floor(quantizedBeat / 4) * 4;
                const notesInMeasure = userNotes.filter(n => {
                    const noteMeasureStart = Math.floor(n.beat / 4) * 4;
                    return noteMeasureStart === measureStart;
                });
                
                const maxNotesPerMeasure = getMaxNotesPerMeasure(speciesNumber);
                if (notesInMeasure.length < maxNotesPerMeasure) {
                    setUserNotes([...userNotes, newNote]);
                }
            }
            playNote(midiNote, 0.3);
        }
    }, [userNotes, setUserNotes, playNote, isPlaying, speciesNumber]);

    const getNoteDurationForSpecies = (species) => {
        switch (species) {
            case 1: return 4;
            case 2: return 2;
            case 3: return 1;
            case 4: return 2;
            case 5: return 1;
            default: return 4;
        }
    };

    const quantizeBeatForSpecies = (beat, species) => {
        switch (species) {
            case 1: 
                return Math.floor(beat / 4) * 4;
            case 2:
                return Math.round(beat / 2) * 2;
            case 3:
                return Math.round(beat);
            case 4:
                return Math.round(beat / 2) * 2;
            case 5:
                return Math.round(beat);
            default:
                return Math.round(beat);
        }
    };

    const getMaxNotesPerMeasure = (species) => {
        switch (species) {
            case 1: return 1;
            case 2: return 2;
            case 3: return 4;
            case 4: return 2;
            case 5: return 8;
            default: return 4;
        }
    };

    const handleMouseDown = useCallback((e) => {
        if (e.target === pianoRollRef.current || e.target.classList.contains('grid-cell')) {
            const rect = pianoRollRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const beat = x / beatWidth;
            const noteIndex = Math.floor(y / noteHeight);
            const midiNote = startNote + totalNotes - 1 - noteIndex;
            
            handleNotePlace(beat, midiNote);
        }
    }, [beatWidth, noteHeight, startNote, totalNotes, handleNotePlace]);

    const handleNoteClick = useCallback((note) => {
        const noteIndex = userNotes.findIndex(n => n.id === note.id);
        if (noteIndex >= 0) {
            setUserNotes(userNotes.filter(n => n.id !== note.id));
        }
    }, [userNotes, setUserNotes]);

    const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
    const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.3));
    const scrollLeft = () => scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
    const scrollRight = () => scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });

    // Sync header scroll with piano roll scroll
    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        const headerScroll = headerScrollRef.current;
        
        if (!scrollContainer || !headerScroll) return;
        
        const handleScroll = () => {
            headerScroll.scrollLeft = scrollContainer.scrollLeft;
        };
        
        scrollContainer.addEventListener('scroll', handleScroll);
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, []);

    // Create grid background using CSS instead of DOM elements
    const gridBackground = useMemo(() => {
        const verticalLines = [];
        for (let i = 0; i <= Math.ceil(containerWidth / beatWidth); i++) {
            const isMeasureLine = i % 4 === 0;
            verticalLines.push(
                <div
                    key={`vline-${i}`}
                    className={`absolute ${isMeasureLine ? 'border-l-2 border-gray-400' : 'border-l border-gray-200'}`}
                    style={{
                        left: `${i * beatWidth}px`,
                        top: 0,
                        height: `${totalNotes * noteHeight}px`,
                        zIndex: 2
                    }}
                />
            );
        }
        
        const horizontalLines = [];
        for (let i = 0; i <= totalNotes; i++) {
            const midiNote = startNote + totalNotes - 1 - i;
            const isBlack = isBlackKey(midiNote);
            horizontalLines.push(
                <div
                    key={`hline-${i}`}
                    className="absolute border-b border-gray-200"
                    style={{
                        top: `${i * noteHeight}px`,
                        left: 0,
                        width: `${containerWidth}px`,
                        height: `${noteHeight}px`,
                        backgroundColor: isBlack ? '#f9fafb' : 'transparent',
                        zIndex: 1
                    }}
                />
            );
        }
        
        return [...horizontalLines, ...verticalLines];
    }, [containerWidth, beatWidth, totalNotes, noteHeight, startNote]);

    return (
        <div className="w-full bg-gray-900 rounded-lg shadow-xl p-6">
            {/* Controls */}
            <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                    <button onClick={handlePlayPause} className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                        {isPlaying ? <Pause size={20} className="text-gray-900" /> : <Play size={20} className="text-gray-900 ml-1" />}
                    </button>
                    <button onClick={resetExercise} className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                        <RotateCcw size={20} className="text-white" />
                    </button>
                    
                    <div className="flex items-center space-x-2 ml-4">
                        <button onClick={scrollLeft} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
                            <ChevronLeft size={16} className="text-black" />
                        </button>
                        <span className="text-xs text-black/60 px-2">Scroll</span>
                        <button onClick={scrollRight} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
                            <ChevronRight size={16} className="text-black" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                        <button onClick={zoomOut} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
                            <ZoomOut size={16} className="text-black" />
                        </button>
                        <span className="text-xs text-black/60 px-2">Zoom {Math.round(zoomLevel * 100)}%</span>
                        <button onClick={zoomIn} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
                            <ZoomIn size={16} className="text-black" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Volume2 size={16} className="text-white" />
                        <span className="text-sm text-white">Tempo: {tempo}</span>
                        <input 
                            type="range" 
                            min="60" 
                            max="200" 
                            value={tempo} 
                            onChange={(e) => setTempo(parseInt(e.target.value))} 
                            className="w-20" 
                        />
                    </div>
                </div>
            </div>

            {/* Piano Roll */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Measure Header */}
                <div className="flex bg-gray-50 border-b border-gray-200 sticky top-0 z-30">
                    <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-300 h-6"></div>
                    <div ref={headerScrollRef} className="flex-1 relative h-6 overflow-hidden">
                        <div className="absolute top-0 left-0 flex items-center text-xs text-gray-600 h-full" style={{ width: `${containerWidth}px` }}>
                            {Array.from({ length: Math.ceil(totalBeats / 4) }, (_, i) => (
                                <div key={`measure-${i}`} className="absolute flex items-center justify-center font-medium" style={{ left: `${i * 4 * beatWidth + 2}px`, width: `${4 * beatWidth - 4}px` }}>
                                    m.{i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="flex">
                    <div ref={scrollContainerRef} className="flex-1 overflow-auto" style={{ height: "676px" }}>
                        <div className="flex">
                            {/* Note Labels */}
                            <div ref={noteLabelsRef} className="w-16 flex-shrink-0 border-r border-gray-300 bg-white sticky left-0 z-20">
                                <div style={{ height: `${totalNotes * noteHeight}px` }}>
                                    {Array.from({ length: totalNotes }, (_, i) => {
                                        const midiNote = startNote + totalNotes - 1 - i;
                                        return (
                                            <div key={midiNote} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
                                                height: `${noteHeight}px`,
                                                backgroundColor: isBlackKey(midiNote) ? '#000000' : '#ffffff',
                                                color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                            }}>
                                                {showLabels && <span>{getMidiNoteName(midiNote)}</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Piano Roll Grid - Optimized */}
                            <div
                                ref={pianoRollRef}
                                className="relative cursor-crosshair bg-white grid-cell"
                                style={{ width: `${containerWidth}px`, height: `${totalNotes * noteHeight}px` }}
                                onMouseDown={handleMouseDown}
                            >
                                {/* Grid lines only (no individual squares) */}
                                {gridBackground}

                                {/* Cantus Firmus Notes */}
                                {currentExercise?.cantus_firmus?.map((note) => (
                                    <Note
                                        key={note.id}
                                        note={note}
                                        noteHeight={noteHeight}
                                        beatWidth={beatWidth}
                                        startNote={startNote}
                                        endNote={endNote}
                                        color="#3B82F6"
                                        opacity={0.8}
                                    />
                                ))}

                                {/* User Notes */}
                                {userNotes.map((note) => {
                                    const hasError = ruleViolations.some(v => v.noteId === note.id);
                                    return (
                                        <Note
                                            key={note.id}
                                            note={note}
                                            noteHeight={noteHeight}
                                            beatWidth={beatWidth}
                                            startNote={startNote}
                                            endNote={endNote}
                                            color={hasError ? "#EF4444" : "#10B981"}
                                            onClick={handleNoteClick}
                                            isError={hasError}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}