import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTwo } from './product-two';

describe('ProductTwo', () => {
  let component: ProductTwo;
  let fixture: ComponentFixture<ProductTwo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTwo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductTwo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
