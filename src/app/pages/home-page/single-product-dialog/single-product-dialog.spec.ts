import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleProductDialog } from './single-product-dialog';

describe('SingleProductDialog', () => {
  let component: SingleProductDialog;
  let fixture: ComponentFixture<SingleProductDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleProductDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleProductDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
