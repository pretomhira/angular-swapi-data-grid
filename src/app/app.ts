import { Component, signal } from '@angular/core';
import { StarWarsGridPage } from './features/star-wars-grid/pages/star-wars-grid-page/star-wars-grid-page';

@Component({
  selector: 'app-root',
  imports: [StarWarsGridPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
