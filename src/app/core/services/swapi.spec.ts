import { TestBed } from '@angular/core/testing';

import { Swapi } from './swapi';

describe('Swapi', () => {
  let service: Swapi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Swapi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
