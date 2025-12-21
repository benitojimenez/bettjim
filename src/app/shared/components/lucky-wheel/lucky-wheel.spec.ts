import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuckyWheel } from './lucky-wheel';

describe('LuckyWheel', () => {
  let component: LuckyWheel;
  let fixture: ComponentFixture<LuckyWheel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuckyWheel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LuckyWheel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
