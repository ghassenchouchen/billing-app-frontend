# Angular 10 Compatibility Issue with Node 24

## Problem
The Angular 10 app cannot run on Node.js v24.13.0 due to incompatible webpack and http_parser native modules.

## Solution: Downgrade to Node LTS 16

### Using Node Version Manager (NVM)
If you have NVM installed:
```powershell
nvm install 16.20.2
nvm use 16.20.2
npm install
npm start
```

### Manual Node Downgrade
1. Uninstall Node.js 24 from Control Panel → Programs → Uninstall
2. Download Node.js 16 LTS from https://nodejs.org/
3. Install Node.js 16.20.2
4. Verify:
   ```powershell
   node --version  # Should show v16.20.2
   npm start
   ```

## Alternative: Upgrade to Angular 12+ (Recommended)
Angular 12+ supports Node 14-18 (and newer versions with compatibility flags).

### Upgrade Steps
```powershell
ng update @angular/cli@12 @angular/core@12
npm install
npm start
```

## Build and Serve Commands
```powershell
npm start          # Dev server on http://localhost:4200
npm run build      # Production build
npm test           # Run unit tests
```

## Current Status
✅ Code quality fixed (memory leaks, deprecations)
✅ Dependencies updated
⚠️ Needs Node 16 LTS or Angular 12+ upgrade to serve locally
✅ Build works with `npm run build`
