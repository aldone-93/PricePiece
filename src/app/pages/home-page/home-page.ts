import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Expansions } from '../../shared/services/expansions';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatSelectModule } from '@angular/material/select';
import { Products } from '../../shared/services/products';
import { form, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-home-page',
  imports: [MatSelectModule, FormField],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly expansionsService = inject(Expansions);
  private readonly productsService = inject(Products);

  page = signal(1);
  pageSize = 50;
  expansion = signal({
    expansion: 0,
  });

  expansionControl = form(this.expansion);

  expansions = toSignal(this.expansionsService.getAllExpansions(), { initialValue: [] });

  getProducts = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: this.pageSize,
      expansion: this.expansionControl.expansion().value(),
    }),
    stream: ({ params }) => this.productsService.getProducts(params),
  });
}
