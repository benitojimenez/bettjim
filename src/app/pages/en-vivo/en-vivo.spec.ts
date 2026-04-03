import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnVivo } from './en-vivo';

describe('EnVivo', () => {
  let component: EnVivo;
  let fixture: ComponentFixture<EnVivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnVivo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnVivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
