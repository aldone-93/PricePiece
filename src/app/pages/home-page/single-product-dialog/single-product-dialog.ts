import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Prices } from '../../../shared/services/prices';
import { CurrencyPipe, DatePipe } from '@angular/common';
import Chart from 'chart.js/auto';
import { CardInfo } from '../../../shared/models/products.model';
import { Variants } from '../../../shared/services/variants';
import { Products } from '../../../shared/services/products';
import { Chips } from '../../../shared/components/chips/chips';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-single-product-dialog',
  imports: [MatTabsModule, CurrencyPipe, Chips],
  templateUrl: './single-product-dialog.html',
  styleUrl: './single-product-dialog.scss',
})
export class SingleProductDialog {
  product = model.required<CardInfo | undefined>();
  priceService = inject(Prices);
  variantsService = inject(Variants);
  productService = inject(Products);
  private chart: Chart | undefined = undefined;
  page = signal(1);
  loadedImages = signal<Set<string>>(new Set());

  onImageLoad(idProduct: string) {
    this.loadedImages.update((set) => {
      const newSet = new Set(set);
      newSet.add(idProduct);
      return newSet;
    });
  }

  isImageLoaded(idProduct: string): boolean {
    return this.loadedImages().has(idProduct);
  }

  getPricesHistory = rxResource({
    params: () => this.product()?.idProduct,
    stream: ({ params }) => this.priceService.getDynamicPricesHistory(params),
  });

  constructor() {
    effect(() => {
      const priceData = this.getPricesHistory?.value()?.map((p: any) => p.minEu);

      if (priceData && priceData.length > 0) {
        if (this.chart) {
          this.chart.data.datasets[0].data = priceData;
          this.chart.update();
        } else {
          this.createCharts('priceChart', priceData);
        }
      }
    });
  }

  getVariants = rxResource({
    params: () => {
      const name = this.product()?.cardCode;
      if (name === undefined) {
        return undefined;
      }
      return {
        ...(name !== undefined && { name }),
      };
    },
    stream: ({ params }) => this.variantsService.getVariants(params.name!),
  });

  getBlueprint = rxResource({
    params: () => {
      const name = this.product()?.cardCode;
      if (name === undefined) {
        return undefined;
      }
      return {
        ...(name !== undefined && { name }),
      };
    },
    stream: ({ params }) => this.productService.getBlueprint(params.name!),
  });

  createCharts(id: string, priceData: number[]) {
    this.chart = new Chart(id, {
      type: 'line',
      data: {
        labels: this.getPricesHistory
          ?.value()
          ?.map((entry: any) => new Date(entry.timestamp).toLocaleDateString()),
        datasets: [
          {
            label: 'CardMarket',
            data: priceData,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  selectVariant(product: CardInfo) {
    this.product.set(product);
  }
}
