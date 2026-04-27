import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreFront } from './store-front';

describe('StoreFront', () => {
  let component: StoreFront;
  let fixture: ComponentFixture<StoreFront>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreFront]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreFront);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
