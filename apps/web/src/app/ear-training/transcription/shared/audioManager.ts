/**
 * Audio Manager for Transcription Game
 * Handles chord synthesis and playback using Web Audio API
 */

// Import chord logic from the main music theory utilities
import { noteNames, normalizeNoteName } from "../../../core-training/chord-recognition/shared/theory/core/notes.ts";
import { chordTypes, seventhChordTypes, extendedChordTypes } from "../../../core-training/chord-recognition/shared/theory/core/constants.ts";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ChordTypes {
  [key: string]: {
    intervals: readonly number[];
    [key: string]: any;
  };
}

interface Harmonic {
  freq: number;
  gain: number;
}

interface ChordConfig {
  root: string;
  chordType: string;
  inversion?: number;
  baseOctave?: number;
}

interface LevelConfig {
  audio?: {
    noteDuration?: number;
    instrument?: string;
  };
}

interface PlaybackOptions {
  baseOctave?: number;
  duration?: number;
  instrument?: string;
  strum?: boolean;
  strumDelay?: number;
}

interface SingleNoteOptions {
  duration?: number;
  instrument?: string;
}

interface ChordFromNotesOptions {
  duration?: number;
  instrument?: string;
  strum?: boolean;
  strumDelay?: number;
}

// ============================================================================
// AUDIO MANAGER CLASS
// ============================================================================

class AudioManager {
  private audioContext: AudioContext | null = null;
  private isInitialized: boolean = false;
  private masterGainNode: GainNode | null = null;
  private currentSounds: OscillatorNode[] = []; // Track active oscillators for cleanup

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node for volume control
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      // Reduced by 6dB (0.5x) to prevent clipping
      this.masterGainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);

      // Resume context if needed (some browsers start suspended)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.isInitialized = true;
      console.log('Audio Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Audio initialization failed. Please check browser audio support.');
    }
  }

  /**
   * Convert MIDI note number to frequency
   * @param midiNote - MIDI note number (e.g., 60 = C4)
   * @returns Frequency in Hz
   */
  midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Create a piano-like sound using multiple oscillators
   * @param frequency - Note frequency in Hz
   * @param duration - Note duration in seconds
   * @param startTime - When to start the note
   * @param instrument - Instrument type ('piano' or 'electric-piano')
   * @returns Array of oscillator nodes for cleanup
   */
  createPianoSound(
    frequency: number, 
    duration: number, 
    startTime: number = 0, 
    instrument: string = 'piano'
  ): OscillatorNode[] {
    if (!this.isInitialized || !this.audioContext || !this.masterGainNode) {
      throw new Error('Audio context not initialized');
    }

    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];

    // Piano sound is composed of multiple harmonics (reduced by 6dB to prevent clipping)
    const harmonics: Harmonic[] = instrument === 'electric-piano' 
      ? [
          { freq: 1.0, gain: 0.3 },    // Fundamental (reduced by 6dB)
          { freq: 2.0, gain: 0.15 },   // 2nd harmonic (reduced by 6dB)
          { freq: 3.0, gain: 0.075 },  // 3rd harmonic (reduced by 6dB)
          { freq: 4.0, gain: 0.04 },   // 4th harmonic (reduced by 6dB)
          { freq: 0.5, gain: 0.1 }     // Sub-harmonic for warmth (reduced by 6dB)
        ]
      : [
          { freq: 1.0, gain: 0.4 },    // Fundamental (reduced by 6dB)
          { freq: 2.0, gain: 0.2 },    // Octave (reduced by 6dB)
          { freq: 3.0, gain: 0.1 },    // Fifth (reduced by 6dB)
          { freq: 4.0, gain: 0.05 },   // Double octave (reduced by 6dB)
          { freq: 5.0, gain: 0.025 }   // Third above double octave (reduced by 6dB)
        ];

    const actualStartTime = this.audioContext.currentTime + startTime;

    harmonics.forEach((harmonic, index) => {
      // Create oscillator
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      // Set frequency and waveform
      oscillator.frequency.setValueAtTime(frequency * harmonic.freq, actualStartTime);
      oscillator.type = instrument === 'electric-piano' ? 'sawtooth' : 'sine';
      
      // Create envelope (attack, decay, sustain, release)
      const attackTime = 0.01;
      const decayTime = 0.2;
      const sustainLevel = harmonic.gain * 0.7;
      const releaseTime = 0.5;

      // Attack
      gainNode.gain.setValueAtTime(0, actualStartTime);
      gainNode.gain.linearRampToValueAtTime(harmonic.gain, actualStartTime + attackTime);
      
      // Decay
      gainNode.gain.linearRampToValueAtTime(sustainLevel, actualStartTime + attackTime + decayTime);
      
      // Sustain (held at sustainLevel)
      
      // Release
      const releaseStartTime = actualStartTime + duration - releaseTime;
      if (releaseStartTime > actualStartTime + attackTime + decayTime) {
        gainNode.gain.setValueAtTime(sustainLevel, releaseStartTime);
      }
      gainNode.gain.linearRampToValueAtTime(0, actualStartTime + duration);

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode!);

      // Start and stop
      oscillator.start(actualStartTime);
      oscillator.stop(actualStartTime + duration);

      // Store for cleanup
      oscillators.push(oscillator);
      gainNodes.push(gainNode);

      // Auto-cleanup when sound ends
      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (e) {
          // Node might already be disconnected
        }
      };
    });

    return oscillators;
  }

  /**
   * Generate chord from root, chord type, and inversion
   * @param root - Root note (e.g., 'C', 'F#')
   * @param chordType - Chord type (e.g., 'major', 'minor7')
   * @param inversion - Inversion number (0=root, 1=first, etc.)
   * @param baseOctave - Base MIDI octave (e.g., 60 for C4)
   * @param minNote - Minimum MIDI note (default: 21)
   * @param maxNote - Maximum MIDI note (default: 108)
   * @returns Array of MIDI note numbers
   */
  generateChordNotes(
    root: string, 
    chordType: string, 
    inversion: number = 0, 
    baseOctave: number = 60, 
    minNote: number = 21, 
    maxNote: number = 108
  ): number[] {
    // Determine which chord types object to use - check dynamically against imported objects
    const isSeventhChord = chordType in seventhChordTypes;
    const isExtendedChord = chordType in extendedChordTypes;
    
    let chordTypesObj: ChordTypes;
    if (isSeventhChord) {
      chordTypesObj = seventhChordTypes;
    } else if (isExtendedChord) {
      chordTypesObj = extendedChordTypes;
    } else {
      chordTypesObj = chordTypes;
    }
    const chordInfo = chordTypesObj[chordType];

    if (!chordInfo) {
      throw new Error(`Unknown chord type: ${chordType}`);
    }

    // Get root note MIDI number (normalize to handle flats)
    const normalizedRoot = normalizeNoteName(root);
    const rootNoteNumber = noteNames.indexOf(normalizedRoot);
    if (rootNoteNumber === -1) {
      throw new Error(`Invalid root note: ${root}`);
    }

    const baseRoot = rootNoteNumber + baseOctave;

    // Generate chord notes
    let chordNotes = chordInfo.intervals.map((interval: number) => baseRoot + interval);

    // Apply inversion with range checking
    if (inversion > 0 && inversion < chordNotes.length) {
      const notesToMove = chordNotes.slice(0, inversion);
      const remainingNotes = chordNotes.slice(inversion);
      
      // Move inverted notes up an octave, but check if they'd go out of range
      let invertedNotes = notesToMove.map((note: number) => note + 12);
      
      // If inverted notes go too high, try moving the whole chord down an octave
      if (invertedNotes.some((note: number) => note > maxNote)) {
        const newBaseRoot = baseRoot - 12;
        if (newBaseRoot >= minNote) {
          // Regenerate chord with lower octave
          chordNotes = chordInfo.intervals.map((interval: number) => newBaseRoot + interval);
          
          // Reapply inversion with new base
          const newNotesToMove = chordNotes.slice(0, inversion);
          const newRemainingNotes = chordNotes.slice(inversion);
          invertedNotes = newNotesToMove.map((note: number) => note + 12);
          chordNotes = [...newRemainingNotes, ...invertedNotes];
        }
      }
      // If original chord goes too low, try moving up an octave
      else if (remainingNotes.some((note: number) => note < minNote)) {
        const newBaseRoot = baseRoot + 12;
        if (newBaseRoot + chordInfo.intervals[chordInfo.intervals.length - 1] <= maxNote) {
          // Regenerate chord with higher octave
          chordNotes = chordInfo.intervals.map((interval: number) => newBaseRoot + interval);
          
          // Reapply inversion with new base
          const newNotesToMove = chordNotes.slice(0, inversion);
          const newRemainingNotes = chordNotes.slice(inversion);
          invertedNotes = newNotesToMove.map((note: number) => note + 12);
          chordNotes = [...newRemainingNotes, ...invertedNotes];
        }
      } else {
        // Original inversion is fine
        chordNotes = [...remainingNotes, ...invertedNotes];
      }
    }

    // Ensure all notes are in valid MIDI range (final filter)
    chordNotes = chordNotes.filter((note: number) => note >= minNote && note <= maxNote);

    // If we lost too many notes, throw an error so the caller can try a different approach
    if (chordNotes.length < 3) {
      throw new Error(`Chord ${root}${chordType} inversion ${inversion} at octave ${baseOctave} doesn't fit in range ${minNote}-${maxNote}`);
    }

    return chordNotes.sort((a: number, b: number) => a - b); // Sort from low to high
  }

  /**
   * Play a chord
   * @param root - Root note
   * @param chordType - Chord type
   * @param inversion - Inversion number
   * @param options - Playback options
   * @returns Promise that resolves when playback starts
   */
  async playChord(
    root: string, 
    chordType: string, 
    inversion: number = 0, 
    options: PlaybackOptions = {}
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      baseOctave = 60,
      duration = 2.0,
      instrument = 'piano',
      strum = false,
      strumDelay = 0.05
    } = options;

    try {
      // Generate chord notes
      const chordNotes = this.generateChordNotes(root, chordType, inversion, baseOctave);
      
      // Stop any currently playing sounds
      this.stopCurrentSounds();

      // Play each note
      chordNotes.forEach((midiNote: number, index: number) => {
        const frequency = this.midiToFrequency(midiNote);
        const startDelay = strum ? index * strumDelay : 0;
        
        const oscillators = this.createPianoSound(frequency, duration, startDelay, instrument);
        this.currentSounds.push(...oscillators);
      });

      console.log(`Playing chord: ${root}${chordType} (inversion ${inversion})`);
      console.log(`Notes: ${chordNotes.map(n => this.midiNoteToName(n)).join(', ')}`);

    } catch (error) {
      console.error('Error playing chord:', error);
      throw error;
    }
  }

  /**
   * Play a single note
   * @param midiNote - MIDI note number to play
   * @param options - Playback options
   * @returns Promise that resolves when playback starts
   */
  async playNote(midiNote: number, options: SingleNoteOptions = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      duration = 0.5,
      instrument = 'piano'
    } = options;

    try {
      const frequency = this.midiToFrequency(midiNote);
      const oscillators = this.createPianoSound(frequency, duration, 0, instrument);
      
      // Don't add to currentSounds since these are short individual note plays
      console.log(`Playing note: ${this.midiNoteToName(midiNote)}`);

    } catch (error) {
      console.error('Error playing note:', error);
      throw error;
    }
  }

  /**
   * Play chord from an array of MIDI notes
   * @param midiNotes - Array of MIDI note numbers
   * @param options - Playback options
   * @returns Promise that resolves when playback starts
   */
  async playChordFromNotes(midiNotes: number[], options: ChordFromNotesOptions = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const {
      duration = 2.0,
      instrument = 'piano',
      strum = false,
      strumDelay = 0.05
    } = options;

    try {
      // Stop any currently playing sounds
      this.stopCurrentSounds();

      // Play each note
      midiNotes.forEach((midiNote: number, index: number) => {
        const frequency = this.midiToFrequency(midiNote);
        const startDelay = strum ? index * strumDelay : 0;
        
        const oscillators = this.createPianoSound(frequency, duration, startDelay, instrument);
        this.currentSounds.push(...oscillators);
      });

      console.log(`Playing chord from notes: ${midiNotes.map(n => this.midiNoteToName(n)).join(', ')}`);

    } catch (error) {
      console.error('Error playing chord from notes:', error);
      throw error;
    }
  }

  /**
   * Play chord from configuration object
   * @param chordConfig - Chord configuration
   * @param levelConfig - Level configuration for audio settings
   */
  async playChordFromConfig(chordConfig: ChordConfig, levelConfig: LevelConfig): Promise<void> {
    const audioOptions: PlaybackOptions = {
      duration: (levelConfig.audio?.noteDuration || 2000) / 1000, // Convert ms to seconds
      instrument: levelConfig.audio?.instrument || 'piano',
      baseOctave: chordConfig.baseOctave || 60
    };

    await this.playChord(
      chordConfig.root,
      chordConfig.chordType,
      chordConfig.inversion || 0,
      audioOptions
    );
  }

  /**
   * Stop all currently playing sounds
   */
  stopCurrentSounds(): void {
    this.currentSounds.forEach((oscillator: OscillatorNode) => {
      try {
        oscillator.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.currentSounds = [];
  }

  /**
   * Convert MIDI note number to note name
   * @param midiNote - MIDI note number
   * @returns Note name (e.g., 'C4', 'F#5')
   */
  midiNoteToName(midiNote: number): string {
    const noteIndex = midiNote % 12;
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[noteIndex];
    return `${noteName}${octave}`;
  }

  /**
   * Set master volume
   * @param volume - Volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.masterGainNode && this.audioContext) {
      this.masterGainNode.gain.setValueAtTime(
        Math.max(0, Math.min(1, volume)), 
        this.audioContext.currentTime
      );
    }
  }

  /**
   * Clean up audio resources
   */
  cleanup(): void {
    this.stopCurrentSounds();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export singleton instance
export const audioManager = new AudioManager();

// Export class for testing or multiple instances if needed
export default AudioManager;