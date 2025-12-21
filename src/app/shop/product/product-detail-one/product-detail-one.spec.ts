import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailOne } from './product-detail-one';

describe('ProductDetailOne', () => {
  let component: ProductDetailOne;
  let fixture: ComponentFixture<ProductDetailOne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailOne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailOne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
