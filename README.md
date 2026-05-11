# Star Wars Grid App

This project is a simple Angular app that shows character data in a table.
You can:

- search
- filter
- scroll to load more rows
- edit one column in the grid

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
- `npm run test` (test)
- `npm run build` (production build)

```bash
npm run build:prod
```

## Tests

Current configured API URL:

- `https://rickandmortyapi.com/api`

So requests are made to:

- `https://rickandmortyapi.com/api/character`

Current test files:

Infinite scroll is implemented with **AG Grid Infinite Row Model**:

- `rowModelType: 'infinite'`
- A custom datasource is set in `onGridReady()`
- `getRows(startRow, endRow)` loads pages from the API as the user scrolls
- Page size comes from `gridConfig.cacheBlockSize` (20)

Why there is no full-page loader while scrolling:

- The loading skeleton is controlled by `isInitialLoading`
- `isInitialLoading` is set to `true` only when the data source is reset (first load, new search, new filter)
- During normal scrolling, next blocks load in the background and the full-page loader is not shown

- `swapi.spec.ts`
  - checks API request URL and query params
  - checks response mapping (`rows`, `total`, `hasNextPage`)
  - checks 404 case returns empty result
- `starship-grid.spec.ts`
  - tests `applyLocalEdits` helper
  - checks edited row values are applied correctly
  - checks non-edited rows and fields stay unchanged

Editable column:

- `Name` only (`editable: true` in column definitions)

Where edits are stored:

- In memory in the component, inside:
  `editedRows: Map<number, Partial<Character>>`

How it works:

- On edit (`cellValueChanged`), new values are saved in `editedRows`
- When rows are loaded again, local edits are merged back using `applyLocalEdits(...)`
- Edits are not sent to backend and are lost on page refresh

1. User edits a cell in Name column
2. `onCellValueChanged` saves the new value in `editedRows`
3. When new rows load, local edits are merged back into rows before render

Column resizing is enabled through AG Grid default column settings:

- `defaultColDef.resizable = true`

UI behavior:

- AG Grid built-in resize handle is used
- Custom CSS styles the resize handle on hover

## How column resize is implemented

Column resize is built in through AG Grid.

Global column defaults include:

Main third-party grid package:

- `ag-grid-angular`
- `ag-grid-community`

Also used:

- `rxjs` for debounce and async stream handling
