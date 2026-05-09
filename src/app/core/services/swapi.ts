import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Character } from '../models/character.model';

interface CharactersApiResponse {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: Character[];
}

export interface CharactersPage {
  rows: Character[];
  total: number;
  hasNextPage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Swapi {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getCharactersPage(pageNumber: number): Observable<CharactersPage> {
    return this.http
      .get<CharactersApiResponse>(`${this.API_URL}/character?page=${pageNumber}`)
      .pipe(
      map((response) => ({
        rows: response.results ?? [],
        total: response.info?.count ?? 0,
        hasNextPage: response.info?.next !== null,
      })),
      );
  }
}
