# Strava Coach API

A TypeScript API that fetches Strava running data and formats it for Claude coaching analysis. Accessible via iOS Shortcuts for mobile use.

## Project Setup

### Initial Setup Commands
```bash
npm init -y                    # Creates basic package.json with defaults
npx tsc --init                 # Generates TypeScript configuration
mkdir src                      # Create source directory
```

### Install Dependencies
```bash
npm install express axios dotenv cors
npm install --save-dev typescript @types/node @types/express @types/cors ts-node
```

### Dependencies Explained
- **express** - Web server framework for API endpoints
- **axios** - HTTP client for calling Strava API
- **dotenv** - Loads environment variables (for Strava tokens)
- **cors** - Enables cross-origin requests (for iOS Shortcuts)
- **typescript + @types/** - TypeScript support and type definitions
- **ts-node** - Run TypeScript directly without compiling

## Configuration

### TypeScript Configuration Updates
- **"rootDir": "./src"** - Source code location
- **"outDir": "./dist"** - Compiled output location  
- **"types": ["node"]** - Include Node.js type definitions

### Package.json Module Configuration
- **"type": "module"** - Enables ES6 imports/exports

**Why "type": "module" is needed:**
TypeScript was configured for ES modules (`"module": "nodenext"`) but Node.js defaults to CommonJS format. The conflict occurs because:
- Your code uses ES6 imports: `import express from 'express'`
- But package.json didn't specify module type
- Node.js assumed CommonJS format (which uses `require()`)
- TypeScript's `verbatimModuleSyntax` enforced strict module syntax

Adding `"type": "module"` tells Node.js this project uses ES modules, allowing modern `import/export` syntax instead of `require()/module.exports`.

## Available Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Run compiled production version
- `npm run typecheck` - Verify types without compiling

## Environment Variables
Copy `.env` and fill in your Strava API credentials:
```
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_ACCESS_TOKEN=your_access_token_here
PORT=3000
```