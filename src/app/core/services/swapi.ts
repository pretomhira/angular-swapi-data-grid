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

@Injectable({
  providedIn: 'root',
})
export class Swapi {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl;

  getCharactersPage(pageNumber: number, searchTerm = ''): Observable<CharactersPage> {
    let params = new HttpParams().set('page', pageNumber);
    if (searchTerm) {
      params = params.set('name', searchTerm);
    }

    return this.http.get<CharactersApiResponse>(`${this.API_URL}/character`, { params }).pipe(
      map((response) => ({
        rows: response.results ?? [],
        total: response.info?.count ?? 0,
        hasNextPage: response.info?.next !== null,
      })),

      catchError((error: HttpErrorResponse) => {
        if (error.status === 404 && searchTerm.trim()) {
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
