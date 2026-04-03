import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveShopping } from './live-shopping';

describe('LiveShopping', () => {
  let component: LiveShopping;
  let fixture: ComponentFixture<LiveShopping>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveShopping]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveShopping);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
