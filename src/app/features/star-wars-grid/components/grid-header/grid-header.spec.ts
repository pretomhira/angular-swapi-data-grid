import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridHeader } from './grid-header';

describe('GridHeader', () => {
  let component: GridHeader;
  let fixture: ComponentFixture<GridHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(GridHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
