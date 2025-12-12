# FestivalMatcher Frontend - AI Coding Guidelines

## Project Overview
FestivalMatcher is a React/TypeScript app that helps users find festivals matching their Spotify liked songs or playlists. It integrates with Clashfinder for festival data and uses Spotify OAuth for authentication.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **State Management**: Centralized in `App.tsx` using React hooks with entry modes (`choose`, `login`, `playlist`, etc.)
- **API Integration**: RESTful calls to backend at `VITE_API_BASE_URL` with `credentials: 'include'` for cookie-based auth
- **Mock Server**: Express.js server (`mock-server.js`) for local development, proxies via Vite config

## Development Workflow
- **Start Dev**: `npm run dev` (Vite on :5173, proxies `/api` to mock server :44331)
- **Mock Server**: Run `node mock-server.js` separately for local API simulation
- **Build**: `npm run build` (TypeScript compilation + Vite build)
- **Lint**: `npm run lint` (ESLint with React hooks plugin)

## Key Patterns
- **Entry Modes**: App switches between modes via `entryMode` state in `App.tsx` (e.g., `year-liked`, `date-range-playlist`)
- **Festival Matching**: Three modes - single festival (`FestivalForm`), year search (`YearSearchForm`), date range (`DateRangeSearchForm`)
- **Sorting**: User preferences stored in localStorage per mode (`festivalMatcher_sortPreference_{liked|playlist}`)
- **Authentication**: Check login via `/authentication/profile`, redirect to Spotify OAuth
- **Error Handling**: `ErrorBoundary` component wraps app, individual components handle API errors
- **Data Fetching**: Use `fetch` with `credentials: 'include'`, handle 401 for logout

## Component Structure
- **Forms**: Fuzzy search festivals from `/clashfinders/list/all`, submit to matching endpoints
- **Results**: `TopMatchesResult` displays sorted `FestivalMatchResponse[]`, `Result` for single matches
- **UI**: Tailwind classes for dark theme (gray-900 bg), responsive design

## Conventions
- **Types**: Defined in `types.ts` (e.g., `FestivalMatchResponse`, `FestivalInfo`)
- **Constants**: Sorting prefs in `constants.ts`, cookie utils in `utils/cookieUtils.ts`
- **Environment**: `.env` files for `VITE_API_BASE_URL` (production vs local mock)
- **Imports**: Relative paths, destructure props in components
- **Styling**: Utility-first with Tailwind, consistent button styles (e.g., `bg-green-500 hover:bg-green-600`)

## Examples
- **API Call**: `fetch(`${import.meta.env.VITE_API_BASE_URL}/festivalmatching/by-year/${year}`, { credentials: 'include' })`
- **State Update**: `setEntryMode('year-liked')` to switch app mode
- **Sorting**: Load from localStorage: `loadSortPreference(mode)`, sort matches by `matchedTracksCount` descending</content>
<parameter name="filePath">c:\Users\alond\Documents\Git\FestivalMatcher-FE\.github\copilot-instructions.md