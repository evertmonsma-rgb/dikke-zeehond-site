# Dikke Zeehond – Website (VS Code)

This project was exported from Replit and prepared to work nicely as a local VS Code workspace.

## Requirements
- Node.js **22 LTS** (see `.nvmrc`)

## Setup
```bash
npm install
```

## Run (recommended)
### macOS / Linux
```bash
npm run dev
```

### Windows
```bash
npm run dev:win
```

Then open:
- http://localhost:5000

### If it doesn’t start (common fixes)
- **Use Node 22 LTS** (Node 24 can cause issues with Vite/WebSocket on some setups).
- If port **5000** is already in use on macOS, run:
  ```bash
  PORT=5001 npm run dev
  ```
  and open `http://localhost:5001`.

## Client-only mode (optional)
If you only want to work on the frontend without the Express server:
```bash
npm run dev:client
```
Then open the URL shown by Vite (default port in this repo is 5000).

## Where to edit
- Main page: `client/src/pages/Home.tsx`
- App shell / routing: `client/src/App.tsx`
- Styling: `client/src/index.css`

## Notes
- Replit-specific files were removed (`.replit`, `.local`).
- A `.vscode/` folder was added with recommended extensions and formatting settings.
