import { useRef, useState, useCallback, useEffect, useMemo } from "react";
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

export default function EnhancedPianoRoll({
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
    const [showGuidance, setShowGuidance] = useState(true);
    const [ruleViolations, setRuleViolations] = useState([]);
    const [validationResult, setValidationResult] = useState(null);
    const pianoRollRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const noteLabelsRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(0.6); // Default to 60% zoom to show 13 notes
    const [isPanning, setIsPanning] = useState(false);
    const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });
    const [panStartScroll, setPanStartScroll] = useState({ x: 0, y: 0 });
    const [draggedNote, setDraggedNote] = useState(null);
    const headerScrollRef = useRef(null);

    // Piano roll dimensions and settings
    const noteHeight = 16;
    const beatWidth = 35 * zoomLevel; // Compressed horizontally
    const startNote = 24; // C1 - expanded range
    const endNote = 96;   // C7 - expanded range
    const totalNotes = endNote - startNote + 1;

    const totalBeats = useMemo(() => {
        if (!currentExercise) return 64;
        
        // Calculate total beats needed, ensuring we show the complete exercise
        const cantusFirmusEnd = Math.max(...currentExercise.cantus_firmus.map((n) => n.beat + n.duration));
        const exerciseMeasures = currentExercise.measureCount || Math.ceil(cantusFirmusEnd / 4);
        
        // Add significant padding to allow placement in all measures
        return Math.max(exerciseMeasures * 4 + 32, 80); // Much larger padding area
    }, [currentExercise]);

    // Limit container to about 20 measures (80 beats) max
    const containerWidth = useMemo(() => {
        const maxBeats = Math.min(totalBeats + 20, 80); // Stop at m.20 (80 beats)
        return maxBeats * beatWidth;
    }, [totalBeats, beatWidth]);

    // Calculate how many vertical lines we need
    const totalVerticalLines = useMemo(() => {
        return Math.ceil(containerWidth / beatWidth) + 1;
    }, [containerWidth, beatWidth]);

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

        // Check if user note already exists at this exact position
        const existingNoteIndex = userNotes.findIndex(
            n => n.beat === newNote.beat && n.note === newNote.note
        );

        if (existingNoteIndex >= 0) {
            // Remove existing note
            setUserNotes(userNotes.filter((_, i) => i !== existingNoteIndex));
        } else {
            // Disable guide switch after placing first note
            if (userNotes.length === 0 && showGuidance) {
                setShowGuidance(false);
            }
            // For species 1: only allow one note per measure
            if (speciesNumber === 1) {
                const measureStart = Math.floor(quantizedBeat / 4) * 4;
                const conflictingNotes = userNotes.filter(n => {
                    const noteMeasureStart = Math.floor(n.beat / 4) * 4;
                    return noteMeasureStart === measureStart;
                });
                
                // Remove any existing notes in this measure
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
                // For other species, check measure capacity
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
            case 1: return 4;  // Species 1: whole notes (same as cantus firmus)
            case 2: return 2;  // Species 2: half notes 
            case 3: return 1;  // Species 3: quarter notes
            case 4: return 2;  // Species 4: half notes with syncopation
            case 5: return 1;  // Species 5: mixed values
            default: return 4;
        }
    };

    const quantizeBeatForSpecies = (beat, species) => {
        switch (species) {
            case 1: 
                // Species 1: snap to measure starts (0, 4, 8, 12, etc.)
                // Use floor instead of round to ensure clicks within a measure stay in that measure
                return Math.floor(beat / 4) * 4;
            case 2: 
                // Species 2: snap to half-note positions (0, 2, 4, 6, 8, etc.)
                return Math.round(beat / 2) * 2;
            case 3: 
                // Species 3: snap to quarter-note positions (0, 1, 2, 3, 4, etc.)
                return Math.round(beat);
            case 4: 
                // Species 4: snap to half-note positions with syncopation
                return Math.round(beat / 2) * 2;
            case 5: 
                // Species 5: allow flexible placement
                return Math.round(beat);
            default: 
                return Math.round(beat / 4) * 4;
        }
    };

    const getMaxNotesPerMeasure = (species) => {
        switch (species) {
            case 1: return 1;  // Species 1: one whole note per measure
            case 2: return 2;  // Species 2: two half notes per measure
            case 3: return 4;  // Species 3: four quarter notes per measure
            case 4: return 2;  // Species 4: two half notes (with syncopation)
            case 5: return 4;  // Species 5: mixed, up to 4 notes
            default: return 1;
        }
    };

    // Convert absolute beat number to measure-based display
    const formatBeatDisplay = (absoluteBeat, species) => {
        if (species === 1) {
            // Species 1: show as measure number (beat 32 -> measure 9)
            const measureNumber = Math.floor(absoluteBeat / 4) + 1;
            return `m.${measureNumber}`;
        } else {
            // Other species: show measure + beat within measure
            const measureNumber = Math.floor(absoluteBeat / 4) + 1;
            const beatInMeasure = (absoluteBeat % 4) + 1;
            return `m.${measureNumber}.${beatInMeasure}`;
        }
    };

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Spacebar to play/pause (prevent default to avoid page scroll)
            if (e.code === 'Space' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                handlePlayPause();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePlayPause]);

    // Scroll synchronization for measure header
    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current && headerScrollRef.current) {
                const scrollLeft = scrollContainerRef.current.scrollLeft;
                headerScrollRef.current.scrollLeft = scrollLeft;
            }
        };

        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Validation system - validate counterpoint rules when user notes change
    useEffect(() => {
        const validateCounterpoint = async () => {
            if (!currentExercise || userNotes.length === 0) {
                setRuleViolations([]);
                setValidationResult(null);
                return;
            }

            try {
                const response = await fetch("/api/validate-counterpoint", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cantusFirmus: currentExercise.cantus_firmus,
                        userNotes,
                        speciesType: speciesNumber,
                    }),
                });
                
                if (!response.ok) throw new Error(`Validation failed: ${response.status}`);
                
                const data = await response.json();
                if (data.success) {
                    setRuleViolations(data.violations);
                    setValidationResult(data);
                }
            } catch (err) {
                console.error("Error validating counterpoint:", err);
                setRuleViolations([]);
                setValidationResult(null);
            }
        };

        const timeoutId = setTimeout(validateCounterpoint, 300); // Debounce validation
        return () => clearTimeout(timeoutId);
    }, [userNotes, currentExercise, speciesNumber]);

    // Mouse handlers for piano roll interaction
    const handleMouseDown = useCallback((e) => {
        // Only prevent clicks on user notes (which have click handlers), allow clicks on CF notes
        if (e.target.closest('.user-note-block')) return;

        const rect = pianoRollRef.current?.getBoundingClientRect();
        const scrollContainer = scrollContainerRef.current;
        if (!rect || !scrollContainer) return;

        if (e.button === 1) { // Middle mouse button for panning
            setIsPanning(true);
            setPanStartPos({ x: e.clientX, y: e.clientY });
            setPanStartScroll({ 
                x: scrollContainer.scrollLeft || 0,
                y: scrollContainer.scrollTop || 0
            });
            e.preventDefault();
            return;
        }

        // Get click position relative to the piano roll grid itself
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate beat position directly from x coordinate
        const beat = Math.max(0, Math.floor(x / beatWidth));
        
        // Calculate MIDI note from y coordinate
        const midiNote = startNote + totalNotes - 1 - Math.floor(y / noteHeight);

        // Ensure the click is within valid bounds 
        const maxBeats = Math.min(totalBeats + 20, 80); // Match container limit
        if (midiNote >= startNote && midiNote <= endNote && beat < maxBeats && x >= 0) {
            handleNotePlace(beat, midiNote);
        }
    }, [handleNotePlace, beatWidth, noteHeight, startNote, endNote, totalNotes, totalBeats]);

    // Scroll controls
    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft -= beatWidth * 4;
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += beatWidth * 4;
        }
    };

    const zoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
    const zoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.5));

    // Render voice range highlights
    const renderVoiceRangeHighlights = () => {
        if (!showVoiceRanges || !pianoRollConfig?.voiceRangeHighlights) return null;

        return pianoRollConfig.voiceRangeHighlights.map((range, index) => {
            const topNote = Math.min(range.maxNote, endNote);
            const bottomNote = Math.max(range.minNote, startNote);
            const topY = (startNote + totalNotes - 1 - topNote) * noteHeight;
            const height = (topNote - bottomNote + 1) * noteHeight;

            return (
                <div
                    key={`voice-range-${index}`}
                    className="absolute pointer-events-none"
                    style={{
                        left: 0,
                        top: `${topY}px`,
                        right: 0,
                        height: `${height}px`,
                        backgroundColor: range.backgroundColor,
                        borderTop: `2px solid ${range.borderColor}`,
                        borderBottom: `2px solid ${range.borderColor}`,
                        zIndex: 1
                    }}
                >
                    {range.isPreferred && (
                        <div 
                            className="absolute left-2 top-1 text-xs font-medium pointer-events-none"
                            style={{ color: range.borderColor.replace('0.3', '0.8') }}
                        >
                            {range.label}
                        </div>
                    )}
                </div>
            );
        });
    };

    // Render guidance suggestions
    const renderGuidanceHighlights = () => {
        if (!showGuidance || !currentExercise?.cantus_firmus) return null;

        // Determine positioning text based on cantus firmus position
        const cantusFirmusPosition = currentExercise?.cantus_firmus_position || currentExercise?.cantusFirmusPosition;
        const positionText = cantusFirmusPosition === 'lower' ? 'Counterpoint above' : 'Counterpoint below';

        // Find the range of cantus firmus notes
        const cantusFirmusNotes = currentExercise.cantus_firmus.map(note => note.note);
        const cantusFirmusMin = Math.min(...cantusFirmusNotes);
        const cantusFirmusMax = Math.max(...cantusFirmusNotes);

        // Extend guidance all the way up or down based on cantus firmus position
        let topY, height;
        if (cantusFirmusPosition === 'lower') {
            // Cantus firmus is lower, so counterpoint goes above
            // Find the highest cantus firmus note and extend up from there
            const cantusFirmusTopNote = Math.min(cantusFirmusMax, endNote);
            const cantusFirmusTopY = (startNote + totalNotes - 1 - cantusFirmusTopNote) * noteHeight;
            topY = 0;
            height = cantusFirmusTopY + noteHeight;
        } else {
            // Cantus firmus is upper, so counterpoint goes below
            // Find the lowest cantus firmus note and extend down from there
            const cantusFirmusBottomNote = Math.max(cantusFirmusMin, startNote);
            const cantusFirmusBottomY = (startNote + totalNotes - 1 - cantusFirmusBottomNote) * noteHeight;
            topY = cantusFirmusBottomY + noteHeight;
            height = (totalNotes * noteHeight) - topY;
        }

        return (
            <div
                className="absolute pointer-events-none border-2 border-dashed border-yellow-400"
                style={{
                    left: 0,
                    top: `${topY}px`,
                    right: 0,
                    height: `${height}px`,
                    backgroundColor: 'rgba(251, 191, 36, 0.05)', // More subtle background
                    zIndex: 2
                }}
            >
                <div className="absolute right-2 top-1 text-xs font-medium text-yellow-600 bg-white/80 px-2 py-1 rounded">
                    {positionText}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 p-6">
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Piano Roll Section */}
                <div className="flex-1 min-w-0 overflow-x-auto">
                    {/* Controls */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
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
                    
                    {/* Scroll Controls */}
                    <div className="flex items-center space-x-2 ml-4">
                        <button onClick={scrollLeft} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
                            <ChevronLeft size={16} className="text-black" />
                        </button>
                        <span className="text-xs text-black/60 px-2">Scroll</span>
                        <button onClick={scrollRight} className="w-8 h-8 rounded bg-white/30 flex items-center justify-center hover:bg-white/40 transition-colors">
                            <ChevronRight size={16} className="text-black" />
                        </button>
                    </div>

                    {/* Zoom Controls */}
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
                    {/* Display Toggle Controls */}
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setShowLabels(!showLabels)} 
                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${showLabels ? 'bg-blue-500 text-white' : 'bg-white/30 text-black hover:bg-white/40'}`}
                        >
                            {showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <span className="text-xs text-black/60">Labels</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setShowVoiceRanges(!showVoiceRanges)} 
                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${showVoiceRanges ? 'bg-green-500 text-white' : 'bg-white/30 text-black hover:bg-white/40'}`}
                        >
                            <span className="text-xs font-bold">R</span>
                        </button>
                        <span className="text-xs text-black/60">Ranges</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => setShowGuidance(!showGuidance)} 
                            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${showGuidance ? 'bg-yellow-500 text-white' : 'bg-white/30 text-black hover:bg-white/40'}`}
                        >
                            <Info size={16} />
                        </button>
                        <span className="text-xs text-black/60">Guide</span>
                    </div>

                    {/* Tempo Control */}
                    <div className="flex items-center space-x-2">
                        <Volume2 size={16} className="text-black/70" />
                        <span className="text-sm text-black/70">Tempo: {tempo}</span>
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
                {/* Sticky Measure Header */}
                <div className="flex bg-gray-50 border-b border-gray-200 sticky top-0 z-30">
                    {/* Empty space for note labels */}
                    <div className="w-16 flex-shrink-0 bg-gray-50 border-r border-gray-300 h-6"></div>
                    {/* Measure Labels Container */}
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
                    {/* Combined Piano Roll with Labels - Single Scrollable Element */}
                    <div ref={scrollContainerRef} className="flex-1 overflow-auto" style={{ height: "676px" }}> {/* Reduced height to account for header */}
                        <div className="flex">
                            {/* Note Labels - now inside scrollable area */}
                            <div ref={noteLabelsRef} className="w-16 flex-shrink-0 border-r border-gray-300 bg-white sticky left-0 z-30">
                                <div style={{ height: `${totalNotes * noteHeight}px` }}>
                                    {Array.from({ length: totalNotes }, (_, i) => {
                                        const midiNote = startNote + totalNotes - 1 - i;
                                        return (
                                            <div key={midiNote} className="border-b border-gray-200 flex items-center justify-end pr-1 text-xs" style={{ 
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

                            {/* Piano Roll Grid */}
                            <div
                                ref={pianoRollRef}
                                className="relative cursor-crosshair bg-white"
                                style={{ width: `${containerWidth}px`, height: `${totalNotes * noteHeight}px` }}
                                onMouseDown={handleMouseDown}
                            >
                                {/* Grid Background - create actual clickable grid squares */}
                                <div className="absolute inset-0">
                                    {Array.from({ length: totalNotes }, (_, noteIndex) => {
                                        return Array.from({ length: totalVerticalLines - 1 }, (_, beatIndex) => {
                                            const midiNote = startNote + totalNotes - 1 - noteIndex;
                                            const isBlack = isBlackKey(midiNote);
                                            return (
                                                <div
                                                    key={`grid-${noteIndex}-${beatIndex}`}
                                                    className={`absolute border ${isBlack ? 'border-gray-200 bg-gray-100' : 'border-gray-100 bg-white'} hover:bg-blue-50`}
                                                    style={{
                                                        left: `${beatIndex * beatWidth}px`,
                                                        top: `${noteIndex * noteHeight}px`,
                                                        width: `${beatWidth}px`,
                                                        height: `${noteHeight}px`,
                                                        zIndex: 1
                                                    }}
                                                />
                                            );
                                        });
                                    }).flat()}
                                </div>

                                {/* Measure boundary lines */}
                                <div className="absolute inset-0">
                                    {Array.from({ length: Math.ceil(totalVerticalLines / 4) }, (_, i) => (
                                        <div key={`measure-line-${i}`} className="absolute border-l-2 border-gray-300" style={{ left: `${i * 4 * beatWidth}px`, top: 0, bottom: 0, zIndex: 2 }} />
                                    ))}
                                </div>

                                {/* Voice Range Highlights */}
                                <div className="absolute inset-0">
                                    {renderVoiceRangeHighlights()}
                                    {renderGuidanceHighlights()}
                                </div>

                                {/* Cantus Firmus Notes */}
                                <div className="absolute inset-0">
                                    {currentExercise?.cantus_firmus.map((note, i) => {
                                        const yPos = (startNote + totalNotes - 1 - note.note) * noteHeight;
                                        return (
                                            <div 
                                                key={`cf-${i}`} 
                                                className="absolute bg-blue-500/70 border border-blue-600/70 rounded text-white text-xs flex items-center justify-center font-medium shadow-md note-block" 
                                                style={{ 
                                                    left: `${note.beat * beatWidth + 1}px`, 
                                                    top: `${yPos + 1}px`, 
                                                    width: `${beatWidth * note.duration - 2}px`, 
                                                    height: `${noteHeight - 2}px`,
                                                    zIndex: 8
                                                }}
                                            >
                                                CF
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* User Notes */}
                                <div className="absolute inset-0">
                                    {userNotes.map((note, i) => {
                                        const yPos = (startNote + totalNotes - 1 - note.note) * noteHeight;
                                        // Check for validation violations for this note
                                        const noteViolations = ruleViolations.filter(v => v.noteId === note.id || v.beat === note.beat);
                                        const hasErrors = noteViolations.some(v => v.severity === 'error');
                                        const hasWarnings = noteViolations.some(v => v.severity === 'warning');
                                        const hasSuggestions = noteViolations.some(v => v.severity === 'suggestion');
                                        const hasValidation = noteViolations.length > 0;
                                        
                                        // Color notes based on validation results
                                        let bgColor = 'bg-green-500';
                                        let borderColor = 'border-green-600';
                                        if (hasErrors) {
                                            bgColor = 'bg-red-500';
                                            borderColor = 'border-red-600';
                                        } else if (hasWarnings) {
                                            bgColor = 'bg-yellow-500';
                                            borderColor = 'border-yellow-600';
                                        } else if (hasSuggestions) {
                                            bgColor = 'bg-orange-500';
                                            borderColor = 'border-orange-600';
                                        }

                                        return (
                                            <div 
                                                key={note.id || `user-${i}`} 
                                                className={`absolute ${bgColor} border ${borderColor} rounded text-white text-xs flex items-center justify-center font-medium shadow-md user-note-block cursor-pointer hover:opacity-80`} 
                                                style={{ 
                                                    left: `${note.beat * beatWidth + 1}px`, 
                                                    top: `${yPos + 1}px`, 
                                                    width: `${beatWidth * note.duration - 2}px`, 
                                                    height: `${noteHeight - 2}px`,
                                                    zIndex: 11
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Remove note on click
                                                    setUserNotes(userNotes.filter((_, index) => index !== i));
                                                }}
                                                title={hasValidation ? 
                                                    noteViolations.map(v => `${v.message}`).join('\n') + '\n\nClick to remove' :
                                                    'Click to remove'
                                                }
                                            >
                                                {hasErrors ? '!' : hasWarnings ? '⚠' : hasSuggestions ? '?' : '♪'}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center">
                <div className="text-xs text-black/50">
                    Click to place notes • Click notes to remove • Middle mouse to pan • Use scroll/zoom controls • {totalBeats} beats total
                </div>
                
                {/* Species-specific instructions */}
                <div className="text-xs text-blue-600 font-medium mt-1">
                    {speciesNumber === 1 && "Species 1: Place one whole note per measure at measure starts"}
                    {speciesNumber === 2 && "Species 2: Place up to two half notes per measure"}
                    {speciesNumber === 3 && "Species 3: Place up to four quarter notes per measure"}
                    {speciesNumber === 4 && "Species 4: Place up to two half notes per measure (syncopation allowed)"}
                    {speciesNumber === 5 && "Species 5: Mix note values - up to four notes per measure"}
                </div>
                
                {voiceRanges?.suggestions?.primary?.note && showGuidance && (
                    <div className="text-xs text-yellow-600 font-medium mt-1">
                        💡 {voiceRanges.suggestions.primary.note}
                    </div>
                )}
            </div>
                </div>

                {/* Validation Panel */}
                <div className="w-full xl:w-80 xl:flex-shrink-0">
                    <div className="bg-gradient-to-br from-[#0a0a0a]/90 via-[#1a1a2e]/90 to-[#16213e]/90 backdrop-blur-md rounded-xl border border-white/10 p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">
                                Species {speciesNumber} Rules
                            </h3>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2 mb-4 flex-shrink-0">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/70">Notes placed:</span>
                                <span className="text-white font-medium">
                                    {userNotes.length}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/70">Rule violations:</span>
                                <span
                                    className={`font-medium ${
                                        ruleViolations.length > 0 ? "text-red-400" : "text-green-400"
                                    }`}
                                >
                                    {ruleViolations.length}
                                </span>
                            </div>
                            {validationResult && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/70">Score:</span>
                                    <span className="text-white font-medium">
                                        {validationResult.score}/100
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Analysis */}
                        {validationResult?.analysis && (
                            <div className="text-xs text-white/60 bg-white/5 border border-white/10 rounded p-2 mb-4 flex-shrink-0">
                                <div>Consonant intervals: {validationResult.analysis.consonantIntervals}/{validationResult.analysis.totalNotes}</div>
                                {validationResult.analysis.contraryMotionPercentage > 0 && (
                                    <div>Contrary motion: {validationResult.analysis.contraryMotionPercentage}%</div>
                                )}
                                <div>Errors: {validationResult.analysis.errorCount}</div>
                                <div>Warnings: {validationResult.analysis.warningCount}</div>
                                {validationResult.analysis.suggestionCount > 0 && (
                                    <div>Suggestions: {validationResult.analysis.suggestionCount}</div>
                                )}
                            </div>
                        )}

                        {/* Feedback */}
                        {validationResult?.feedback && validationResult.feedback.length > 0 && (
                            <div className="mb-4 flex-shrink-0">
                                <h4 className="text-sm font-semibold text-white mb-2">Suggestions:</h4>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {validationResult.feedback.map((feedback, index) => (
                                        <div
                                            key={index}
                                            className="text-xs text-blue-200 bg-blue-900/50 border border-blue-800/50 rounded p-2"
                                        >
                                            {feedback.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Violations */}
                        {ruleViolations.length > 0 && (
                            <div className="flex-1 flex flex-col">
                                <h4 className="text-sm font-semibold text-white mb-2">Issues:</h4>
                                <div className="space-y-1 flex-1 overflow-y-auto">
                                    {ruleViolations.map((violation, index) => (
                                        <div
                                            key={index}
                                            className={`text-xs rounded p-2 ${
                                                violation.severity === 'error' 
                                                    ? 'text-red-200 bg-red-900/50 border border-red-800/50' 
                                                    : violation.severity === 'warning'
                                                    ? 'text-yellow-200 bg-yellow-900/50 border border-yellow-800/50'
                                                    : 'text-orange-200 bg-orange-900/50 border border-orange-800/50'
                                            }`}
                                        >
                                            {formatBeatDisplay(violation.beat, speciesNumber)}: {violation.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}