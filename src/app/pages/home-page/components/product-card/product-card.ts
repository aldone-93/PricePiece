import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss'],
})
export class ProductCard {
  id = input.required<number>();
  name = input.required<string>();
  diff = input.required<number>();
  minIta = input<number>();
  minEu = input<number>();
  ctrader_id = input<number>();

  cardClick = output<void>();

  onCardClick() {
    this.cardClick.emit();
  }
}
