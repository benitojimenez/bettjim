import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductOne } from './product-one';

describe('ProductOne', () => {
  let component: ProductOne;
  let fixture: ComponentFixture<ProductOne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductOne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
