# Star Wars Data Grid (Angular)

This app shows character data in a grid with search, filters, infinite scroll, and inline editing.

## 1) Install and run

Requirements:
- Node.js (LTS recommended)
- npm

Steps:
1. Install dependencies:
```bash
npm install
```
2. Start the app:
```bash
npm start
```
3. Open:
`http://localhost:4200`

Useful commands:
- `npm run start:dev` (development config)
- `npm run start:test` (test config)
- `npm run build` (production build)

## 2) SWAPI resource chosen

The grid uses the **character** resource (`/character`) from the configured API URL in `environment.*.ts`.

Current configured API URL:
- `https://rickandmortyapi.com/api`

So requests are made to:
- `https://rickandmortyapi.com/api/character`

## 3) Infinite scroll + “no loader while scrolling”

Infinite scroll is implemented with **AG Grid Infinite Row Model**:
- `rowModelType: 'infinite'`
- A custom datasource is set in `onGridReady()`
- `getRows(startRow, endRow)` loads pages from the API as the user scrolls
- Page size comes from `gridConfig.cacheBlockSize` (20)

Why there is no full-page loader while scrolling:
- The loading skeleton is controlled by `isInitialLoading`
- `isInitialLoading` is set to `true` only when the data source is reset (first load, new search, new filter)
- During normal scrolling, next blocks load in the background and the full-page loader is not shown

## 4) Editable columns + where edits are stored

Editable column:
- `Name` only (`editable: true` in column definitions)

Where edits are stored:
- In memory in the component, inside:
`editedRows: Map<number, Partial<Character>>`

How it works:
- On edit (`cellValueChanged`), new values are saved in `editedRows`
- When rows are loaded again, local edits are merged back using `applyLocalEdits(...)`
- Edits are not sent to backend and are lost on page refresh

## 5) Column resizing

Column resizing is enabled through AG Grid default column settings:
- `defaultColDef.resizable = true`

UI behavior:
- AG Grid built-in resize handle is used
- Custom CSS styles the resize handle on hover

## 6) Trade-offs and limitations

- Edited values are local only (not persisted to server)
- Global text search fetches all pages first, then filters client-side (simple but can be heavy on large datasets)
- API/network errors show a retry message, but no offline caching is used
- Data model and naming are mixed (project name says Star Wars, configured endpoint is Rick and Morty API)

## 7) Third-party package used

Main third-party grid package:
- `ag-grid-angular`
- `ag-grid-community`

Also used:
- `rxjs` for debounce and async stream handling
