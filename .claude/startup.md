# MIDI Training App - Startup Guide

## Quick Start Commands

To start the localhost development server for the MIDI Training App:

### Option 1: Start Web App Only
```bash
cd "C:\Users\Luke\Desktop\programming\create-anything\apps\web"
npm run dev
```

### Option 2: Start All Apps (Web + Mobile)
```bash
cd "C:\Users\Luke\Desktop\programming\create-anything"
npm run dev
```

### Option 3: Start Web App from Root Directory
```bash
cd "C:\Users\Luke\Desktop\programming\create-anything"
npm run dev:web
```

## Expected Output

When the server starts successfully, you should see:
```
> dev
> react-router dev

  ➜  Local:   http://localhost:4000/
  ➜  Network: http://172.29.144.1:4000/
  ➜  Network: http://192.168.4.34:4000/

🔧 Registering routes...
✅ Registered GET /exercises
✅ Registered POST /exercises
✅ Registered GET /exercises/:id
✅ Registered POST /validate-counterpoint
✅ Registered GET /auth/token
✅ Registered GET /auth/expo-web-success
🎉 Route registration completed
🚧 Dev server started
```

## Access URLs

Once the server is running, access the application at:

- **Main Page**: http://localhost:4000/
- **Chord Recognition**: http://localhost:4000/chord-recognition
- **Counterpoint**: http://localhost:4000/counterpoint

## Project Structure

```
create-anything/
├── apps/
│   ├── web/           # React Router v7 web application
│   └── mobile/        # React Native mobile application
├── package.json       # Root workspace configuration
└── .claude/          # Documentation and memory files
```

## Key Technologies

- **React Router v7** - For routing and SSR
- **React 18.3.1** - UI library (pinned version for compatibility)
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Hono** - Server framework
- **TypeScript** - Type safety

## Troubleshooting

### If the server won't start:
1. **Check React versions**: Ensure React 18.3.1 is installed (not React 19)
2. **Clear cache**: `rm -rf node_modules package-lock.json && npm install`
3. **Kill existing processes**: Use `npx kill-port 4000` if port is busy

### If you see "Objects are not valid as a React child" error:
This indicates React version incompatibility. The project requires React 18.3.1.

### React Version Fix (if needed):
```bash
cd "C:\Users\Luke\Desktop\programming\create-anything"
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Development Workflow

1. **Start the server** using one of the commands above
2. **Open browser** to http://localhost:4000/
3. **Make changes** to files in `apps/web/src/`
4. **Hot reload** will automatically update the browser
5. **Check console** for any errors or warnings

## Important Notes

- **React 18.3.1 Required**: React Router v7 SSR is not compatible with React 19
- **Legacy Peer Deps**: Use `--legacy-peer-deps` flag when installing to resolve dependency conflicts
- **SSR Enabled**: Server-side rendering is enabled for better performance
- **Port 4000**: Default development server port (may auto-increment if busy)

---
*Last updated: August 12, 2025*
*Server successfully debugged and optimized for React Router v7*