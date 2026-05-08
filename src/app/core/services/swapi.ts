import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Starship } from '../models/starship.model';

interface SwapiPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root',
})
export class Swapi {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getStarships(pageNumber: number): Observable<SwapiPaginatedResponse<Starship> | Starship[]> {
    return this.http.get<SwapiPaginatedResponse<Starship> | Starship[]>(`${this.API_URL}/starships/?page=${pageNumber}`);
  }
}
