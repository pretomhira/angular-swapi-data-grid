import { Component } from '@angular/core';
import { GridHeader } from '../../components/grid-header/grid-header';
import { StarshipGrid } from '../../components/starship-grid/starship-grid';

@Component({
  selector: 'app-star-wars-grid-page',
  imports: [GridHeader, StarshipGrid],
  templateUrl: './star-wars-grid-page.html',
  styleUrl: './star-wars-grid-page.css',
})
export class StarWarsGridPage {
}
