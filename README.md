 What This Project Does:
  Creates a TypeScript API that fetches your Strava running data and formats it for Claude
  coaching analysis. Accessible via iOS Shortcuts for mobile use.

  Project Initialization:
  npm init -y                    # Creates basic package.json with defaults
  npx tsc --init                 # Generates TypeScript configuration
  npm install express axios dotenv cors
  npm install --save-dev typescript @types/node @types/express @types/cors ts-node

  Dependencies Explained:
  - express - Web server framework for API endpoints
  - axios - HTTP client for calling Strava API
  - dotenv - Loads environment variables (for Strava tokens)
  - cors - Enables cross-origin requests (for iOS Shortcuts)
  - typescript + @types/ - TypeScript support and type definitions
  - ts-node - Run TypeScript directly without compiling

  TypeScript Configuration Updates:
  - "rootDir": "./src" - Source code location
  - "outDir": "./dist" - Compiled output location
  - "types": ["node"] - Include Node.js type definitions

  These changes tell TypeScript where to find source files and where to put compiled
  JavaScript, plus enable Node.js types for server development.

  Scripts Available:
  - npm run dev - Development server with hot reload
  - npm run build - Compile TypeScript to JavaScript
  - npm start - Run compiled production version
  - npm run typecheck - Verify types without compiling