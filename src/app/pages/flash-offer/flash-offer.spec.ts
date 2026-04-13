import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashOffer } from './flash-offer';

describe('FlashOffer', () => {
  let component: FlashOffer;
  let fixture: ComponentFixture<FlashOffer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashOffer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashOffer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
