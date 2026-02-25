import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chips } from './chips';

describe('Chips', () => {
  let component: Chips;
  let fixture: ComponentFixture<Chips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chips]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chips);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
