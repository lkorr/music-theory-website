# Music Theory Website 🎵

A comprehensive music theory learning platform featuring interactive chord recognition training with advanced piano roll visualizations.

## Features

### 🎹 Chord Recognition Trainer
An interactive application designed to help musicians master chord identification through progressive difficulty levels.

#### Available Levels:

**Level 1: Basic Triads**
- Major, Minor, Diminished, and Augmented triads
- Root position only
- 30 problems, 90% accuracy required
- Average time: ≤5 seconds

**Level 2: First Inversions**
- Basic triads in root position and 1st inversion
- Progressive difficulty introduction
- Enhanced pattern recognition

**Level 3: All Inversions**
- Root position, 1st, and 2nd inversions
- Complete triad mastery
- Advanced chord positioning

**Level 4: 7th Chords** ⭐
- Major 7th (Cmaj7)
- Minor 7th (Cm7)
- Dominant 7th (C7)
- Diminished 7th (Cdim7)
- Half-Diminished 7th (Cm7♭5)
- Root position focus
- 30 problems, 85% accuracy required

**Level 5: 7th Chords with Inversions** ⭐
- All 7th chord types with complete inversion support
- 1st, 2nd, and 3rd inversions
- 20 different chord combinations
- 40 problems, 80% accuracy required
- Expert-level challenge

### 🎼 Visual Learning Tools

#### Dynamic Piano Roll Visualizations
- **Smart Range Display**: Shows only relevant notes (1 note above/below chord range)
- **C-Note Highlighting**: Consistent red highlighting for all C notes across chord types
- **Real-time Note Positioning**: Accurate MIDI-based note placement
- **Responsive Design**: Optimized for different screen sizes

#### Interactive Features
- **Real-time Feedback**: Immediate validation with detailed explanations
- **Progress Tracking**: Accuracy, timing, and streak monitoring
- **Auto-advance**: Smart progression based on answer correctness
- **Comprehensive Notation Support**: Multiple chord naming conventions accepted

### 🧠 Learning Approach

#### Progressive Difficulty
- Start with basic triads and advance to complex 7th chord inversions
- Each level builds upon previous knowledge
- Customizable practice sessions

#### Multiple Input Formats
The trainer accepts various chord notation formats:
- **Major**: C, Cmaj, Cmajor, CM
- **Minor**: Cm, Cmin, Cminor
- **7th Chords**: Cmaj7, CM7, Cm7, C7
- **Inversions**: C/1, Cmaj7/2, C7/3
- **Alternative Symbols**: Cdim, C°, Caug, C+

## Technical Features

### 🔧 Built With
- **Frontend**: React with modern hooks and state management
- **Routing**: React Router for seamless navigation
- **Styling**: Tailwind CSS with custom components
- **Music Theory**: Custom MIDI-based chord generation and validation

### 🎯 Core Algorithms
- **Dynamic Chord Generation**: Random root selection with proper voice leading
- **Smart Inversion Handling**: Accurate octave positioning for all inversions
- **Validation Engine**: Comprehensive pattern matching for chord identification
- **Visual Rendering**: Real-time piano roll generation with proper note spacing

### 📱 Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for tablets and desktop
- Accessibility considerations

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lkorr/music-theory-website.git
   cd music-theory-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Usage

1. **Start with Level 1** to build foundational chord recognition skills
2. **Progress through levels** as you achieve the required accuracy and timing
3. **Use the visual piano roll** to understand chord structure and note relationships
4. **Practice regularly** to build muscle memory and improve recognition speed

## Project Structure

```
apps/web/src/app/chord-recognition/
├── page.jsx                     # Main landing page
├── basic-triads/
│   ├── page.jsx                 # Level selection
│   ├── level1/page.jsx          # Basic triads
│   ├── level2/page.jsx          # First inversions
│   ├── level3/page.jsx          # All inversions
│   ├── level4/page.jsx          # 7th chords ⭐
│   ├── level5/page.jsx          # 7th inversions ⭐
│   └── shared/
│       ├── chordLogic.js        # Core music theory engine
│       ├── ChordPianoDisplay.jsx
│       └── ScoreDisplay.jsx
├── chord-progressions/          # Future feature
├── extended-chords/             # Future feature
└── jazz-chords/                 # Future feature
```

## Contributing

Contributions are welcome! Whether it's bug fixes, feature additions, or improvements to the music theory algorithms.

### Development Guidelines
- Follow React best practices and hooks patterns
- Maintain music theory accuracy in all algorithms
- Ensure responsive design compatibility
- Add tests for new chord recognition features

### Areas for Contribution
- Additional chord types (9th, 11th, 13th chords)
- Chord progression training modules
- Audio playback integration
- Advanced statistics and progress tracking
- Mobile app development

## Music Theory Accuracy

This application is built with careful attention to music theory principles:
- **Proper voice leading** in chord inversions
- **Enharmonic equivalence** handling (F# = Gb)
- **Octave-aware positioning** for realistic piano layouts
- **Standard notation conventions** following classical theory

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React and modern web technologies
- Music theory algorithms based on traditional classical harmony
- Visual design inspired by professional music software
- Special thanks to the music education community for feedback and testing

---

**Start your chord recognition journey today!** 🎹✨

Perfect for:
- Music students learning chord theory
- Piano players improving sight-reading
- Guitarists expanding harmonic knowledge
- Music teachers creating engaging lessons
- Anyone passionate about music theory

[Visit the live application](https://github.com/lkorr/music-theory-website) • [Report Issues](https://github.com/lkorr/music-theory-website/issues) • [Request Features](https://github.com/lkorr/music-theory-website/discussions)