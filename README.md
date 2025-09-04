# Fitness Data API

A TypeScript API that fetches fitness data from Strava and Whoop, formatted for Claude coaching analysis. Accessible via iOS Shortcuts for mobile use.

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
Copy `.env` and fill in your API credentials:
```
# Strava
STRAVA_CLIENT_ID=your_strava_client_id_here
STRAVA_CLIENT_SECRET=your_strava_client_secret_here
STRAVA_ACCESS_TOKEN=your_strava_access_token_here

# Whoop
WHOOP_CLIENT_ID=your_whoop_client_id_here
WHOOP_CLIENT_SECRET=your_whoop_client_secret_here
WHOOP_ACCESS_TOKEN=your_whoop_access_token_here

PORT=3000
```

## API Endpoints

### Health
- `GET /health` - Health check endpoint

### Strava
- `GET /auth/strava` - Initiates Strava OAuth flow
- `GET /strava/latest-activity` - Latest running activity with splits

### Whoop
- `GET /auth/whoop` - Initiates Whoop OAuth flow  
- `GET /whoop/recovery` - Current recovery score
- `GET /whoop/latest` - Latest workout with heart rate zones

**Strava Example Response:**
```json
{
  "formatted_text": "**Latest Run Analysis - 1/15/2025**\n\n**Activity:** Morning Run\n**Distance:** 5.20 km\n**Duration:** 25 minutes\n**Average Pace:** 4:49 min/km\n**Elevation Gain:** 45m\n**Average Speed:** 12.4 km/h\n\n**Splits:**\nKm 1: 4:52 min/km (+12m)\nKm 2: 4:45 min/km (+8m)\nKm 3: 4:51 min/km (+15m)\nKm 4: 4:47 min/km (+7m)\nKm 5: 4:43 min/km (+3m)"
}
```

**Whoop Recovery Example Response:**
```json
{
  "formatted_text": "**Today's Recovery: 97% (Green)**",
  "recovery_score": 97
}
```

**Whoop Latest Workout Example Response:**
```json
{
  "formatted_text": "**Latest running - 8/30/2025**\n**Distance:** N/A km\n**Strain:** 20.64\n**Avg HR:** 155 bpm\n\n**Heart Rate Zones:**\nZone 1: 8min (15.2%)\nZone 2: 39min (36.4%)\nZone 3: 15min (24.2%)\nZone 4: 55min (18.2%)\nZone 5: 77min (6.1%)"
}
```

**Formatted Outputs:**

*Strava:*
```
**Latest Run Analysis - 1/15/2025**

**Activity:** Morning Run
**Distance:** 5.20 km
**Duration:** 25 minutes
**Average Pace:** 4:49 min/km
**Elevation Gain:** 45m
**Average Speed:** 12.4 km/h

**Splits:**
Km 1: 4:52 min/km (+12m)
Km 2: 4:45 min/km (+8m)
Km 3: 4:51 min/km (+15m)
Km 4: 4:47 min/km (+7m)
Km 5: 4:43 min/km (+3m)
```

*Whoop Recovery:*
```
**Today's Recovery: 97% (Green)**
```

*Whoop Latest Workout:*
```
**Latest running - 8/30/2025**
**Distance:** N/A km
**Strain:** 20.64
**Avg HR:** 155 bpm

**Heart Rate Zones:**
Zone 1: 8min (15.2%)
Zone 2: 39min (36.4%)
Zone 3: 15min (24.2%)
Zone 4: 55min (18.2%)
Zone 5: 77min (6.1%)
```

## Usage
1. Complete OAuth setup once via `/auth/strava` and `/auth/whoop`
2. Call endpoints to get formatted fitness data
3. Copy `formatted_text` and paste into your Claude coaching thread

## Deployment
Ready to deploy to Render for iOS Shortcuts integration