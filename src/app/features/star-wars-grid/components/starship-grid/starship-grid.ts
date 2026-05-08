import { Component, Input } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ModuleRegistry, AllCommunityModule, ColDef } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
@Component({
  selector: 'app-starship-grid',
  imports: [AgGridAngular],
  templateUrl: './starship-grid.html',
  styleUrl: './starship-grid.css',
})
export class StarshipGrid {
  @Input() rowData: any[] = [];

  columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      flex: 1,
      minWidth: 220,
    },
    {
      headerName: 'Model',
      field: 'model',
      flex: 1,
      minWidth: 220,
    },
    {
      headerName: 'Manufacturer',
      field: 'manufacturer',
      flex: 1.5,
      minWidth: 260,
    },
    {
      headerName: 'Crew',
      field: 'crew',
      width: 120,
    },
    {
      headerName: 'Passengers',
      field: 'passengers',
      width: 140,
    },
    {
      headerName: 'Hyperdrive Rating',
      field: 'hyperdrive_rating',
      width: 180,
    },
    {
      headerName: 'MGLT',
      field: 'MGLT',
      width: 120,
    },
    {
      headerName: 'Starship Class',
      field: 'starship_class',
      minWidth: 200,
    },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };
}
