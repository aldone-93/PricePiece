import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkeletonProducts } from './skeleton-products';

describe('SkeletonProducts', () => {
  let component: SkeletonProducts;
  let fixture: ComponentFixture<SkeletonProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkeletonProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
