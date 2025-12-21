import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderOne } from './header-one';

describe('HeaderOne', () => {
  let component: HeaderOne;
  let fixture: ComponentFixture<HeaderOne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderOne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderOne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
