import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { Swapi } from './swapi';
import { environment } from '../../../environments/environment.testing';
import { Character } from '../models/character.model';

describe('Swapi', () => {
  let service: Swapi;
  let httpMock: HttpTestingController;

  const mockCharacter = (id: number, name: string): Character =>
    ({
      id,
      name,
      status: 'Alive',
      species: 'Human',
      type: '',
      gender: 'Male',
      origin: { name: 'Earth', url: '' },
      location: { name: 'Earth', url: '' },
      image: '',
      episode: [],
      url: '',
      created: '',
    }) as Character;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Swapi, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(Swapi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch and map a paginated characters page', () => {
    const filters = {
      status: 'alive',
      species: 'human',
      gender: 'male',
    };

    service.getCharactersPage(1, 'rick', filters).subscribe((page) => {
      expect(page.rows.length).toBe(1);
      expect(page.rows[0].name).toBe('Rick Sanchez');
      expect(page.total).toBe(2);
      expect(page.hasNextPage).toBe(true);
    });

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${environment.apiUrl}/character` &&
        request.params.get('page') === '1' &&
        request.params.get('name') === 'rick' &&
        request.params.get('status') === 'alive' &&
        request.params.get('species') === 'human' &&
        request.params.get('gender') === 'male'
      );
    });

    expect(req.request.method).toBe('GET');

    req.flush({
      info: {
        count: 2,
        pages: 2,
        next: `${environment.apiUrl}/character?page=2`,
        prev: null,
      },
      results: [mockCharacter(1, 'Rick Sanchez')],
    });
  });
});
