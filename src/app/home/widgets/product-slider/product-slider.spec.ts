import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSlider } from './product-slider';

describe('ProductSlider', () => {
  let component: ProductSlider;
  let fixture: ComponentFixture<ProductSlider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSlider]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSlider);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
