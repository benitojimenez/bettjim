import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FashionOne } from './fashion-one';

describe('FashionOne', () => {
  let component: FashionOne;
  let fixture: ComponentFixture<FashionOne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FashionOne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FashionOne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
