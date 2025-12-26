import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerToast } from './viewer-toast';

describe('ViewerToast', () => {
  let component: ViewerToast;
  let fixture: ComponentFixture<ViewerToast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewerToast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewerToast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
