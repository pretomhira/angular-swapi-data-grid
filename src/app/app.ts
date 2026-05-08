import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Swapi } from './core/services/swapi';
import { StarWarsGridPage } from './features/star-wars-grid/pages/star-wars-grid-page/star-wars-grid-page';

@Component({
  selector: 'app-root',
  imports: [StarWarsGridPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private swapiService = inject(Swapi);

  ngOnInit(): void {
    this.loadStarships();
  }

  loadStarships(): void {
    this.swapiService.getStarships(1).subscribe({
      next: (data) => {
        console.log('Starships data:', data);
      },
      error: (error) => {
        console.error('Error fetching starships:', error);
      },
    });
  }
  protected readonly title = signal('angular-swapi-data-grid');
}
