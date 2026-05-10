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
} from 'ag-grid-community';
import { Character } from '../../../../core/models/character.model';
import { CharacterFilters, Swapi } from '../../../../core/services/swapi';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
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
  cacheOverflowSize = 2;
  maxConcurrentDatasourceRequests = 1;
  infiniteInitialRowCount = 100;
  maxBlocksInCache = 10;
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
      this.searchTerm = value;
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

    const dataSource: IDatasource = {
      rowCount: undefined,

      getRows: (rowParams: IGetRowsParams) => {
        const pageNumber = Math.floor(rowParams.startRow / this.cacheBlockSize) + 1;
        const filters: CharacterFilters = {
          status: this.statusFilter,
          species: this.speciesFilter.trim(),
          gender: this.genderFilter,
        };

        this.swapiService.getCharactersPage(pageNumber, this.searchTerm, filters).subscribe({
          next: (page) => {
            this.ngZone.run(() => {
              this.noRowsFound = page.total === 0;
              this.hasReachedEnd = page.total > 0 && !page.hasNextPage;
              this.cdr.markForCheck();
            });

            if (page.total === 0) {
              rowParams.successCallback([], 0);
              this.gridApi.showNoRowsOverlay();
              return;
            }

            const lastRow = page.hasNextPage ? -1 : page.total;

            rowParams.successCallback(page.rows, lastRow);

            this.gridApi.hideOverlay();
          },

          error: () => {
            rowParams.failCallback();
          },
        });
      },
    };

    this.gridApi.setGridOption('datasource', dataSource);
  }
}
