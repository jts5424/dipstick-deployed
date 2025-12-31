# Rename Checklist: client → frontend, frontend → frontend-legacy

## Files to Update After Rename

### 1. `vite.config.ts`
- Line 28: `"client"` → `"frontend"`
- Line 38: `"client"` → `"frontend"`

### 2. `tsconfig.json`
- Line 2: `"client/src/**/*"` → `"frontend/src/**/*"`
- Line 19: `"./client/src/*"` → `"./frontend/src/*"`

### 3. `server/vite.ts`
- Line 41: `"client"` → `"frontend"`

### 4. `script/build.ts`
- Line 38: `"building client..."` → `"building frontend..."` (optional, just a log message)

### 5. `server/static.ts`
- Line 9: `"build the client first"` → `"build the frontend first"` (optional, just error message)

### 6. `components.json`
- Line 8: `"client/src/index.css"` → `"frontend/src/index.css"`

### 7. Railway Config
- Move `client/railway.json` → `frontend/railway.json` (already created)

## Files That Reference "frontend" (will become "frontend-legacy")
- These are mostly in documentation/prototype folder
- No code dependencies on the old `frontend/` folder
- Safe to rename to `frontend-legacy`

## Summary
✅ All references are in config files (vite, tsconfig, server files)
✅ No hardcoded imports that would break
✅ The `@/` alias will still work after updating tsconfig.json and vite.config.ts
✅ Railway config already created in client/ (will move with rename)

## Action Items
1. Rename folders: `client` → `frontend`, `frontend` → `frontend-legacy`
2. Update the 6 files listed above
3. Move `client/railway.json` → `frontend/railway.json` (or it moves automatically)
4. Test build: `npm run build`
5. Test dev: `npm run dev`

