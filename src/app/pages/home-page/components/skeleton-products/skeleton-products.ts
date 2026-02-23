import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-products',
  imports: [],
  templateUrl: './skeleton-products.html',
  styleUrl: './skeleton-products.scss',
})
export class SkeletonProducts {
  skeletonItems = Array(5).fill(0);
}
