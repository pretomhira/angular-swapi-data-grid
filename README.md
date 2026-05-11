# Star Wars Grid App

This project is a simple Angular app that shows character data in a table.
You can:

- search
- filter
- scroll to load more rows
- edit one column in the grid

The UI title says "Star Wars Fleet", but the data source is the Rick and Morty API.

## What this project uses

- Framework: Angular (standalone components)
- Grid package: `ag-grid-angular` and `ag-grid-community`
- Async helpers: `rxjs`

## How to install and run

## Requirements

- Node.js (LTS version is best)
- npm

## Run locally

1. Install packages:

```bash
npm install
```

2. Start the app:

```bash
npm start
```

3. Open in browser:

`http://localhost:4200`

## Build for production

```bash
npm run build:prod
```

## Tests

Run all tests:

```bash
npm test
```

Current test files:

- `src/app/core/services/swapi.spec.ts`
- `src/app/features/star-wars-grid/components/starship-grid/starship-grid.spec.ts`

What is tested now:

- `swapi.spec.ts`
  - checks API request URL and query params
  - checks response mapping (`rows`, `total`, `hasNextPage`)
  - checks 404 case returns empty result
- `starship-grid.spec.ts`
  - tests `applyLocalEdits` helper
  - checks edited row values are applied correctly
  - checks non-edited rows and fields stay unchanged

What is not tested yet:

- full grid UI behavior in browser
- infinite scroll behavior end-to-end
- filter and search behavior end-to-end
- retry/error message rendering in component template

## Which API resource is used

The app calls this endpoint:

`/character`

Base URL comes from environment files:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`
- `src/environments/environment.production.ts`

Current base URL in these files:

`https://rickandmortyapi.com/api`

So the app requests:

`https://rickandmortyapi.com/api/character`

## How infinite scroll works

Infinite scroll is done with AG Grid "infinite row model".

Main points:

- `rowModelType` is set to `'infinite'`
- On grid ready, the app sets a custom data source
- AG Grid asks for rows in blocks (`startRow`, `endRow`)
- The app converts row position to API page number
- Block size is `20` rows (`gridConfig.cacheBlockSize`)

When you scroll down, AG Grid asks for the next block, so the app loads more data without changing page.

## Why there is no full loader while scrolling

The app has a full loading skeleton only for first load and filter/search reset.

This is controlled by `isInitialLoading`:

- set to `true` when data source resets
- set to `false` after first response

During normal scroll, the app does not turn this full loader back on.
So users can keep reading current rows while next rows load.

## Which column is editable

Only the `Name` column is editable.

In column config:

- `field: 'name'`
- `editable: true`

All other columns are read-only.

## Where edited values are stored

Edits are saved in local memory only.

The component keeps them in:

`editedRows: Map<number, Partial<Character>>`

Flow:

1. User edits a cell in Name column
2. `onCellValueChanged` saves the new value in `editedRows`
3. When new rows load, local edits are merged back into rows before render

Important:

- Edits are not saved to backend
- Edits are lost if page is refreshed

## How column resize is implemented

Column resize is built in through AG Grid.

Global column defaults include:

`resizable: true`

So each column can be resized by dragging header edges.
The CSS only changes how the resize handle looks.

## Search and filter behavior

There are two modes:

1. No search text:

- App fetches one API page at a time (best for performance)

2. With search text:

- App first loads all pages for current filters
- Then runs local text matching on all loaded rows

This gives flexible search, but can use more requests and memory.

## Errors and empty states

- If API fails, app shows an error message with Retry button
- If no rows match filters/search, app shows a "No characters found" message
- When last page is reached, app shows an end-of-list message

## Trade-offs and limits

- Local edits are not permanent (no save API call)
- Global search can be heavy for very large datasets (loads all filtered pages first)
- App naming and data source are mixed: Star Wars style UI + Rick and Morty character API
- The `start:test` script may need environment file name alignment before use
