#!/usr/bin/env node

// Exercise Solution Validation Testing Script
// Tests all exercise solutions against the validation API

import { fuxExercisesComplete } from './src/app/counterpoint/fux-exercises/original-mxl/fuxExercisesComplete.js';
import { fuxSolutions } from './src/app/counterpoint/fux-exercises/original-mxl/fuxSolutions.js';

// Figure 5 data (manually added)
const FIGURE_5 = {
  "id": "fux-2v-5",
  "figure": 5,
  "species": 1,
  "modalFinal": "d",
  "cantusFirmusPosition": "lower",
  "measureCount": 11,
  "description": "Fux Figure 5 - Species 1 - D Dorian",
  "cantusFirmus": {
    "length": 11,
    "pitches": ["D", "F", "E", "D", "G", "F", "A", "G", "F", "E", "D"],
    "octaves": [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    "alters": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "midiNotes": [62, 65, 64, 62, 67, 65, 69, 67, 65, 64, 62],
    "measures": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    "durations": ["whole", "whole", "whole", "whole", "whole", "whole", "whole", "whole", "whole", "whole", "whole"]
  }
};

// Convert solution to user notes format for validation
function convertSolutionToUserNotes(solution) {
    if (!solution || !solution.midiNotes) return [];
    
    return solution.midiNotes.map((midiNote, index) => {
        const measureNumber = solution.measures ? solution.measures[index] : index + 1;
        const beat = (measureNumber - 1) * 4; // Convert measure to beat (0-based beats)
        
        return {
            note: midiNote,
            beat: beat,
            duration: 4, // Whole notes for species 1
            id: `solution-${index}`
        };
    });
}

// Convert cantus firmus to validation format
function convertCantusFirmusToValidationFormat(cantusFirmus) {
    if (!cantusFirmus || !cantusFirmus.midiNotes) return [];
    
    return cantusFirmus.midiNotes.map((midiNote, index) => {
        const measureNumber = cantusFirmus.measures ? cantusFirmus.measures[index] : index + 1;
        const beat = (measureNumber - 1) * 4; // Convert measure to beat
        
        return {
            note: midiNote,
            beat: beat,
            duration: 4, // Whole notes
            voice: 'cantus',
            isCantusFirmus: true
        };
    });
}

// Test a single exercise solution
async function testExerciseSolution(exercise, solution) {
    if (!solution || !solution.solution) {
        return {
            id: exercise.id,
            figure: exercise.figure,
            error: 'No solution provided'
        };
    }

    try {
        const cantusFirmus = convertCantusFirmusToValidationFormat(exercise.cantusFirmus);
        const userNotes = convertSolutionToUserNotes(solution.solution); // Access nested solution

        // Debug: log the first exercise data to see format
        if (exercise.figure === 6) {
            console.log('\n🔍 DEBUG - Figure 6 data being sent to API:');
            console.log('Raw solution structure:', JSON.stringify(solution, null, 2));
            console.log('Solution.solution exists:', !!solution.solution);
            console.log('Solution.solution.midiNotes:', solution.solution?.midiNotes);
            console.log('Cantus Firmus:', JSON.stringify(cantusFirmus.slice(0, 3), null, 2));
            console.log('User Notes:', JSON.stringify(userNotes.slice(0, 3), null, 2));
            console.log('Species Type:', exercise.species);
        }

        const response = await fetch("http://localhost:4000/api/validate-counterpoint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cantusFirmus: cantusFirmus,
                userNotes: userNotes,
                speciesType: exercise.species,
            }),
        });

        if (!response.ok) {
            return {
                id: exercise.id,
                figure: exercise.figure,
                error: `Validation API error: ${response.status}`
            };
        }

        const data = await response.json();
        
        return {
            id: exercise.id,
            figure: exercise.figure,
            species: exercise.species,
            description: exercise.description,
            cantusFirmusPosition: exercise.cantusFirmusPosition,
            score: data.score || 0,
            violations: data.violations || [],
            feedback: data.feedback || [],
            success: data.success,
            isPerfect: data.score === 100 && (data.violations || []).length === 0 && (data.feedback || []).length === 0
        };

    } catch (error) {
        return {
            id: exercise.id,
            figure: exercise.figure,
            error: `Test failed: ${error.message}`
        };
    }
}

// Get solution for an exercise by matching figure numbers
function getSolutionForExercise(exercise) {
    // Try to find matching solution by figure number
    for (const voiceCategory of Object.keys(fuxSolutions)) {
        const solutions = fuxSolutions[voiceCategory] || [];
        const matchingSolution = solutions.find(sol => sol.figure === exercise.figure);
        if (matchingSolution) {
            return matchingSolution;
        }
    }
    return null;
}

// Test all exercises for a given species and voice category
async function testSpeciesExercises(speciesNumber, voiceCategory) {
    console.log(`\n=== Testing Species ${speciesNumber} ${voiceCategory} Exercises ===`);
    
    let exercises = fuxExercisesComplete[voiceCategory]?.filter(ex => ex.species === speciesNumber) || [];
    
    // Add Figure 5 for Species 1 two-voice
    if (speciesNumber === 1 && voiceCategory === 'twoVoices') {
        exercises = [FIGURE_5, ...exercises];
    }
    
    if (exercises.length === 0) {
        console.log(`No exercises found for Species ${speciesNumber} ${voiceCategory}`);
        return [];
    }

    const results = [];
    
    for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        const solution = getSolutionForExercise(exercise);
        
        if (!solution) {
            console.log(`⚠️  No solution found for ${exercise.id} (Figure ${exercise.figure})`);
            results.push({
                id: exercise.id,
                figure: exercise.figure,
                species: exercise.species,
                description: exercise.description,
                error: 'No solution found'
            });
            continue;
        }
        
        console.log(`Testing ${exercise.id} (Figure ${exercise.figure})...`);
        
        const result = await testExerciseSolution(exercise, solution);
        results.push(result);
        
        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
}

// Main testing function
async function runExerciseValidationTests() {
    console.log('🎼 Exercise Solution Validation Test Suite');
    console.log('==========================================');
    
    const allResults = [];
    const speciesToTest = [1, 2, 3, 4, 5];
    const voiceCategories = ['twoVoices'];
    
    for (const species of speciesToTest) {
        for (const voiceCategory of voiceCategories) {
            const results = await testSpeciesExercises(species, voiceCategory);
            allResults.push(...results);
        }
    }
    
    // Filter for non-perfect results
    const imperfectResults = allResults.filter(result => 
        !result.isPerfect && !result.error
    );
    
    console.log('\n🔍 VALIDATION RESULTS SUMMARY');
    console.log('============================');
    console.log(`Total exercises tested: ${allResults.length}`);
    console.log(`Exercises with errors: ${allResults.filter(r => r.error).length}`);
    console.log(`Perfect exercises (100% score, no violations): ${allResults.filter(r => r.isPerfect).length}`);
    console.log(`Imperfect exercises: ${imperfectResults.length}`);
    
    if (imperfectResults.length > 0) {
        console.log('\n❌ EXERCISES THAT FAILED PERFECT VALIDATION:');
        console.log('============================================');
        
        imperfectResults.forEach(result => {
            console.log(`\n📍 ${result.id} (Figure ${result.figure})`);
            console.log(`   Species: ${result.species}`);
            console.log(`   Description: ${result.description}`);
            console.log(`   Cantus Position: ${result.cantusFirmusPosition}`);
            console.log(`   Score: ${result.score}/100`);
            
            if (result.violations && result.violations.length > 0) {
                console.log(`   Rule Violations (${result.violations.length}):`);
                result.violations.forEach(violation => {
                    const measureDisplay = Math.floor(violation.beat / 4) + 1;
                    console.log(`     • m.${measureDisplay}: ${violation.message} (${violation.severity})`);
                });
            }
            
            if (result.feedback && result.feedback.length > 0) {
                console.log(`   Feedback/Suggestions (${result.feedback.length}):`);
                result.feedback.forEach(feedback => {
                    console.log(`     • ${feedback.message}`);
                });
            }
        });
    } else {
        console.log('\n✅ ALL EXERCISES PASSED WITH PERFECT SCORES! 🎉');
    }
    
    // Show any errors
    const errorResults = allResults.filter(r => r.error);
    if (errorResults.length > 0) {
        console.log('\n⚠️  EXERCISES WITH ERRORS:');
        console.log('=========================');
        errorResults.forEach(result => {
            console.log(`${result.id} (Figure ${result.figure}): ${result.error}`);
        });
    }
}

// Run the tests
console.log('Starting validation tests...');
console.log('Make sure the dev server is running on localhost:4000');

runExerciseValidationTests().catch(console.error);