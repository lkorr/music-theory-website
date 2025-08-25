// Comprehensive MIDI Training App Validation System
// Based on traditional 16th-century counterpoint rules

// Helper functions for music theory calculations
function getInterval(note1, note2) {
  return Math.abs(note1 - note2) % 12;
}

function getCompoundInterval(note1, note2) {
  return Math.abs(note1 - note2);
}

function isConsonant(interval) {
  // Consonant intervals in semitones: unison(0), minor 3rd(3), major 3rd(4), perfect 5th(7), minor 6th(8), major 6th(9)
  return [0, 3, 4, 7, 8, 9].includes(interval);
}

function isPerfectConsonance(interval) {
  // Perfect consonances: unison(0), perfect 5th(7)
  return [0, 7].includes(interval);
}

function isImperfectConsonance(interval) {
  // Imperfect consonances: minor 3rd(3), major 3rd(4), minor 6th(8), major 6th(9)
  return [3, 4, 8, 9].includes(interval);
}

function getMotion(cf1, cf2, cp1, cp2) {
  const cfDirection = cf2 - cf1;
  const cpDirection = cp2 - cp1;

  if (cfDirection === 0 && cpDirection === 0) return "static";
  if (cfDirection === 0 || cpDirection === 0) return "oblique";
  if (
    (cfDirection > 0 && cpDirection > 0) ||
    (cfDirection < 0 && cpDirection < 0)
  )
    return "similar";
  return "contrary";
}

function isStep(note1, note2) {
  return Math.abs(note1 - note2) <= 2;
}

function isForbiddenMelodicInterval(note1, note2) {
  const interval = Math.abs(note1 - note2);
  // Forbidden: tritone(6), all 7ths(10,11), augmented intervals, descending minor 6th
  const semitones = interval % 12;
  const isTritone = semitones === 6;
  const isSeventh = semitones === 10 || semitones === 11;
  const isAugmented = semitones === 1 || semitones === 2 || semitones === 5 || semitones === 6; // Aug unison, 2nd, 4th, tritone
  
  return isTritone || isSeventh || (interval > 12 && !isConsonant(semitones));
}

function isLeap(note1, note2) {
  return Math.abs(note1 - note2) > 2;
}

function findMelodicClimax(notes) {
  if (notes.length === 0) return null;
  let highestNote = notes[0];
  let climaxCount = 0;
  
  for (const note of notes) {
    if (note.note > highestNote.note) {
      highestNote = note;
      climaxCount = 1;
    } else if (note.note === highestNote.note) {
      climaxCount++;
    }
  }
  
  return { note: highestNote, count: climaxCount };
}

function validateSpecies1(cfSorted, cpSorted) {
  const violations = [];
  const feedback = [];
  let contraryMotionCount = 0;
  let totalMotions = 0;
  let consecutiveThirdsOrSixths = 0;

  // Rule 1: All intervals must be consonant
  for (let i = 0; i < cpSorted.length; i++) {
    const cpNote = cpSorted[i];
    const cfNote = cfSorted.find((cf) => cf.beat === cpNote.beat);

    if (cfNote) {
      const interval = getInterval(cfNote.note, cpNote.note);
      if (!isConsonant(interval)) {
        violations.push({
          rule: 1,
          message: `Dissonant interval (${getIntervalName(interval)}) at beat ${cpNote.beat}`,
          beat: cpNote.beat,
          noteId: cpNote.id,
          severity: "error"
        });
      }
    }
  }

  // Rule 2: Begin and end with perfect consonances
  if (cpSorted.length > 0 && cfSorted.length > 0) {
    const firstCp = cpSorted[0];
    const firstCf = cfSorted[0];
    if (firstCp.beat === firstCf.beat) {
      const startInterval = getInterval(firstCf.note, firstCp.note);
      if (!isPerfectConsonance(startInterval)) {
        violations.push({
          rule: 2,
          message: "Must begin with perfect consonance (unison, 5th, or octave)",
          beat: firstCp.beat,
          noteId: firstCp.id,
          severity: "error"
        });
      }
    }

    const lastCp = cpSorted[cpSorted.length - 1];
    const lastCf = cfSorted[cfSorted.length - 1];
    if (lastCp.beat === lastCf.beat) {
      const endInterval = getInterval(lastCf.note, lastCp.note);
      if (!isPerfectConsonance(endInterval)) {
        violations.push({
          rule: 2,
          message: "Must end with perfect consonance (unison, 5th, or octave)",
          beat: lastCp.beat,
          noteId: lastCp.id,
          severity: "error"
        });
      }
    }
  }

  // Rule 3: Check melodic intervals and motion
  for (let i = 1; i < cpSorted.length; i++) {
    const prev = cpSorted[i - 1];
    const curr = cpSorted[i];
    
    // Check for forbidden melodic intervals
    if (isForbiddenMelodicInterval(prev.note, curr.note)) {
      violations.push({
        rule: 3,
        message: `Forbidden melodic interval (${Math.abs(prev.note - curr.note)} semitones) at beat ${curr.beat}`,
        beat: curr.beat,
        noteId: curr.id,
        severity: "error"
      });
    }

    // Check for excessive leaps (>12 semitones = octave) - these are always bad
    const melodicInterval = Math.abs(prev.note - curr.note);
    if (melodicInterval > 12) {
      violations.push({
        rule: 3,
        message: `Excessive leap (${melodicInterval} semitones) at beat ${curr.beat}`,
        beat: curr.beat,
        noteId: curr.id,
        severity: "error"
      });
    }
  }

  // Rule 4: Parallel perfect consonances forbidden
  for (let i = 1; i < Math.min(cpSorted.length, cfSorted.length); i++) {
    const cfPrev = cfSorted[i - 1];
    const cfCurr = cfSorted[i];
    const cpPrev = cpSorted[i - 1];
    const cpCurr = cpSorted[i];

    if (cfPrev && cfCurr && cpPrev && cpCurr) {
      const prevInterval = getInterval(cfPrev.note, cpPrev.note);
      const currInterval = getInterval(cfCurr.note, cpCurr.note);
      const motion = getMotion(cfPrev.note, cfCurr.note, cpPrev.note, cpCurr.note);

      // Check for parallel perfect consonances
      if (isPerfectConsonance(prevInterval) && prevInterval === currInterval && motion === "similar") {
        violations.push({
          rule: 4,
          message: `Parallel ${prevInterval === 7 ? "fifths" : prevInterval === 0 ? "unisons/octaves" : "perfect consonances"} at beat ${cpCurr.beat}`,
          beat: cpCurr.beat,
          noteId: cpCurr.id,
          severity: "error"
        });
      }

      // Check for hidden parallels (direct motion to perfect consonance)
      if (isPerfectConsonance(currInterval) && motion === "similar" && !isStep(cpPrev.note, cpCurr.note)) {
        violations.push({
          rule: 4,
          message: `Hidden ${currInterval === 7 ? "fifth" : "octave"} - avoid similar motion to perfect consonances`,
          beat: cpCurr.beat,
          noteId: cpCurr.id,
          severity: "warning"
        });
      }

      // Track motion types for analysis
      totalMotions++;
      if (motion === "contrary") {
        contraryMotionCount++;
      }

      // Check for consecutive imperfect consonances
      if (isImperfectConsonance(prevInterval) && isImperfectConsonance(currInterval) && 
          (prevInterval === 3 || prevInterval === 4) && (currInterval === 3 || currInterval === 4)) {
        consecutiveThirdsOrSixths++;
      } else if (isImperfectConsonance(prevInterval) && isImperfectConsonance(currInterval) && 
                 (prevInterval === 8 || prevInterval === 9) && (currInterval === 8 || currInterval === 9)) {
        consecutiveThirdsOrSixths++;
      } else {
        if (consecutiveThirdsOrSixths > 3) {
          violations.push({
            rule: 5,
            message: `Too many consecutive thirds or sixths (${consecutiveThirdsOrSixths})`,
            beat: cpCurr.beat,
            noteId: cpCurr.id,
            severity: "warning"
          });
        }
        consecutiveThirdsOrSixths = 0;
      }
    }
  }

  // Rule 5: Check for single melodic climax
  const climax = findMelodicClimax(cpSorted);
  if (climax && climax.count > 1) {
    feedback.push({
      type: "warning",
      message: `Multiple melodic high points detected. Counterpoint should have a single climax.`,
    });
  } else if (climax && (climax.note === cpSorted[0] || climax.note === cpSorted[cpSorted.length - 1])) {
    feedback.push({
      type: "suggestion",
      message: "Consider placing the melodic climax in the middle of the phrase rather than at the beginning or end.",
    });
  }

  // Rule 6: Voice leading and recovery from leaps
  for (let i = 2; i < cpSorted.length; i++) {
    const prev2 = cpSorted[i - 2];
    const prev = cpSorted[i - 1];
    const curr = cpSorted[i];
    
    const leapInterval = Math.abs(prev.note - prev2.note);
    
    if (isLeap(prev2.note, prev.note)) {
      // Check if leap is followed by contrary motion
      const leapDirection = prev.note - prev2.note;
      const recoveryDirection = curr.note - prev.note;
      
      if ((leapDirection > 0 && recoveryDirection > 0) || (leapDirection < 0 && recoveryDirection < 0)) {
        const severityLevel = leapInterval > 7 ? "warning" : "suggestion";
        const leapSize = leapInterval > 7 ? "Large leap" : "Leap";
        
        violations.push({
          rule: 6,
          message: `${leapSize} (${getIntervalName(leapInterval % 12)}) should be followed by contrary motion`,
          beat: curr.beat,
          noteId: curr.id,
          severity: severityLevel
        });
      }
    }
  }

  // Generate feedback for motion analysis
  const contraryMotionPercentage = totalMotions > 0 ? (contraryMotionCount / totalMotions) * 100 : 0;
  if (contraryMotionPercentage < 40) {
    feedback.push({
      type: "suggestion",
      message: `Use more contrary motion for voice independence (currently ${Math.round(contraryMotionPercentage)}%)`,
    });
  }

  return { violations, feedback, contraryMotionCount, totalMotions };
}

function validateSpecies2(cfSorted, cpSorted) {
  const violations = [];
  const feedback = [];

  // Check strong beats (downbeats) - must be consonant
  for (const note of cpSorted) {
    if (note.beat % 4 === 0) { // Strong beats in species 2
      const cfNote = cfSorted.find(cf => cf.beat <= note.beat && cf.beat + cf.duration > note.beat);
      if (cfNote) {
        const interval = getInterval(cfNote.note, note.note);
        if (!isConsonant(interval)) {
          violations.push({
            rule: 1,
            message: `Strong beat must be consonant at beat ${note.beat}`,
            beat: note.beat,
            noteId: note.id,
            severity: "error"
          });
        }
      }
    }
  }

  // Check weak beat dissonance treatment
  for (let i = 1; i < cpSorted.length - 1; i++) {
    const prev = cpSorted[i - 1];
    const curr = cpSorted[i];
    const next = cpSorted[i + 1];
    
    // Check if this is a weak beat
    if (curr.beat % 4 === 2) {
      const cfNote = cfSorted.find(cf => cf.beat <= curr.beat && cf.beat + cf.duration > curr.beat);
      if (cfNote) {
        const interval = getInterval(cfNote.note, curr.note);
        
        if (!isConsonant(interval)) {
          // Dissonance on weak beat - check passing tone rules
          const approachByStep = isStep(prev.note, curr.note);
          const leaveByStep = isStep(curr.note, next.note);
          const sameDirection = (curr.note - prev.note) * (next.note - curr.note) > 0;
          
          if (!approachByStep || !leaveByStep) {
            violations.push({
              rule: 2,
              message: `Dissonance must be approached and left by step at beat ${curr.beat}`,
              beat: curr.beat,
              noteId: curr.id,
              severity: "error"
            });
          } else if (!sameDirection) {
            violations.push({
              rule: 2,
              message: `Passing tone must move in same direction at beat ${curr.beat}`,
              beat: curr.beat,
              noteId: curr.id,
              severity: "error"
            });
          }
        }
      }
    }
  }

  // Check opening patterns
  if (cpSorted.length > 0) {
    const firstNote = cpSorted[0];
    if (firstNote.beat !== 0 && firstNote.beat !== 2) {
      feedback.push({
        type: "suggestion",
        message: "Species 2 typically begins with a half rest or on the downbeat"
      });
    }
  }

  return { violations, feedback };
}

function validateSpecies3(cfSorted, cpSorted) {
  const violations = [];
  const feedback = [];

  // Check strong beats (beat 1 of each measure)
  for (const note of cpSorted) {
    if (note.beat % 4 === 0) {
      const cfNote = cfSorted.find(cf => cf.beat <= note.beat && cf.beat + cf.duration > note.beat);
      if (cfNote) {
        const interval = getInterval(cfNote.note, note.note);
        if (!isConsonant(interval)) {
          violations.push({
            rule: 1,
            message: `Strong beat must be consonant at beat ${note.beat}`,
            beat: note.beat,
            noteId: note.id,
            severity: "error"
          });
        }
      }
    }
  }

  // Check for nota cambiata patterns
  for (let i = 0; i < cpSorted.length - 4; i++) {
    const notes = cpSorted.slice(i, i + 5);
    if (notes.length === 5 && isNotaCambiataPattern(notes, cfSorted)) {
      // Valid nota cambiata - allow the leap from dissonance
      continue;
    }
  }

  // Check dissonance treatment on weak beats
  for (let i = 1; i < cpSorted.length - 1; i++) {
    const prev = cpSorted[i - 1];
    const curr = cpSorted[i];
    const next = cpSorted[i + 1];
    
    const cfNote = cfSorted.find(cf => cf.beat <= curr.beat && cf.beat + cf.duration > curr.beat);
    if (cfNote) {
      const interval = getInterval(cfNote.note, curr.note);
      
      if (!isConsonant(interval)) {
        const approachByStep = isStep(prev.note, curr.note);
        const leaveByStep = isStep(curr.note, next.note);
        
        if (!approachByStep || !leaveByStep) {
          // Check if this is part of a nota cambiata
          const isPartOfCambiata = checkNotaCambiataContext(cpSorted, i, cfSorted);
          
          if (!isPartOfCambiata) {
            violations.push({
              rule: 2,
              message: `Dissonance must be approached and left by step at beat ${curr.beat}`,
              beat: curr.beat,
              noteId: curr.id,
              severity: "error"
            });
          }
        }
      }
    }
  }

  // Analyze stepwise motion percentage
  let stepCount = 0;
  for (let i = 1; i < cpSorted.length; i++) {
    if (isStep(cpSorted[i - 1].note, cpSorted[i].note)) {
      stepCount++;
    }
  }

  const stepwisePercentage = cpSorted.length > 1 ? (stepCount / (cpSorted.length - 1)) * 100 : 0;
  if (stepwisePercentage < 70) {
    feedback.push({
      type: "suggestion",
      message: `Use more stepwise motion in Species 3 (currently ${Math.round(stepwisePercentage)}%)`
    });
  }

  return { violations, feedback };
}

function isNotaCambiataPattern(fiveNotes, cfSorted) {
  if (fiveNotes.length !== 5) return false;
  
  // Pattern: step down, leap down third, step up, step up
  const intervals = [];
  for (let i = 1; i < fiveNotes.length; i++) {
    intervals.push(fiveNotes[i].note - fiveNotes[i - 1].note);
  }
  
  // Check pattern: down step, down third, up step, up step
  const isCorrectPattern = 
    intervals[0] <= -1 && intervals[0] >= -2 && // step down
    intervals[1] === -3 || intervals[1] === -4 && // third down  
    intervals[2] >= 1 && intervals[2] <= 2 && // step up
    intervals[3] >= 1 && intervals[3] <= 2; // step up
  
  if (!isCorrectPattern) return false;
  
  // Check harmonic intervals
  const cfNote = cfSorted.find(cf => cf.beat <= fiveNotes[1].beat && cf.beat + cf.duration > fiveNotes[1].beat);
  if (cfNote) {
    const secondNoteInterval = getInterval(cfNote.note, fiveNotes[1].note);
    const thirdNoteInterval = getInterval(cfNote.note, fiveNotes[2].note);
    
    // Second note should be dissonant, third note should be consonant
    return !isConsonant(secondNoteInterval) && isConsonant(thirdNoteInterval);
  }
  
  return false;
}

function checkNotaCambiataContext(cpSorted, currentIndex, cfSorted) {
  // Check if current note is part of a nota cambiata pattern
  for (let start = Math.max(0, currentIndex - 4); start <= Math.min(cpSorted.length - 5, currentIndex); start++) {
    const fiveNotes = cpSorted.slice(start, start + 5);
    if (fiveNotes.length === 5 && isNotaCambiataPattern(fiveNotes, cfSorted)) {
      const relativeIndex = currentIndex - start;
      return relativeIndex >= 0 && relativeIndex < 5;
    }
  }
  return false;
}

function validateSpecies4(cfSorted, cpSorted) {
  const violations = [];
  const feedback = [];

  // Check suspension patterns
  for (let i = 1; i < cpSorted.length - 1; i++) {
    const prep = cpSorted[i - 1];
    const susp = cpSorted[i];
    const res = cpSorted[i + 1];

    // Check for syncopated patterns (tied notes across bar lines)
    if (susp.beat % 4 === 0) { // Strong beat - potential suspension
      const cfNote = cfSorted.find(cf => cf.beat <= susp.beat && cf.beat + cf.duration > susp.beat);
      if (cfNote) {
        const interval = getInterval(cfNote.note, susp.note);
        
        if (!isConsonant(interval)) {
          // This is a dissonant suspension - check preparation and resolution
          
          // Check preparation (must be consonant and same note)
          const cfPrepNote = cfSorted.find(cf => cf.beat <= prep.beat && cf.beat + cf.duration > prep.beat);
          if (cfPrepNote) {
            const prepInterval = getInterval(cfPrepNote.note, prep.note);
            if (!isConsonant(prepInterval)) {
              violations.push({
                rule: 1,
                message: `Suspension must be prepared by consonance at beat ${prep.beat}`,
                beat: susp.beat,
                noteId: susp.id,
                severity: "error"
              });
            }
            
            if (prep.note !== susp.note) {
              violations.push({
                rule: 1,
                message: `Suspension must be tied from same note at beat ${susp.beat}`,
                beat: susp.beat,
                noteId: susp.id,
                severity: "error"
              });
            }
          }

          // Check resolution (must be downward by step to consonance)
          if (res) {
            const resolutionInterval = susp.note - res.note;
            if (resolutionInterval !== 1 && resolutionInterval !== 2) {
              violations.push({
                rule: 1,
                message: `Suspension must resolve downward by step at beat ${res.beat}`,
                beat: res.beat,
                noteId: res.id,
                severity: "error"
              });
            }

            const cfResNote = cfSorted.find(cf => cf.beat <= res.beat && cf.beat + cf.duration > res.beat);
            if (cfResNote) {
              const resInterval = getInterval(cfResNote.note, res.note);
              if (!isConsonant(resInterval)) {
                violations.push({
                  rule: 1,
                  message: `Suspension must resolve to consonance at beat ${res.beat}`,
                  beat: res.beat,
                  noteId: res.id,
                  severity: "error"
                });
              }
            }
          }
        }
      }
    }
  }

  // Check for appropriate use of syncopation
  let syncopationCount = 0;
  for (const note of cpSorted) {
    if (note.beat % 2 === 1) { // Weak beat start
      syncopationCount++;
    }
  }

  if (syncopationCount < cpSorted.length * 0.5) {
    feedback.push({
      type: "suggestion",
      message: "Species 4 should emphasize syncopation - use more tied notes across bar lines"
    });
  }

  return { violations, feedback };
}

function validateSpecies5(cfSorted, cpSorted) {
  const violations = [];
  const feedback = [];

  // Species 5 combines all previous species - check context-appropriate rules
  for (let i = 0; i < cpSorted.length; i++) {
    const note = cpSorted[i];
    const cfNote = cfSorted.find(cf => cf.beat <= note.beat && cf.beat + cf.duration > note.beat);
    
    if (cfNote) {
      const interval = getInterval(cfNote.note, note.note);
      
      // Strong beats should generally be consonant unless properly prepared suspension
      if (note.beat % 4 === 0 && !isConsonant(interval)) {
        // Check if this is a prepared suspension
        const prep = i > 0 ? cpSorted[i - 1] : null;
        if (prep && prep.note === note.note) {
          const cfPrepNote = cfSorted.find(cf => cf.beat <= prep.beat && cf.beat + cf.duration > prep.beat);
          if (cfPrepNote && !isConsonant(getInterval(cfPrepNote.note, prep.note))) {
            violations.push({
              rule: 1,
              message: `Suspension preparation must be consonant at beat ${note.beat}`,
              beat: note.beat,
              noteId: note.id,
              severity: "error"
            });
          }
        } else {
          violations.push({
            rule: 1,
            message: `Strong beat should be consonant or prepared suspension at beat ${note.beat}`,
            beat: note.beat,
            noteId: note.id,
            severity: "warning"
          });
        }
      }
    }
  }

  // Check for appropriate mixture of species techniques
  let wholeNotes = cpSorted.filter(n => n.duration >= 4).length;
  let halfNotes = cpSorted.filter(n => n.duration === 2).length;
  let quarterNotes = cpSorted.filter(n => n.duration === 1).length;
  
  feedback.push({
    type: "analysis",
    message: `Species 5 mixture: ${wholeNotes} whole notes, ${halfNotes} half notes, ${quarterNotes} quarter notes`
  });

  return { violations, feedback };
}

function getIntervalName(semitones) {
  const names = {
    0: "unison",
    1: "minor 2nd", 
    2: "major 2nd",
    3: "minor 3rd",
    4: "major 3rd", 
    5: "perfect 4th",
    6: "tritone",
    7: "perfect 5th",
    8: "minor 6th",
    9: "major 6th",
    10: "minor 7th",
    11: "major 7th"
  };
  return names[semitones] || `interval of ${semitones}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { cantusFirmus, userNotes, speciesType = 1 } = body;

    if (!cantusFirmus || !userNotes) {
      return Response.json(
        {
          success: false,
          error: "Missing cantus firmus or user notes",
        },
        { status: 400 }
      );
    }

    const cfSorted = [...cantusFirmus].sort((a, b) => a.beat - b.beat);
    const cpSorted = [...userNotes].sort((a, b) => a.beat - b.beat);

    let violations = [];
    let feedback = [];
    let contraryMotionCount = 0;
    let totalMotions = 0;

    // Validate based on species type
    switch (speciesType) {
      case 1:
        const species1Result = validateSpecies1(cfSorted, cpSorted);
        violations = species1Result.violations;
        feedback = species1Result.feedback;
        contraryMotionCount = species1Result.contraryMotionCount;
        totalMotions = species1Result.totalMotions;
        break;
      case 2:
        const species2Result = validateSpecies2(cfSorted, cpSorted);
        violations = species2Result.violations;
        feedback = species2Result.feedback;
        break;
      case 3:
        const species3Result = validateSpecies3(cfSorted, cpSorted);
        violations = species3Result.violations;
        feedback = species3Result.feedback;
        break;
      case 4:
        const species4Result = validateSpecies4(cfSorted, cpSorted);
        violations = species4Result.violations;
        feedback = species4Result.feedback;
        break;
      case 5:
        const species5Result = validateSpecies5(cfSorted, cpSorted);
        violations = species5Result.violations;
        feedback = species5Result.feedback;
        break;
      default:
        return Response.json(
          {
            success: false,
            error: "Unsupported species type",
          },
          { status: 400 }
        );
    }

    // Calculate score based on violation severity
    const errorCount = violations.filter(v => v.severity === "error").length;
    const warningCount = violations.filter(v => v.severity === "warning").length;
    const suggestionCount = violations.filter(v => v.severity === "suggestion").length;
    
    const score = Math.max(0, 100 - errorCount * 20 - warningCount * 10 - suggestionCount * 5);

    return Response.json({
      success: true,
      violations,
      feedback,
      score,
      analysis: {
        totalNotes: cpSorted.length,
        consonantIntervals: cpSorted.length - violations.filter(v => v.rule === 1 && v.severity === "error").length,
        contraryMotionPercentage: totalMotions > 0 ? Math.round((contraryMotionCount / totalMotions) * 100) : 0,
        errorCount,
        warningCount,
        suggestionCount
      },
    });
  } catch (error) {
    console.error("Error validating counterpoint:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to validate counterpoint",
      },
      { status: 500 }
    );
  }
}