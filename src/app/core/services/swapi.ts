import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, throwError, of } from 'rxjs';
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

export interface CharacterFilters {
  status: string;
  species: string;
  gender: string;
}

@Injectable({
  providedIn: 'root',
})
export class Swapi {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getCharactersPage(
    pageNumber: number,
    searchTerm = '',
    filters?: CharacterFilters,
  ): Observable<CharactersPage> {
    let params = new HttpParams().set('page', pageNumber);
    if (searchTerm) {
      params = params.set('name', searchTerm);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.species) {
      params = params.set('species', filters.species);
    }
    if (filters?.gender) {
      params = params.set('gender', filters.gender);
    }

    return this.http.get<CharactersApiResponse>(`${this.API_URL}/character`, { params }).pipe(
      map((response) => ({
        rows: response.results ?? [],
        total: response.info?.count ?? 0,
        hasNextPage: response.info?.next !== null,
      })),

      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of({
            rows: [],
            total: 0,
            hasNextPage: false,
          });
        }

        return throwError(() => error);
      }),
    );
  }
}
