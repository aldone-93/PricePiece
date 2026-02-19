import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Expansions } from '../../shared/services/expansions';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { Products } from '../../shared/services/products';
import { form, FormField } from '@angular/forms/signals';
import { Prices } from '../../shared/services/prices';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { min } from 'rxjs';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { SingleProductDialog } from './single-product-dialog/single-product-dialog';
import { CardInfo } from '../../shared/models/products.model';
import { productInfo } from '../../shared/models/prices.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home-page',
  imports: [
    MatSelectModule,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    DecimalPipe,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    SingleProductDialog,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly expansionsService = inject(Expansions);
  private readonly productService = inject(Products);

  selectedProduct = signal<CardInfo | undefined>(undefined);

  page = signal(1);
  pageSize = 50;
  filterSignal = signal({
    expansion: 0,
    minPrice: 5,
    maxPrice: '',
    sort: 'minEuDiff',
  });

  filtersForm = form(this.filterSignal);

  expansions = toSignal(this.expansionsService.getAllExpansions(), { initialValue: [] });

  getTopMovers = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: 10,
      minPrice: this.filtersForm.minPrice().value(),
      maxPrice: this.filtersForm.maxPrice().value(),
      sort: this.filtersForm.sort().value(),
      ...(this.filtersForm.expansion().value() !== 0 && {
        expansion: this.filtersForm.expansion().value(),
      }),
    }),
    stream: ({ params }) => this.productService.getProducts(params),
  });

  getTopMoversSet = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: this.pageSize,
    }),
    stream: ({ params }) => this.productService.getExpansionsSummary(),
  });
}
