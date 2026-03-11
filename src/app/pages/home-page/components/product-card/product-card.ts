import { CommonModule } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss'],
})
export class ProductCard {
  id = input.required<number>();
  name = input.required<string>();
  diff = input<number>();
  minIta = input<number>();
  minEu = input<number>();
  ctrader_id = input<number>();

  cardClick = output<void>();

  imageLoaded = signal(false);

  onCardClick() {
    this.cardClick.emit();
  }
}
