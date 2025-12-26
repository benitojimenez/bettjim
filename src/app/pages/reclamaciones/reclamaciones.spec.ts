import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reclamaciones } from './reclamaciones';

describe('Reclamaciones', () => {
  let component: Reclamaciones;
  let fixture: ComponentFixture<Reclamaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reclamaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reclamaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
