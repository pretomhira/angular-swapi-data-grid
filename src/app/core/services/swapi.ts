import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Swapi {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getStarships(pageNumber: number) {
    return this.http.get(`${this.API_URL}/starships/?page=${pageNumber}`);
  }
}
