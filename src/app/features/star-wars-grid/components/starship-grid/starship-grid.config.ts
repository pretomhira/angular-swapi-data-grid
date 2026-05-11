import { ColDef, RowModelType } from 'ag-grid-community';

export const rowModelType: RowModelType = 'infinite';

export const defaultColDef: ColDef = {
  sortable: false,
  filter: false,
  resizable: true,
};

export const gridConfig = {
  cacheOverflowSize: 1,
  maxConcurrentDatasourceRequests: 1,
  infiniteInitialRowCount: 100,
  maxBlocksInCache: 10,
  rowHeight: 36,
  headerHeight: 32,
  cacheBlockSize: 20,
};
