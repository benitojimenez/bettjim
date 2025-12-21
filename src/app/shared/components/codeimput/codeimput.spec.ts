import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Codeimput } from './codeimput';

describe('Codeimput', () => {
  let component: Codeimput;
  let fixture: ComponentFixture<Codeimput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Codeimput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Codeimput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
