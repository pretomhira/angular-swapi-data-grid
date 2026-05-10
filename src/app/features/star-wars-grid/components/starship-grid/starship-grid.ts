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
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
    },
    {
      headerName: 'Species',
      field: 'species',
      width: 160,
    },
    {
      headerName: 'Gender',
      field: 'gender',
      width: 140,
    },
    {
      headerName: 'Origin',
      valueGetter: (params) => params.data?.origin?.name ?? '',
      minWidth: 220,
      flex: 1,
    },
    {
      headerName: 'Episodes',
      valueGetter: (params) => params.data?.episode?.length ?? '',
      width: 140,
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
        this.globalSearchRows = allRows.filter((row) => this.matchesGlobalSearch(row, this.searchTerm));
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
      const page = await firstValueFrom(this.swapiService.getCharactersPage(pageNumber, '', filters));
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
