# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Guidance

* Ignore GEMINI.md and GEMINI-*.md files
* To save main context space, for code searches, inspections, troubleshooting or analysis, use code-searcher subagent where appropriate - giving the subagent full context background for the task(s) you assign it.
* After receiving tool results, carefully reflect on their quality and determine optimal next steps before proceeding. Use your thinking to plan and iterate based on this new information, and then take the best next action.
* For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.
* Before you finish, please verify your solution
* Do what has been asked; nothing more, nothing less.
* NEVER create files unless they're absolutely necessary for achieving your goal.
* ALWAYS prefer editing an existing file to creating a new one.
* NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
* When you update or modify core context files, also update markdown documentation and memory bank
* When asked to commit changes, exclude CLAUDE.md and CLAUDE-*.md referenced memory bank system files from any commits. Never delete these files.

## Memory Bank System

This project uses a structured memory bank system with specialized context files. Always check these files for relevant information before starting work:

### Core Context Files

* **CLAUDE-activeContext.md** - Current session state, goals, and progress (if exists)
* **CLAUDE-patterns.md** - Established code patterns and conventions (if exists)
* **CLAUDE-decisions.md** - Architecture decisions and rationale (if exists)
* **CLAUDE-troubleshooting.md** - Common issues and proven solutions (if exists)
* **CLAUDE-config-variables.md** - Configuration variables reference (if exists)
* **CLAUDE-temp.md** - Temporary scratch pad (only read when referenced)

**Important:** Always reference the active context file first to understand what's currently being worked on and maintain session continuity.

### Memory Bank System Backups

When asked to backup Memory Bank System files, you will copy the core context files above and @.claude settings directory to directory @/path/to/backup-directory. If files already exist in the backup directory, you will overwrite them.

## Project Overview

This is a **MIDI Training App** - a music education platform focused on chord recognition and counterpoint training. The project is a monorepo with web and mobile applications.

### Project Structure
```
apps/
├── web/          # React-Router SSR web application
│   ├── src/app/  # File-based routing structure
│   └── ...
├── mobile/       # React Native Expo application
└── ...
```

### Core Applications

**Web App (apps/web/)**
- **Framework**: React Router 7 with SSR
- **Styling**: Tailwind CSS + Chakra UI components
- **Build**: Vite + TypeScript
- **Testing**: Vitest with jsdom

**Mobile App (apps/mobile/)**
- **Framework**: React Native with Expo
- **Shared Logic**: Cross-platform polyfills and utilities

## Development Commands

### Root Level Commands
```bash
# Start both web and mobile development servers
npm run dev

# Individual apps
npm run dev:web      # Web app only
npm run dev:mobile   # Mobile app only

# Install dependencies for all apps
npm run install:all
npm run install:web
npm run install:mobile

# Build production
npm run build        # Web app build
npm run build:web
```

### Web App Commands (apps/web/)
```bash
cd apps/web

# Development
npm run dev          # Start development server

# Type checking
npm run typecheck    # React Router typegen + TypeScript check

# Testing
npx vitest           # Run tests
npx vitest --ui      # Test UI dashboard
```

### Mobile App Commands (apps/mobile/)
```bash
cd apps/mobile

npx expo start       # Start Expo development server
npx expo start --web # Web version
npx expo start --ios # iOS simulator
```

## Architecture Overview

### Chord Recognition System

The app's core functionality centers around **music theory education** with a sophisticated chord recognition system:

**Key Components:**
- **chordLogic.js** (457 lines) - Core music theory utilities for chord generation and validation
- **Level-based progression** - 7 levels of increasing complexity (basic triads → 7th chords → inversions)
- **Real-time validation** - Supports multiple chord notation formats including slash chords
- **Inversion system** - Configurable via `REQUIRE_INVERSION_LABELING` toggle

**Critical Configuration:**
```javascript
// Location: apps/web/src/app/chord-recognition/basic-triads/shared/chordLogic.js:6
export const REQUIRE_INVERSION_LABELING = false;

// Also in: apps/web/src/app/chord-recognition/chord-progressions/level2/page.jsx:11
const REQUIRE_INVERSION_LABELING = false;
```

### File-Based Routing System

**Route Structure** (apps/web/src/app/):
```
/                           # Landing page
/chord-recognition/         # Main chord training hub
  /basic-triads/           
    /level1-7/             # Individual level implementations
    /shared/chordLogic.js  # Core music theory utilities
  /chord-progressions/
    /level1-3/             # Roman numeral progressions
  /extended-chords/
    /level1-2/             # 7th chords and extensions
/counterpoint/             # Counterpoint composition training
/midi-training/            # General MIDI exercises
```

**Route Generation**: Custom TypeScript route builder (`routes.ts`) that:
- Scans directories for `page.jsx` files
- Handles dynamic routes with `[param]` syntax
- Supports catch-all routes with `[...param]`
- Auto-generates React Router configuration

### Music Theory Architecture

**Code Duplication Issue** (Architectural Debt):
The codebase has extensive duplication of music theory utilities across 14+ files instead of proper imports. Key duplicated code:
- `noteNames`, `chordTypes` constants
- `getMidiNoteName()`, `isBlackKey()` helper functions
- Chord validation logic

**Shared Components:**
- **ChordPianoDisplay** - Visual piano interface
- **ScoreDisplay** - Musical notation rendering  
- **PianoRoll** - Interactive note placement for counterpoint

### Counterpoint System

**Advanced Music Composition Training:**
- Species counterpoint validation (1st-5th species)
- Real-time rule checking against traditional counterpoint rules
- Interactive piano roll for note placement
- API-based validation via `/api/validate-counterpoint`

### Testing Strategy

**Current State**: Minimal test coverage
**Framework**: Vitest with jsdom environment
**Setup**: `apps/web/test/setupTests.ts` with @testing-library/jest-dom

**Critical Gap**: No tests for core music theory logic in chordLogic.js (should be priority for refactoring)

## Known Issues & Technical Debt

### TypeScript Integration Issues
Current typecheck fails with 20+ errors due to React Router type generation conflicts with .jsx files.

### Configuration Inconsistency  
`REQUIRE_INVERSION_LABELING` is defined in multiple locations, violating single source of truth.

### Code Duplication
Music theory utilities are duplicated across 14+ level files instead of using shared imports from chordLogic.js.

### Large Functions
- `validateAnswer()` function: 214 lines with high cyclomatic complexity
- `generateChord()` function: 140 lines with complex inversion logic

## Important Notes for Development

### Inversion Toggle System
The app has a toggleable system to disable inversion labeling requirements. When `REQUIRE_INVERSION_LABELING = false`:
- Accepts basic chord names (e.g., "C", "Dm") 
- When `true`: Requires inversion notation (e.g., "C/1", "Dm/2", "C/E")

### Music Theory Validation
The `validateAnswer()` function supports multiple input formats:
- Numbered inversions: "C/1", "C/2", "C/3"  
- Descriptive: "C first inversion", "C 1st inversion"
- Slash chord notation: "C/E" (first inversion), "C/G" (second inversion)
- Enharmonic equivalents: C# ↔ Db

### Cross-Platform Considerations
Mobile app uses polyfills in `apps/mobile/polyfills/` for web-specific APIs (notifications, maps, etc.) when running on web.