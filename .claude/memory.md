# MIDI Training App - Complete Project Architecture

**IMPORTANT**: This file must be updated whenever the folder structure changes, files are renamed, moved, or created.

## 🏗️ System Architecture Overview

### Technology Stack
- **Frontend**: React 18.3 + React Router 7 (SSR)
- **Backend**: Node.js + Hono server framework
- **Database**: PostgreSQL via Supabase
- **Authentication**: @auth/core with Argon2id hashing
- **Mobile**: React Native + Expo 53.0.11
- **Build**: Vite 6.3.3 with custom plugins
- **Monorepo**: npm workspaces

## 🎯 Quick Navigation Map

```
http://localhost:4000/
├── /                                    # Landing page
├── /midi-training                       # Main training hub
├── /chord-recognition                   # Chord training hub
│   ├── /basic-triads                   # Basic chord training
│   │   └── /recognition/level1-7       # 7 progressive levels
│   ├── /extended-chords                # 7th Chords (renamed from "Extended Chords")
│   │   └── /recognition/level1-5       # 5 levels of 7th chords
│   ├── /jazz-chords                    # Extended Chords (9th, 11th, 13th)
│   │   └── /recognition/level1        # 9th chords (implemented)
│   │   └── /recognition/level2-3      # 11th, 13th (planned)
│   └── /chord-progressions             # Roman numeral progressions
│       └── /level1-3                   # 3 progression levels
└── /counterpoint                        # Counterpoint composition
```

## 📁 Folder Structure

```
apps/web/src/app/
├── chord-recognition/
│   ├── page.jsx                        # Main chord recognition menu
│   ├── shared/                         # Shared utilities for ALL chord types
│   │   └── hooks/
│   │       ├── useLevelState.js       # Shared state management
│   │       └── useLevelLogic.js       # Shared game logic
│   │
│   ├── basic-triads/                   # MAJOR, MINOR, DIM, AUG
│   │   ├── page.jsx                    # Triads menu
│   │   ├── shared/
│   │   │   ├── chordLogic.js          # Core music theory (DUPLICATED - TECH DEBT!)
│   │   │   ├── ChordPianoDisplay.jsx  # Piano visualization component
│   │   │   ├── generationUtils.js     # Chord generation helpers
│   │   │   └── config/
│   │   │       └── levelConfigs.js    # Level configurations
│   │   └── recognition/
│   │       ├── level1/                 # Each level has:
│   │       │   ├── page.jsx           # - Main game page
│   │       │   └── level1Utils.js     # - Level-specific logic
│   │       └── level2-7/              # (same structure)
│   │
│   ├── extended-chords/                # 7TH CHORDS (maj7, m7, dom7, dim7, ø7)
│   │   ├── page.jsx                    # 7th chords menu
│   │   ├── shared/
│   │   │   ├── chordLogic.js          # 7th chord definitions
│   │   │   ├── ScoreDisplay.jsx       # Musical notation component
│   │   │   └── config/
│   │   │       └── levelConfigs.js    # Level configurations
│   │   └── recognition/
│   │       └── level1-5/              # 5 levels (root → all inversions → open voicing)
│   │
│   ├── jazz-chords/                    # 9TH, 11TH, 13TH CHORDS
│   │   ├── page.jsx                    # Extended chords menu
│   │   ├── shared/
│   │   │   ├── chordLogic.js          # 9th chord definitions & logic
│   │   │   └── config/
│   │   │       └── levelConfigs.js    # Level configurations
│   │   └── recognition/
│   │       └── level1/                 # 9th chords (implemented)
│   │           ├── page.jsx
│   │           └── level1Utils.js
│   │
│   └── chord-progressions/             # CHORD SEQUENCES
│       ├── page.jsx                    # Progressions menu
│       └── level1-3/                   # Roman numeral analysis
│
├── counterpoint/                        # COUNTERPOINT COMPOSITION
│   └── page.jsx                        # Interactive counterpoint trainer
│
└── midi-training/                       # MAIN HUB
    └── page.jsx                        # Training selection menu
```

## 🔗 Key Dependencies

### Shared Components (Used Across All Levels)
- `ChordPianoDisplay.jsx` - Visual piano (from basic-triads/shared/)
- `ScoreDisplay.jsx` - Musical notation (from extended-chords/shared/)
- `useLevelState.js` - State management hook (from chord-recognition/shared/hooks/)
- `useLevelLogic.js` - Game logic hook (from chord-recognition/shared/hooks/)
- `generationUtils.js` - Duplicate prevention (from basic-triads/shared/)

### Import Hierarchy
```
Level Page (e.g., jazz-chords/recognition/level1/page.jsx)
├── imports shared hooks (../../shared/hooks/*)
├── imports level config (../shared/config/levelConfigs.js)
├── imports level utils (./level1Utils.js)
├── imports chord logic (../shared/chordLogic.js)
└── imports UI components (ChordPianoDisplay, ScoreDisplay)
```

## ⚠️ Technical Debt

1. **chordLogic.js Duplication**: Core music theory utilities are duplicated across 14+ files instead of using imports
2. **REQUIRE_INVERSION_LABELING**: Defined in multiple locations (should be centralized)
3. **TypeScript Issues**: 20+ type errors with React Router + .jsx files

## 🎵 Chord Types by Section

### Basic Triads (basic-triads/)
- Major (C, D, E, etc.)
- Minor (Cm, Dm, Em)
- Diminished (Cdim, Ddim)
- Augmented (Caug, Daug)

### 7th Chords (extended-chords/)
- Major 7th (Cmaj7, CM7)
- Minor 7th (Cm7)
- Dominant 7th (C7)
- Diminished 7th (Cdim7)
- Half-diminished (Cm7♭5, Cø7)

### Extended Chords (jazz-chords/)
- **9th Chords** (Level 1 - Implemented):
  - Major 9th (Cmaj9, CM9)
  - Minor 9th (Cm9)
  - Dominant 9th (C9, Cdom9)
  - Dominant 7♭9 (C7♭9)
  - Dominant 7♯9 (C7♯9)
  - Minor 7♭9 (Cm7♭9)
  - Add9 (Cadd9)
  - Minor add9 (Cmadd9)
- **11th Chords** (Level 2 - Planned)
- **13th Chords** (Level 3 - Planned)

## 📝 Maintenance Instructions

### When Adding a New Level
1. Create directory: `apps/web/src/app/chord-recognition/[section]/recognition/level[N]/`
2. Add `page.jsx` and `level[N]Utils.js`
3. Update parent section's `page.jsx` menu
4. Update this memory.md with new path
5. Add to levelConfigs.js if needed

### When Renaming Sections
1. Update folder name
2. Update all import paths
3. Update navigation Links in page.jsx files
4. Update this memory.md
5. Update CLAUDE.md if referenced there

### When Moving Files
1. Update all import statements
2. Test that shared components still resolve
3. Update this memory.md with new locations
4. Run the app to verify no broken imports

### When Creating Shared Utilities
1. Place in appropriate shared/ folder
2. Document in this file under Key Dependencies
3. Update imports in files that need it
4. Consider if it should replace duplicated code

## 🚀 Quick Commands

```bash
# From root directory
npm run dev:web          # Start web dev server
npm run typecheck        # Check TypeScript (will show errors)
npx vitest              # Run tests

# Navigate to key files
cd apps/web/src/app/chord-recognition
```

## 📌 Important Notes

- All levels use the same shared hooks for consistency
- Each level has its own Utils file for chord generation/validation
- Piano and Score displays are shared across all levels
- The app uses file-based routing (React Router 7)
- Routes are auto-generated from page.jsx files

---

## 🔐 Backend Architecture

### Server Infrastructure
```
apps/web/
├── __create/
│   └── index.ts                    # Custom SSR server setup with Hono
├── lib/
│   ├── supabase.js                # Database client & connection
│   ├── auth.js                    # Authentication logic
│   ├── rateLimit.js              # Rate limiting middleware
│   ├── validation.js             # Input validation & sanitization
│   └── env.js                     # Environment config validation
├── config/
│   └── auth.config.js             # Auth providers configuration
└── src/app/api/                   # API routes (file-based)
    ├── auth/
    │   ├── login/route.js         # User authentication endpoint
    │   ├── register/route.js      # User registration
    │   ├── logout/route.js        # Session termination
    │   ├── me/route.js           # Current user info
    │   └── token/route.js        # JWT token management
    ├── validate-counterpoint/     # Music theory validation (746 lines!)
    └── exercises/                 # Progress tracking endpoints
```

### Database Architecture (Supabase/PostgreSQL)

#### Core Tables
```sql
users                              # User accounts & profiles
├── id (UUID)
├── email
├── password_hash (Argon2id)
├── role (FREE/PREMIUM/PRO/TEACHER/ADMIN)
└── created_at

sessions                           # Active user sessions
├── id
├── user_id
├── token
├── ip_address
├── device_fingerprint
└── expires_at

audit_logs                         # Security & compliance tracking
├── id
├── user_id
├── action
├── ip_address
├── user_agent
└── timestamp

practice_progress                  # User performance metrics
├── user_id
├── exercise_type
├── level
├── score
├── accuracy
└── completion_time

subscriptions                      # Payment/subscription data
├── user_id
├── stripe_subscription_id
├── plan_type
├── status
└── expires_at
```

#### Security Features
- **Row Level Security (RLS)**: Enabled on all tables
- **Audit Logging**: Comprehensive tracking of all security events
- **Soft Deletes**: GDPR compliance with data retention
- **2FA Support**: TOTP/SMS two-factor authentication ready
- **OAuth Integration**: Multi-provider account linking

### Authentication System

#### Configuration (`lib/auth.js`, `config/auth.config.js`)
```javascript
// Security Features
- Password: Argon2id hashing (memory cost: 64MB, iterations: 3)
- Sessions: JWT with HTTP-only secure cookies
- Rate Limiting: IP-based with exponential backoff
- Account Lockout: After 5 failed attempts
- Input Validation: DOMPurify + OWASP rules
```

#### Auth Flow
1. **Registration**: Email validation → Argon2id hash → User creation → Audit log
2. **Login**: Rate limit check → Password verify → Session creation → JWT token
3. **Session**: Token validation → IP binding → Device fingerprinting
4. **Logout**: Token revocation → Session cleanup → Audit log

### API Security Middleware

#### Rate Limiting (`lib/rateLimit.js`)
```javascript
// Configurable limits by endpoint type
- Auth endpoints: 5 requests/15 minutes
- API endpoints: 100 requests/minute
- Public endpoints: 30 requests/minute
```

#### Input Validation (`lib/validation.js`)
```javascript
// Multi-layer sanitization
- DOMPurify for HTML/XSS prevention
- SQL injection prevention
- Path traversal protection
- Command injection prevention
```

## 📱 Mobile Architecture

### React Native Structure
```
apps/mobile/
├── app/                          # Expo Router file-based routing
├── components/                   # Shared React Native components
├── polyfills/                   # Web compatibility layers
├── utils/
│   └── auth/                   # Mobile auth bridge
├── app.json                    # Expo configuration
└── package.json                # Dependencies (53 packages)
```

### Key Mobile Features
- **Navigation**: React Navigation with bottom tabs
- **Graphics**: Skia for advanced graphics
- **Media**: Expo AV for audio/video
- **Storage**: Expo Secure Store for sensitive data
- **Maps**: React Native Maps with web fallback
- **Sensors**: Accelerometer, gyroscope support

## ⚙️ Build & Deployment

### Development Environment
```bash
# Required Environment Variables
AUTH_SECRET=<32+ char secret>
AUTH_URL=https://domain.com
DATABASE_URL=<Supabase PostgreSQL URL>
SUPABASE_SERVICE_ROLE_KEY=<service key>
NEXT_PUBLIC_SUPABASE_URL=<public URL>
USE_MOCK_AUTH=false              # Development mock auth

# Optional
NODE_ENV=development
RATE_LIMIT_ENABLED=true
AUDIT_LOGGING=true
```

### Build Configuration (`vite.config.ts`)
```javascript
// 8 Custom Vite Plugins
- Route generation from filesystem
- Font loading optimization
- Console bridging for debugging
- Hot reload with HMR
- Asset processing pipeline
- TypeScript route generation
- Development warmup
- Production optimizations
```

### Deployment Pipeline
1. **Build**: `npm run build` → Vite production build
2. **Type Check**: `npm run typecheck` → TypeScript validation
3. **Test**: `npx vitest` → Test suite execution
4. **Deploy**: Node.js server with Hono runtime
5. **Monitor**: Error tracking + performance monitoring

## 🎵 Music Theory Engine

### Counterpoint Validation (`api/validate-counterpoint/route.js`)
- **746 lines** of sophisticated music theory rules
- **5 Species** of counterpoint (1st-5th century rules)
- **Real-time validation** with detailed feedback
- **Academic accuracy** following Fux's Gradus ad Parnassum

### Chord Recognition System
- **Chord Types**: Triads, 7ths, 9ths, 11ths, 13ths
- **Inversions**: All positions including open voicings
- **Validation**: Multiple notation formats accepted
- **Enharmonics**: Full enharmonic equivalent support

## 🚨 Security Architecture

### Defense Layers
1. **Network**: HTTPS enforcement, CORS configuration
2. **Application**: Rate limiting, input validation
3. **Authentication**: Argon2id, JWT, session management
4. **Authorization**: RBAC with 5 role levels
5. **Data**: Encryption at rest, RLS policies
6. **Audit**: Comprehensive logging, GDPR compliance

### Compliance Features
- **GDPR**: Privacy consent, right to be forgotten
- **PCI DSS**: No card storage (Stripe tokens only)
- **OWASP Top 10**: Full mitigation strategies
- **SOC 2**: Audit trails and access controls

## 📊 Performance Optimization

### Frontend
- **SSR**: React Router 7 server-side rendering
- **Code Splitting**: Dynamic imports for routes
- **Asset Optimization**: Vite build pipeline
- **Caching**: Service worker + HTTP caching

### Backend
- **Database**: Indexed queries, connection pooling
- **API**: Response compression, query optimization
- **Sessions**: Redis-compatible caching layer
- **CDN**: Static asset delivery

## 🐛 Known Issues & Tech Debt

### Critical
1. **Code Duplication**: Music theory utils copied 14+ times
2. **TypeScript Errors**: 20+ errors with .jsx files
3. **Test Coverage**: <10% coverage on critical logic

### Medium Priority
1. **Configuration**: Duplicate REQUIRE_INVERSION_LABELING
2. **Error Handling**: Inconsistent error responses
3. **Documentation**: Missing API documentation

### Future Enhancements
1. **WebSocket**: Real-time multiplayer practice
2. **AI Integration**: Personalized learning paths
3. **Analytics**: Advanced progress tracking
4. **Offline Mode**: PWA with service workers

---

**Last Updated**: Complete architecture documentation added
**Remember**: Update this file whenever the structure changes!

Run the server only ever on localhost:4000. do not create a secondary server at localhost:4001, only try to access the existing one. IF you need to create a new server, restart it on localhost:4000