import { Component, inject, signal } from '@angular/core';
import { Starship } from '../../../../core/models/starship.model';
import { GridHeader } from '../../components/grid-header/grid-header';
import { StarshipGrid } from '../../components/starship-grid/starship-grid';
import { Swapi } from '../../../../core/services/swapi';

@Component({
  selector: 'app-star-wars-grid-page',
  imports: [GridHeader, StarshipGrid],
  templateUrl: './star-wars-grid-page.html',
  styleUrl: './star-wars-grid-page.css',
})
export class StarWarsGridPage {
  private swapiService = inject(Swapi);

  starships = signal<Starship[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadStarships();
  }

  loadStarships(): void {
    this.loading.set(true);
    this.error.set(null);

    this.swapiService.getStarships(1).subscribe({
      next: (data) => {
        const rows = Array.isArray(data) ? data : (data.results ?? []);
        this.starships.set(rows);
        this.loading.set(false);
        console.log('Starships loaded:', this.starships());
      },
      error: (error) => {
        console.error('Error fetching starships:', error);
        this.error.set('Failed to load starships');
        this.loading.set(false);
      },
    });
  }
}
