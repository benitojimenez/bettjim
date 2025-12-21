import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterOne } from './footer-one';

describe('FooterOne', () => {
  let component: FooterOne;
  let fixture: ComponentFixture<FooterOne>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterOne]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterOne);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
