import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailTwo } from './product-detail-two';

describe('ProductDetailTwo', () => {
  let component: ProductDetailTwo;
  let fixture: ComponentFixture<ProductDetailTwo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailTwo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailTwo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
