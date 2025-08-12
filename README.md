# Music Theory Website

A work-in-progress music theory learning platform with interactive chord recognition training.

## Current Status: Work in Progress

This project is actively being developed. Features and functionality may change frequently as development continues.

## What's Available Now

### Chord Recognition Trainer

A basic chord identification trainer with 5 levels:

- **Level 1**: Basic triads (major, minor, diminished, augmented) in root position
- **Level 2**: Basic triads with first inversions
- **Level 3**: All triad inversions (root, 1st, 2nd)
- **Level 4**: 7th chords in root position (maj7, m7, dom7, dim7, half-dim7)
- **Level 5**: 7th chords with all inversions (1st, 2nd, 3rd)

### Features

- Visual piano roll showing chord notes
- Progress tracking (accuracy, timing, streaks)
- Multiple chord notation formats accepted
- Automatic progression between problems

## Running the Project

```bash
git clone https://github.com/lkorr/music-theory-website.git
cd music-theory-website
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
apps/web/src/app/chord-recognition/
├── page.jsx                 # Main page
├── basic-triads/
│   ├── page.jsx             # Level selection
│   ├── level1/page.jsx      # Basic triads
│   ├── level2/page.jsx      # First inversions  
│   ├── level3/page.jsx      # All inversions
│   ├── level4/page.jsx      # 7th chords
│   ├── level5/page.jsx      # 7th chord inversions
│   └── shared/
│       └── chordLogic.js    # Core music logic
└── [other modules - not implemented yet]
```

## Known Issues

This is early-stage development. Expect bugs and incomplete features.

## Planned Features

- Audio playback for chords
- More chord types (extended chords, jazz harmony)
- Chord progression training
- Better mobile support
- Statistics and progress tracking
- Additional difficulty settings

## Contributing

This is a personal learning project. Code quality and organization may be inconsistent as features are being prototyped and tested.

If you want to contribute:
- Fork the repo
- Make your changes
- Submit a pull request

## Notes

Built with React and Tailwind CSS. Uses custom algorithms for chord generation and validation based on MIDI note numbers.