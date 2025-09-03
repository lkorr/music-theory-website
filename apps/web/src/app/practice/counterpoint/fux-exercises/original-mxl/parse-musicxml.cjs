const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');

// Parse MusicXML files and convert to fuxExercisesOptimized.js format
class MusicXMLParser {
  constructor() {
    this.exercises = { twoVoices: [], threeVoices: [], fourVoices: [] };
    this.solutions = { twoVoices: [], threeVoices: [], fourVoices: [] };
  }

  // Convert note name and octave to MIDI note number
  pitchToMidi(step, octave, alter = 0) {
    const noteMap = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const baseNote = noteMap[step];
    if (baseNote === undefined) return null;
    
    return (octave + 1) * 12 + baseNote + alter;
  }

  // Extract exercise metadata from direction text
  parseMetadata(text) {
    const metadata = {};
    
    // Parse format like: "Fig. 5; Species: 1; Modal final: d; Cantus firmus: Lower"
    const figMatch = text.match(/Fig\.?\s*(\d+)/i);
    if (figMatch) metadata.figure = parseInt(figMatch[1]);
    
    const speciesMatch = text.match(/Species:\s*(\d+)/i);
    if (speciesMatch) metadata.species = parseInt(speciesMatch[1]);
    
    const modalMatch = text.match(/Modal final:\s*([a-g])/i);
    if (modalMatch) metadata.modalFinal = modalMatch[1].toLowerCase();
    
    const cantusFirmusMatch = text.match(/Cantus firmus:\s*(upper|lower)/i);
    if (cantusFirmusMatch) metadata.cantusFirmusPosition = cantusFirmusMatch[1].toLowerCase();
    
    return metadata;
  }


  // Parse a complete MusicXML file
  parseFile(xmlContent, isExercise = true) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');
    
    const parts = doc.getElementsByTagName('part');
    const exercises = [];
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const measures = part.getElementsByTagName('measure');
      
      let currentExerciseNotes = [];
      let currentMetadata = null;
      let measureOffset = 0;
      
      // Go through each measure looking for direction markers and notes
      for (let m = 0; m < measures.length; m++) {
        const measure = measures[m];
        
        // Check for direction markers (Fig. X) in this measure
        const directions = measure.getElementsByTagName('direction');
        let foundNewExercise = false;
        
        for (let d = 0; d < directions.length; d++) {
          const direction = directions[d];
          const words = direction.getElementsByTagName('words');
          
          for (let w = 0; w < words.length; w++) {
            const text = words[w].textContent;
            const metadata = this.parseMetadata(text);
            
            if (metadata.figure) {
              // Found a new exercise marker - save previous exercise if exists
              if (currentMetadata && currentExerciseNotes.length > 0) {
                const exercise = this.createExercise(currentMetadata, currentExerciseNotes, isExercise);
                if (exercise) exercises.push(exercise);
              }
              
              // Start new exercise
              currentMetadata = metadata;
              currentExerciseNotes = [];
              measureOffset = m;
              foundNewExercise = true;
              break;
            }
          }
          if (foundNewExercise) break;
        }
        
        // Parse notes from this measure if we have current metadata
        if (currentMetadata) {
          const noteElements = measure.getElementsByTagName('note');
          
          for (let n = 0; n < noteElements.length; n++) {
            const noteElement = noteElements[n];
            
            // Skip rests
            const rest = noteElement.getElementsByTagName('rest')[0];
            if (rest) continue;
            
            // Skip notes marked as not printed (blank in exercises)
            const printObject = noteElement.getAttribute('print-object');
            if (printObject === 'no') continue;

            const pitchElement = noteElement.getElementsByTagName('pitch')[0];
            if (!pitchElement) continue;

            const step = pitchElement.getElementsByTagName('step')[0]?.textContent;
            const octave = parseInt(pitchElement.getElementsByTagName('octave')[0]?.textContent || '4');
            const alterElement = pitchElement.getElementsByTagName('alter')[0];
            const alter = alterElement ? parseInt(alterElement.textContent) : 0;

            if (!step) continue;

            const midiNote = this.pitchToMidi(step, octave, alter);
            if (midiNote === null) continue;

            currentExerciseNotes.push({
              pitch: step,
              octave: octave,
              alter: alter,
              midiNote: midiNote,
              measure: m - measureOffset + 1, // Relative to exercise start
              duration: 'whole'
            });
          }
        }
      }
      
      // Don't forget the last exercise in the part
      if (currentMetadata && currentExerciseNotes.length > 0) {
        const exercise = this.createExercise(currentMetadata, currentExerciseNotes, isExercise);
        if (exercise) exercises.push(exercise);
      }
    }
    
    return exercises;
  }

  // Helper method to create exercise object
  createExercise(metadata, notes, isExercise) {
    if (notes.length === 0) return null;

    const exercise = {
      id: `fux-${this.getVoiceCategory(2)}-${metadata.figure}`,
      figure: metadata.figure,
      species: metadata.species,
      modalFinal: metadata.modalFinal,
      cantusFirmusPosition: metadata.cantusFirmusPosition,
      measureCount: Math.max(...notes.map(n => n.measure)),
      description: `Fux Figure ${metadata.figure} - Species ${metadata.species} - ${metadata.modalFinal?.toUpperCase()} mode`
    };

    // CRITICAL: Ensure the last note is included and verify modal closure
    const firstNote = notes[0];
    const lastNote = notes[notes.length - 1];
    
    // Check if we need to add the final note for proper modal closure
    // In counterpoint, exercises should end on the same note they begin with
    if (firstNote.pitch !== lastNote.pitch || firstNote.octave !== lastNote.octave) {
      const finalNote = {
        pitch: firstNote.pitch,
        octave: firstNote.octave,
        alter: firstNote.alter,
        midiNote: firstNote.midiNote,
        measure: lastNote.measure + 1,
        duration: 'whole'
      };
      notes.push(finalNote);
      exercise.measureCount++;
    }

    // Format cantus firmus or solution data
    if (isExercise) {
      exercise.cantusFirmus = {
        length: notes.length,
        pitches: notes.map(n => n.pitch),
        octaves: notes.map(n => n.octave),
        alters: notes.map(n => n.alter),
        midiNotes: notes.map(n => n.midiNote),
        measures: notes.map(n => n.measure),
        durations: notes.map(n => n.duration)
      };
    } else {
      exercise.solution = {
        length: notes.length,
        pitches: notes.map(n => n.pitch),
        octaves: notes.map(n => n.octave),
        alters: notes.map(n => n.alter),
        midiNotes: notes.map(n => n.midiNote),
        measures: notes.map(n => n.measure),
        durations: notes.map(n => n.duration)
      };
    }

    return exercise;
  }

  getVoiceCategory(voiceCount) {
    if (voiceCount <= 2) return '2v';
    if (voiceCount === 3) return '3v';
    return '4v';
  }

  // Process all files in a directory
  async processDirectory() {
    const extractedDir = path.join(__dirname, 'extracted');
    
    // Process exercises
    const exerciseFiles = ['exercises/I-Exercises/I-Exercises.xml', 'exercises/II-Exercises/II-Exercises.xml', 'exercises/III-Exercises/III-Exercises.xml'];
    
    for (const filePath of exerciseFiles) {
      const fullPath = path.join(extractedDir, filePath);
      if (fs.existsSync(fullPath)) {
        console.log(`Processing exercise file: ${filePath}`);
        const xmlContent = fs.readFileSync(fullPath, 'utf8');
        const exercises = this.parseFile(xmlContent, true);
        
        // Add to appropriate voice category (assuming 2-voice for now)
        this.exercises.twoVoices.push(...exercises);
      }
    }

    // Process solutions
    const solutionFiles = ['solutions/I-Solutions/I-Solutions.xml', 'solutions/II-Solutions/II-Solutions.xml', 'solutions/III-Solutions/III-Solutions.xml'];
    
    for (const filePath of solutionFiles) {
      const fullPath = path.join(extractedDir, filePath);
      if (fs.existsSync(fullPath)) {
        console.log(`Processing solution file: ${filePath}`);
        const xmlContent = fs.readFileSync(fullPath, 'utf8');
        const solutions = this.parseFile(xmlContent, false);
        
        // Add to appropriate voice category
        this.solutions.twoVoices.push(...solutions);
      }
    }
  }

  // Generate the output files
  generateOutput() {
    // Generate exercises file
    const exerciseOutput = `// Fux Gradus ad Parnassum Exercises - Extracted from Original MXL Files
// Source: http://fourscoreandmore.org/species/
// IMPORTANT: Includes complete cantus firmus with proper modal closure (final note preserved)

export const fuxExercisesComplete = ${JSON.stringify(this.exercises, null, 2)};
`;

    // Generate solutions file  
    const solutionOutput = `// Fux Gradus ad Parnassum Solutions - Extracted from Original MXL Files
// Source: http://fourscoreandmore.org/species/
// Used for testing and validation

export const fuxSolutions = ${JSON.stringify(this.solutions, null, 2)};
`;

    fs.writeFileSync(path.join(__dirname, 'fuxExercisesComplete.js'), exerciseOutput);
    fs.writeFileSync(path.join(__dirname, 'fuxSolutions.js'), solutionOutput);
    
    console.log('Generated fuxExercisesComplete.js and fuxSolutions.js');
    console.log(`Total exercises: ${this.exercises.twoVoices.length + this.exercises.threeVoices.length + this.exercises.fourVoices.length}`);
    console.log(`Total solutions: ${this.solutions.twoVoices.length + this.solutions.threeVoices.length + this.solutions.fourVoices.length}`);
  }
}

// Run the parser
async function main() {
  try {
    const parser = new MusicXMLParser();
    await parser.processDirectory();
    parser.generateOutput();
    console.log('Parsing completed successfully!');
  } catch (error) {
    console.error('Error parsing files:', error);
  }
}

// Check if xmldom is available, install if needed
try {
  require('xmldom');
  main();
} catch (e) {
  console.log('Installing xmldom dependency...');
  const { execSync } = require('child_process');
  execSync('npm install xmldom', { cwd: __dirname });
  main();
}