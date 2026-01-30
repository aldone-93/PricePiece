import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Prices } from '../../../shared/services/prices';
import { CurrencyPipe, DatePipe } from '@angular/common';
import Chart from 'chart.js/auto';
import { CardInfo } from '../../../shared/models/products.model';
import { productInfo } from '../../../shared/models/prices.model';

const CHARTS = ['low', 'avg', 'avg7', 'trend'];
@Component({
  selector: 'app-single-product-dialog',
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './single-product-dialog.html',
  styleUrl: './single-product-dialog.scss',
})
export class SingleProductDialog {
  product = input.required<productInfo | undefined>();
  priceService = inject(Prices);

  private charts: { [key: string]: Chart } = {};
  page = signal(1);

  priceHistoryMap = computed(() =>
    this.getPricesHistory?.value()?.map((price) => {
      return {
        timestamp: new Date(price.timestamp).toLocaleDateString(),
        avg: price.avg,
        avg7: price.avg7,
        low: price.low,
        trend: price.trend,
      };
    }),
  );

  getPricesHistory = rxResource({
    params: () => ({
      page: this.page(),
      pageSize: 10,
      idProduct: this.product()?.idProduct,
    }),
    stream: ({ params }) => this.priceService.getPricesHistory(params),
  });

  constructor() {
    effect(() => {
      const priceData = this.priceHistoryMap();

      if (priceData && priceData.length > 0) {
        CHARTS.forEach((chartId) => {
          if (this.charts[chartId]) {
            this.updateChart(
              chartId,
              priceData.map((p) => p[chartId as keyof typeof p] as number),
            );
          } else {
            this.createCharts(
              chartId,
              priceData.map((p) => p[chartId as keyof typeof p] as number),
            );
          }
        });
      }
    });
  }

  updateChart(key: string, data: number[]) {
    const chart = this.charts[key];
    if (chart) {
      chart.data.datasets[0].data = data;
      chart.update();
    }
  }

  createCharts(id: string, priceData: number[]) {
    this.charts[id] = new Chart(id, {
      type: 'line',
      data: {
        labels: this.priceHistoryMap()?.map((entry) => entry.timestamp),
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
}
