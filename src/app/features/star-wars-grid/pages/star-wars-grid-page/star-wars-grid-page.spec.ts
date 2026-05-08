import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarWarsGridPage } from './star-wars-grid-page';

describe('StarWarsGridPage', () => {
  let component: StarWarsGridPage;
  let fixture: ComponentFixture<StarWarsGridPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarWarsGridPage],
    }).compileComponents();

    fixture = TestBed.createComponent(StarWarsGridPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
