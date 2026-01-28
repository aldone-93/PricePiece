import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Expansions } from '../../shared/services/expansions';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { Products } from '../../shared/services/products';
import { form, FormField } from '@angular/forms/signals';
import { Prices } from '../../shared/services/prices';
import { MatFormFieldModule } from '@angular/material/form-field';
import { min } from 'rxjs';

@Component({
  selector: 'app-home-page',
  imports: [MatSelectModule, FormField, MatFormFieldModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly expansionsService = inject(Expansions);
  private readonly productsService = inject(Products);
  private readonly priceService = inject(Prices);

  page = signal(1);
  pageSize = 50;
  filterSignal = signal({
    expansion: 0,
    minPrice: 0,
    maxPrice: '',
  });

  filtersForm = form(this.filterSignal);

  expansions = toSignal(this.expansionsService.getAllExpansions(), { initialValue: [] });

  getProducts = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: this.pageSize,
      expansion: this.filtersForm.expansion().value(),
    }),
    stream: ({ params }) => this.productsService.getProducts(params),
  });

  getTopMovers = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: 10,
      minPrice: this.filtersForm.minPrice().value(),
      maxPrice: this.filtersForm.maxPrice().value(),
    }),
    stream: ({ params }) => this.priceService.getPrices(params),
  });
}
