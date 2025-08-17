import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Play, Pause, Square, RotateCcw, Volume2, ChevronRight, ChevronLeft, ZoomIn, ZoomOut, Eye, EyeOff } from "lucide-react";

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

const getNoteDurationForSpecies = (speciesType) => {
    switch (speciesType) {
        case 1: return 4;  // Species 1: whole notes (same as cantus firmus)
        case 2: return 2;  // Species 2: half notes 
        case 3: return 1;  // Species 3: quarter notes
        case 4: return 2;  // Species 4: half notes with syncopation
        case 5: return 1;  // Species 5: mixed values
        default: return 4;
    }
};

export default function PianoRoll({
    isPlaying,
    setIsPlaying,
    handlePlayPause,
    resetExercise,
    tempo,
    setTempo,
    currentExercise,
    userNotes,
    setUserNotes,
    ruleViolations,
    draggedNote,
    setDraggedNote,
    playNote,
}) {
    const [showLabels, setShowLabels] = useState(true);
    const pianoRollRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const noteLabelsRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, 0.5 = zoomed out 50%, etc.
    const [isPanning, setIsPanning] = useState(false);
    const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });
    const [panStartScroll, setPanStartScroll] = useState({ x: 0, y: 0 });
    const [isMouseOverPianoRoll, setIsMouseOverPianoRoll] = useState(false);

    const baseBeatWidth = 20; // Reduced from 80 to make each bar represent quarter note (4x faster)
    const beatWidth = baseBeatWidth * zoomLevel;
    const noteHeight = 20;
    const octaves = 6; // Extended from 4 to 6 octaves (C1 to C7)
    const startNote = 24; // Changed from 48 (C4) to 24 (C1)
    const totalNotes = octaves * 12;

    const totalBeats = useMemo(() => Math.max(
        64,
        currentExercise ? Math.max(...currentExercise.cantus_firmus.map((n) => n.beat + n.duration)) + 16 : 64
    ), [currentExercise]);

    const zoomIn = () => {
        setZoomLevel(prev => Math.min(prev * 1.5, 4)); // Max 4x zoom in
    };

    const zoomOut = () => {
        setZoomLevel(prev => Math.max(prev / 1.5, 0.25)); // Min 0.25x zoom out (4x smaller)
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const newPosition = Math.max(0, scrollPosition - beatWidth * 4);
            scrollContainerRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
            setScrollPosition(newPosition);
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
            const newPosition = Math.min(maxScroll, scrollPosition + beatWidth * 4);
            scrollContainerRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
            setScrollPosition(newPosition);
        }
    };

    const handleScroll = (e) => { 
        setScrollPosition(e.target.scrollLeft);
        // Sync vertical scroll with note labels
        if (noteLabelsRef.current) {
            noteLabelsRef.current.scrollTop = e.target.scrollTop;
        }
    };

    const handleWheel = useCallback((e) => {
        e.preventDefault(); // Always prevent default to stop webpage scrolling
        const zoomFactor = e.deltaY > 0 ? 1 / 1.1 : 1.1;
        setZoomLevel(prev => Math.max(0.25, Math.min(4, prev * zoomFactor)));
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsMouseOverPianoRoll(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsMouseOverPianoRoll(false);
    }, []);

    const handleRightMouseDown = useCallback((e) => {
        if (e.button === 2) { // Right mouse button
            e.preventDefault();
            setIsPanning(true);
            setPanStartPos({ x: e.clientX, y: e.clientY });
            setPanStartScroll({ 
                x: scrollContainerRef.current?.scrollLeft || 0, 
                y: scrollContainerRef.current?.scrollTop || 0 
            });
        }
    }, []);

    const handlePanMouseMove = useCallback((e) => {
        if (!isPanning || !scrollContainerRef.current) return;
        
        const deltaX = panStartPos.x - e.clientX;
        const deltaY = panStartPos.y - e.clientY;
        
        scrollContainerRef.current.scrollLeft = panStartScroll.x + deltaX;
        scrollContainerRef.current.scrollTop = panStartScroll.y + deltaY;
        setScrollPosition(panStartScroll.x + deltaX);
    }, [isPanning, panStartPos, panStartScroll]);

    const handlePanMouseUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const handleContextMenu = useCallback((e) => {
        e.preventDefault(); // Prevent context menu from appearing
    }, []);

    const handlePianoRollClick = useCallback((e) => {
        if (draggedNote || isPanning || !currentExercise || !pianoRollRef.current) return;
        const rect = pianoRollRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollPosition;
        const y = e.clientY - rect.top;
        const rawBeat = x / beatWidth;
        const noteIndex = Math.floor(y / noteHeight);
        const midiNote = startNote + totalNotes - 1 - noteIndex;
        
        // For Species 1, snap to every 4th beat (whole notes = 4 quarter note beats)
        const duration = getNoteDurationForSpecies(currentExercise.species_type);
        const beat = currentExercise.species_type === 1 
            ? Math.floor(rawBeat / 4) * 4  // Snap to whole note positions for Species 1 (4 quarter beats)
            : Math.floor(rawBeat);
            
        if (beat >= totalBeats || beat < 0) return;
        const existingNoteIndex = userNotes.findIndex((n) => n.beat === beat);
        if (existingNoteIndex >= 0) {
            setUserNotes((prev) => prev.filter((_, i) => i !== existingNoteIndex));
        } else {
            const newNote = { note: midiNote, beat, duration, id: Date.now() };
            setUserNotes((prev) => [...prev, newNote]);
            playNote(midiNote, 0.3);
        }
    }, [draggedNote, userNotes, currentExercise, playNote, scrollPosition, setUserNotes, totalBeats, totalNotes]);

    const handleNoteMouseDown = useCallback((note, e) => { e.stopPropagation(); setDraggedNote(note); }, [setDraggedNote]);

    const handleMouseMove = useCallback((e) => {
        if (!draggedNote || !pianoRollRef.current || !currentExercise) return;
        const rect = pianoRollRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollPosition;
        const y = e.clientY - rect.top;
        const rawBeat = x / beatWidth;
        const noteIndex = Math.floor(y / noteHeight);
        const midiNote = startNote + totalNotes - 1 - noteIndex;
        
        // For Species 1, snap to every 4th beat (whole notes = 4 quarter note beats)
        const beat = currentExercise.species_type === 1 
            ? Math.floor(rawBeat / 4) * 4  // Snap to whole note positions for Species 1 (4 quarter beats)
            : Math.floor(rawBeat);
            
        if (beat >= 0 && beat < totalBeats) {
            setUserNotes((prev) => prev.map((n) => n.id === draggedNote.id ? { ...n, note: midiNote, beat: Math.max(0, Math.min(totalBeats - 1, beat)) } : n));
        }
    }, [draggedNote, scrollPosition, setUserNotes, totalBeats, totalNotes, currentExercise]);

    const handleMouseUp = useCallback(() => { setDraggedNote(null); }, [setDraggedNote]);

    useEffect(() => {
        if (draggedNote) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [draggedNote, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (isPanning) {
            document.addEventListener("mousemove", handlePanMouseMove);
            document.addEventListener("mouseup", handlePanMouseUp);
            return () => {
                document.removeEventListener("mousemove", handlePanMouseMove);
                document.removeEventListener("mouseup", handlePanMouseUp);
            };
        }
    }, [isPanning, handlePanMouseMove, handlePanMouseUp]);

    return (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={handlePlayPause} className="w-12 h-12 rounded-full bg-[#151515] flex items-center justify-center hover:bg-[#333] transition-colors">
                        {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-1" />}
                    </button>
                    <button onClick={() => setIsPlaying(false)} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                        <Square size={16} className="text-gray-700" />
                    </button>
                    <button onClick={resetExercise} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                        <RotateCcw size={16} className="text-gray-700" />
                    </button>
                    <div className="flex items-center space-x-2 ml-4">
                        <button onClick={scrollLeft} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors" title="Scroll Left">
                            <ChevronLeft size={16} className="text-black" />
                        </button>
                        <span className="text-xs text-black/60 px-2">Scroll</span>
                        <button onClick={scrollRight} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors" title="Scroll Right">
                            <ChevronRight size={16} className="text-black" />
                        </button>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <button onClick={zoomOut} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors" title="Zoom Out">
                            <ZoomOut size={16} className="text-black" />
                        </button>
                        <span className="text-xs text-black/60 px-2">Zoom {Math.round(zoomLevel * 100)}%</span>
                        <button onClick={zoomIn} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors" title="Zoom In">
                            <ZoomIn size={16} className="text-black" />
                        </button>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <button onClick={() => setShowLabels(!showLabels)} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors" title={showLabels ? "Hide note labels" : "Show note labels"}>
                            {showLabels ? <EyeOff size={16} className="text-black" /> : <Eye size={16} className="text-black" />}
                        </button>
                        <span className="text-xs text-black/60 px-2">Labels</span>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Volume2 size={16} className="text-black/70" />
                        <span className="text-sm text-black/70">Tempo: {tempo}</span>
                        <input type="range" min="60" max="200" value={tempo} onChange={(e) => setTempo(e.target.value)} className="w-20" />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className="flex">
                    <div ref={noteLabelsRef} className="w-20 flex-shrink-0 border-r border-gray-300 bg-white overflow-y-hidden" style={{ height: "600px" }}>
                        <div style={{ height: `${totalNotes * noteHeight}px` }}>
                            {Array.from({ length: totalNotes }, (_, i) => {
                                const midiNote = startNote + totalNotes - 1 - i;
                                return (
                                    <div key={midiNote} className="h-5 border-b border-gray-200 flex items-center justify-end pr-2 text-xs" style={{ 
                                      height: `${noteHeight}px`,
                                      backgroundColor: isBlackKey(midiNote) ? '#000000' : '#ffffff',
                                      color: isBlackKey(midiNote) ? '#ffffff' : '#000000'
                                    }}>
                                        {!isBlackKey(midiNote) && <span style={{ color: '#000000' }}>{showLabels ? getMidiNoteName(midiNote) : ''}</span>}
                                        {isBlackKey(midiNote) && <span style={{ color: '#ffffff' }}>{showLabels ? getMidiNoteName(midiNote) : ''}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div ref={scrollContainerRef} className="flex-1 overflow-x-auto overflow-y-auto" onScroll={handleScroll} style={{ height: "600px" }}>
                        <div ref={pianoRollRef} className="relative cursor-pointer select-none" onClick={handlePianoRollClick} onMouseDown={handleRightMouseDown} onContextMenu={handleContextMenu} onWheel={handleWheel} style={{ width: `${totalBeats * beatWidth}px`, height: `${totalNotes * noteHeight}px`, minWidth: "100%" }}>
                            <div className="absolute inset-0">
                                {Array.from({ length: totalBeats + 1 }, (_, i) => <div key={`v-${i}`} className={`absolute top-0 bottom-0 ${i % 4 === 0 ? "border-l-2 border-gray-300" : "border-l border-gray-200/30"}`} style={{ left: `${i * beatWidth}px` }} />)}
                                {Array.from({ length: totalNotes }, (_, i) => <div key={`h-${i}`} className="absolute left-0 right-0 border-b border-gray-100" style={{ top: `${i * noteHeight}px` }} />)}
                            </div>
                            <div className="absolute top-0 left-0 right-0 h-6 bg-gray-50 border-b border-gray-200 flex items-center text-xs text-gray-600">
                                {Array.from({ length: Math.ceil(totalBeats / 4) }, (_, i) => <div key={`measure-${i}`} className="absolute flex items-center justify-center font-medium" style={{ left: `${i * 4 * beatWidth + 4}px`, width: `${4 * beatWidth - 8}px` }}>m.{i + 1}</div>)}
                            </div>
                            {currentExercise.cantus_firmus.map((note, i) => {
                                const yPos = (startNote + totalNotes - 1 - note.note) * noteHeight;
                                return <div key={`cf-${i}`} className="absolute bg-blue-500 border border-blue-600 rounded text-white text-xs flex items-center justify-center font-medium shadow-md" style={{ left: `${note.beat * beatWidth + 2}px`, top: `${yPos + 2}px`, width: `${beatWidth * note.duration - 4}px`, height: `${noteHeight - 4}px` }}>CF</div>;
                            })}
                            {userNotes.map((note) => {
                                const yPos = (startNote + totalNotes - 1 - note.note) * noteHeight;
                                const violation = ruleViolations.find((v) => v.noteId === note.id);
                                const hasViolation = !!violation;
                                return <div key={note.id} className={`absolute border rounded text-white text-xs flex items-center justify-center font-medium cursor-move shadow-md ${hasViolation ? "bg-red-500 border-red-600" : "bg-green-500 border-green-600"} ${draggedNote?.id === note.id ? "opacity-75 z-10" : ""}`} style={{ left: `${note.beat * beatWidth + 2}px`, top: `${yPos + 2}px`, width: `${beatWidth * note.duration - 4}px`, height: `${noteHeight - 4}px` }} onMouseDown={(e) => handleNoteMouseDown(note, e)} title={hasViolation ? violation.message : ""}>{getMidiNoteName(note.note)}</div>;
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-2 flex justify-center">
                <div className="text-xs text-black/50">Use scroll controls above or mouse wheel to navigate • {totalBeats} beats total</div>
            </div>
        </div>
    );
}
