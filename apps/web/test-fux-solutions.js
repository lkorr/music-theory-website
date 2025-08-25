// Test script to validate all Fux exercise solutions against the implemented counterpoint rules
import { fuxExercises } from './src/app/counterpoint/fux-exercises/fuxExercisesOptimized.js';
import fetch from 'node-fetch';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Helper to format cantus firmus and solution for API
function formatExerciseForValidation(exercise) {
  // Convert cantus firmus to API format
  const cantusFirmusNotes = exercise.cantusFirmus.midiNotes.map((midiNote, index) => ({
    id: `cf-${index + 1}`,
    note: midiNote,
    beat: (exercise.cantusFirmus.measures[index] - 1) * 4,
    duration: 4
  }));

  // Convert solution to API format
  const solutionNotes = exercise.solution.midiNotes.map((midiNote, index) => ({
    id: `sol-${index + 1}`,
    note: midiNote,
    beat: (exercise.solution.measures[index] - 1) * 4,
    duration: 4
  }));

  return {
    cantusFirmus: cantusFirmusNotes,
    userNotes: solutionNotes,
    speciesType: exercise.species
  };
}

// Test a single exercise
async function testExercise(exercise, serverUrl = 'http://localhost:4001') {
  const exerciseData = formatExerciseForValidation(exercise);
  
  try {
    const response = await fetch(`${serverUrl}/api/validate-counterpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exerciseData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      exerciseId: exercise.id,
      figure: exercise.figure,
      success: result.success,
      violations: result.violations || [],
      isValid: result.isValid || false,
      errors: result.errors || []
    };
  } catch (error) {
    return {
      exerciseId: exercise.id,
      figure: exercise.figure,
      error: error.message,
      violations: [],
      isValid: false
    };
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.bold}${colors.cyan}=== Testing Fux Exercise Solutions Against Counterpoint Rules ===${colors.reset}\n`);
  
  // Check if server is running
  try {
    const testResponse = await fetch('http://localhost:4001/api/exercises/1');
    if (!testResponse.ok) {
      throw new Error('Server not responding properly');
    }
  } catch (error) {
    console.error(`${colors.red}Error: Server is not running. Please start the dev server first with 'npm run dev:web'${colors.reset}`);
    process.exit(1);
  }

  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    errors: 0,
    violations: {}
  };

  // Test two-voice exercises
  if (fuxExercises.twoVoices) {
    console.log(`${colors.bold}Testing Two-Voice Exercises:${colors.reset}\n`);
    
    for (const exercise of fuxExercises.twoVoices) {
      // Only test exercises with solutions
      if (!exercise.solution || !exercise.solution.midiNotes) {
        console.log(`${colors.yellow}⚠ Figure ${exercise.figure}: No solution available${colors.reset}`);
        continue;
      }

      results.total++;
      const testResult = await testExercise(exercise);
      
      if (testResult.error) {
        results.errors++;
        console.log(`${colors.red}✗ Figure ${exercise.figure}: Error - ${testResult.error}${colors.reset}`);
      } else if (testResult.isValid || testResult.violations.length === 0) {
        results.valid++;
        console.log(`${colors.green}✓ Figure ${exercise.figure}: Valid (Species ${exercise.species})${colors.reset}`);
      } else {
        results.invalid++;
        console.log(`${colors.red}✗ Figure ${exercise.figure}: Invalid (Species ${exercise.species})${colors.reset}`);
        
        // Show violations
        testResult.violations.forEach(violation => {
          console.log(`  ${colors.magenta}└─ ${violation.rule}${colors.reset}`);
          if (violation.details) {
            console.log(`     ${colors.yellow}${violation.details}${colors.reset}`);
          }
          
          // Track violation frequency
          const ruleKey = violation.rule;
          results.violations[ruleKey] = (results.violations[ruleKey] || 0) + 1;
        });
      }
      console.log();
    }
  }

  // Test three-voice exercises if they exist
  if (fuxExercises.threeVoices) {
    console.log(`\n${colors.bold}Testing Three-Voice Exercises:${colors.reset}\n`);
    
    for (const exercise of fuxExercises.threeVoices) {
      if (!exercise.solution || !exercise.solution.midiNotes) {
        console.log(`${colors.yellow}⚠ Figure ${exercise.figure}: No solution available${colors.reset}`);
        continue;
      }

      results.total++;
      const testResult = await testExercise(exercise);
      
      if (testResult.error) {
        results.errors++;
        console.log(`${colors.red}✗ Figure ${exercise.figure}: Error - ${testResult.error}${colors.reset}`);
      } else if (testResult.isValid || testResult.violations.length === 0) {
        results.valid++;
        console.log(`${colors.green}✓ Figure ${exercise.figure}: Valid${colors.reset}`);
      } else {
        results.invalid++;
        console.log(`${colors.red}✗ Figure ${exercise.figure}: Invalid${colors.reset}`);
        
        testResult.violations.forEach(violation => {
          console.log(`  ${colors.magenta}└─ ${violation.rule}${colors.reset}`);
          if (violation.details) {
            console.log(`     ${colors.yellow}${violation.details}${colors.reset}`);
          }
          
          results.violations[violation.rule] = (results.violations[violation.rule] || 0) + 1;
        });
      }
      console.log();
    }
  }

  // Print summary
  console.log(`${colors.bold}${colors.cyan}=== Test Summary ===${colors.reset}\n`);
  console.log(`Total exercises tested: ${results.total}`);
  console.log(`${colors.green}Valid solutions: ${results.valid} (${((results.valid/results.total)*100).toFixed(1)}%)${colors.reset}`);
  console.log(`${colors.red}Invalid solutions: ${results.invalid} (${((results.invalid/results.total)*100).toFixed(1)}%)${colors.reset}`);
  
  if (results.errors > 0) {
    console.log(`${colors.red}Errors: ${results.errors}${colors.reset}`);
  }

  // Show most common violations
  if (Object.keys(results.violations).length > 0) {
    console.log(`\n${colors.bold}Most Common Rule Violations:${colors.reset}`);
    const sortedViolations = Object.entries(results.violations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    sortedViolations.forEach(([rule, count]) => {
      console.log(`  ${colors.magenta}${count}x${colors.reset} - ${rule}`);
    });
  }

  // Interpretation
  console.log(`\n${colors.bold}${colors.cyan}=== Analysis ===${colors.reset}\n`);
  
  if (results.valid === results.total) {
    console.log(`${colors.green}✅ All Fux solutions pass validation! The rules are correctly implemented.${colors.reset}`);
  } else if (results.valid / results.total > 0.8) {
    console.log(`${colors.yellow}⚠ Most Fux solutions pass (${((results.valid/results.total)*100).toFixed(1)}%), but some rules may be too strict.${colors.reset}`);
    console.log(`Consider reviewing the violations above to see if certain rules need adjustment.`);
  } else {
    console.log(`${colors.red}❌ Many Fux solutions fail validation (only ${((results.valid/results.total)*100).toFixed(1)}% pass).${colors.reset}`);
    console.log(`The validation rules appear to be too strict or incorrectly implemented.`);
    console.log(`Review the common violations above to identify which rules need adjustment.`);
  }
}

// Run the tests
runAllTests().catch(console.error);