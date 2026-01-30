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

@Component({
  selector: 'app-home-page',
  imports: [
    MatSelectModule,
    FormField,
    MatFormFieldModule,
    MatInputModule,
    DecimalPipe,
    CurrencyPipe,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly expansionsService = inject(Expansions);
  private readonly priceService = inject(Prices);

  page = signal(1);
  pageSize = 50;
  filterSignal = signal({
    expansion: 0,
    minPrice: 5,
    maxPrice: '',
    sort: 'priceDelta',
  });

  filtersForm = form(this.filterSignal);

  expansions = toSignal(this.expansionsService.getAllExpansions(), { initialValue: [] });

  getTopMovers = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: 10,
      minPrice: this.filtersForm.minPrice().value(),
      maxPrice: this.filtersForm.maxPrice().value(),
      expansion: this.filtersForm.expansion().value(),
      sort: this.filtersForm.sort().value(),
    }),
    stream: ({ params }) => this.priceService.getPrices(params),
  });
}
