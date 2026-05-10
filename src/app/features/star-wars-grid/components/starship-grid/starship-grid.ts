import { ChangeDetectorRef, Component, inject, NgZone } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  GridApi,
  GridReadyEvent,
  IDatasource,
  IGetRowsParams,
  RowModelType,
  CellValueChangedEvent,
} from 'ag-grid-community';
import { Character } from '../../../../core/models/character.model';
import { CharacterFilters, Swapi } from '../../../../core/services/swapi';
import { debounceTime, distinctUntilChanged, firstValueFrom, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-starship-grid',
  imports: [AgGridAngular, FormsModule],
  templateUrl: './starship-grid.html',
  styleUrl: './starship-grid.css',
})
export class StarshipGrid {
  private swapiService = inject(Swapi);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private gridApi!: GridApi<Character>;
  private searchChanged$ = new Subject<string>();
  private editedRows = new Map<number, Partial<Character>>();
  private globalSearchRows: Character[] | null = null;

  hasReachedEnd = false;
  searchTerm = '';
  noRowsFound = false;
  statusFilter = '';
  speciesFilter = '';
  genderFilter = '';
  readonly statusOptions = ['', 'alive', 'dead', 'unknown'];
  readonly genderOptions = ['', 'female', 'male', 'genderless', 'unknown'];

  rowModelType: RowModelType = 'infinite';
  cacheBlockSize = 20;
  cacheOverflowSize = 1;
  maxConcurrentDatasourceRequests = 1;
  infiniteInitialRowCount = 100;
  maxBlocksInCache = 10;
  rowHeight = 36;
  headerHeight = 32;
  isInitialLoading = true;
  apiErrorMessage = '';

  columnDefs: ColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      width: 100,
    },
    {
      headerName: 'Name',
      field: 'name',
      flex: 1.5,
      minWidth: 260,
      editable: true,
      headerComponentParams: {
        template: `<div class="ag-cell-label-container" role="presentation">
          <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
            <span class="mr-1.5 inline-flex h-4 w-4 shrink-0 text-[#60646C]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <span data-ref="eText" class="ag-header-cell-text"></span>
          </div>
        </div>`,
      },
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
      headerComponentParams: {
        template: `<div class="ag-cell-label-container" role="presentation">
          <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
            <span class="mr-1.5 inline-flex h-4 w-4 shrink-0 text-[#60646C]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
            <span data-ref="eText" class="ag-header-cell-text"></span>
          </div>
        </div>`,
      },
    },
    {
      headerName: 'Species',
      field: 'species',
      width: 160,
      headerComponentParams: {
        template: `<div class="ag-cell-label-container" role="presentation">
          <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
            <span class="mr-1.5 inline-flex h-4 w-4 shrink-0 text-[#60646C]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
              </svg>
            </span>
            <span data-ref="eText" class="ag-header-cell-text"></span>
          </div>
        </div>`,
      },
    },
    {
      headerName: 'Gender',
      field: 'gender',
      width: 140,
      headerComponentParams: {
        template: `<div class="ag-cell-label-container" role="presentation">
          <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
            <span class="mr-1.5 inline-flex h-4 w-4 shrink-0 text-[#60646C]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
            </span>
            <span data-ref="eText" class="ag-header-cell-text"></span>
          </div>
        </div>`,
      },
    },
    {
      headerName: 'Origin',
      valueGetter: (params) => params.data?.origin?.name ?? '',
      minWidth: 220,
      flex: 1,
      headerComponentParams: {
        template: `<div class="ag-cell-label-container" role="presentation">
          <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
            <span class="mr-1.5 inline-flex h-4 w-4 shrink-0 text-[#60646C]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </span>
            <span data-ref="eText" class="ag-header-cell-text"></span>
          </div>
        </div>`,
      },
    },
    {
      headerName: 'Episodes',
      valueGetter: (params) => params.data?.episode?.length ?? '',
      width: 140,
      headerComponentParams: {
        template: `<div class="ag-cell-label-container" role="presentation">
          <div data-ref="eLabel" class="ag-header-cell-label" role="presentation">
            <span class="mr-1.5 inline-flex h-4 w-4 shrink-0 text-[#60646C]" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
              </svg>
            </span>
            <span data-ref="eText" class="ag-header-cell-text"></span>
          </div>
        </div>`,
      },
    },
  ];

  defaultColDef: ColDef = {
    sortable: false,
    filter: false,
    resizable: true,
  };

  ngOnInit(): void {
    this.searchChanged$.pipe(debounceTime(500), distinctUntilChanged()).subscribe((value) => {
      this.searchTerm = value.trim();
      this.resetGridDataSource();
    });
  }

  onSearchChange(value: string): void {
    this.searchChanged$.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChanged$.next('');
  }

  onFilterChange(): void {
    this.resetGridDataSource();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.speciesFilter = '';
    this.genderFilter = '';
    this.resetGridDataSource();
  }

  onCellValueChanged(event: CellValueChangedEvent): void {
    const row = event.data;
    if (row?.id || !event.colDef.field) {
      return;
    }
    const existingEdit = this.editedRows.get(row.id) || {};

    this.editedRows.set(row.id, {
      ...existingEdit,
      [event.colDef.field]: event.newValue,
    });
  }

  retryLoadData(): void {
    this.apiErrorMessage = '';
    this.resetGridDataSource();
  }

  onGridReady(params: GridReadyEvent<Character>): void {
    this.gridApi = params.api;
    this.resetGridDataSource();
  }

  private resetGridDataSource(): void {
    if (!this.gridApi) {
      return;
    }

    this.hasReachedEnd = false;
    this.noRowsFound = false;
    this.isInitialLoading = true;
    this.apiErrorMessage = '';
    this.globalSearchRows = null;

    const dataSource: IDatasource = {
      rowCount: undefined,

      getRows: (rowParams: IGetRowsParams) => {
        if (this.searchTerm) {
          this.getRowsForGlobalSearch(rowParams);
          return;
        }

        const pageNumber = Math.floor(rowParams.startRow / this.cacheBlockSize) + 1;
        const filters: CharacterFilters = {
          status: this.statusFilter,
          species: this.speciesFilter.trim(),
          gender: this.genderFilter,
        };

        this.swapiService.getCharactersPage(pageNumber, '', filters).subscribe({
          next: (page) => {
            const isFirstBlock = rowParams.startRow === 0;
            const isEmptyPage = page.rows.length === 0;

            if (isEmptyPage && !isFirstBlock) {
              this.ngZone.run(() => {
                this.noRowsFound = false;
                this.hasReachedEnd = true;
                this.cdr.markForCheck();
              });

              rowParams.successCallback([], rowParams.startRow);
              this.gridApi.hideOverlay();
              return;
            }

            this.ngZone.run(() => {
              this.isInitialLoading = false;
              this.noRowsFound = isFirstBlock && page.total === 0;
              this.hasReachedEnd = page.total > 0 && !page.hasNextPage;
              this.cdr.markForCheck();
            });

            if (isFirstBlock && page.total === 0) {
              rowParams.successCallback([], 0);
              this.gridApi.showNoRowsOverlay();
              return;
            }

            const rowsWithLocalEdits = page.rows.map((row) => ({
              ...row,
              ...(this.editedRows.get(row.id) ?? {}),
            }));

            const lastRow = page.hasNextPage ? undefined : rowParams.startRow + page.rows.length;

            rowParams.successCallback(rowsWithLocalEdits, lastRow);

            this.gridApi.hideOverlay();
          },

          error: () => {
            this.ngZone.run(() => {
              this.isInitialLoading = false;
              this.apiErrorMessage = 'Could not load characters. Please try again.';
              this.cdr.markForCheck();
            });
            rowParams.failCallback();
          },
        });
      },
    };

    this.gridApi.setGridOption('datasource', dataSource);
  }

  private async getRowsForGlobalSearch(rowParams: IGetRowsParams): Promise<void> {
    try {
      if (!this.globalSearchRows) {
        const filters: CharacterFilters = {
          status: this.statusFilter,
          species: this.speciesFilter.trim(),
          gender: this.genderFilter,
        };

        const allRows = await this.fetchAllRowsForFilters(filters);
        this.globalSearchRows = allRows.filter((row) =>
          this.matchesGlobalSearch(row, this.searchTerm),
        );
      }

      const filteredRows = this.globalSearchRows;
      const pageRows = filteredRows.slice(rowParams.startRow, rowParams.endRow).map((row) => ({
        ...row,
        ...(this.editedRows.get(row.id) ?? {}),
      }));

      this.ngZone.run(() => {
        this.isInitialLoading = false;
        this.noRowsFound = filteredRows.length === 0;
        this.hasReachedEnd = filteredRows.length > 0 && rowParams.endRow >= filteredRows.length;
        this.cdr.markForCheck();
      });

      rowParams.successCallback(pageRows, filteredRows.length);
      if (filteredRows.length === 0) {
        this.gridApi.showNoRowsOverlay();
      } else {
        this.gridApi.hideOverlay();
      }
    } catch {
      this.ngZone.run(() => {
        this.isInitialLoading = false;
        this.apiErrorMessage = 'Could not load characters. Please try again.';
        this.cdr.markForCheck();
      });
      rowParams.failCallback();
    }
  }

  private async fetchAllRowsForFilters(filters: CharacterFilters): Promise<Character[]> {
    const rows: Character[] = [];
    let pageNumber = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const page = await firstValueFrom(
        this.swapiService.getCharactersPage(pageNumber, '', filters),
      );
      rows.push(...page.rows);
      hasNextPage = page.hasNextPage;
      pageNumber += 1;
    }

    return rows;
  }

  private matchesGlobalSearch(row: Character, term: string): boolean {
    const needle = term.toLowerCase();
    const haystack = [
      row.name,
      row.status,
      row.species,
      row.type,
      row.gender,
      row.origin?.name ?? '',
      row.location?.name ?? '',
      String(row.id),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(needle);
  }
}
