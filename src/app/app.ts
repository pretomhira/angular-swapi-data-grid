import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Swapi } from './core/services/swapi';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
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
