import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navidad } from './navidad';

describe('Navidad', () => {
  let component: Navidad;
  let fixture: ComponentFixture<Navidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navidad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navidad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
