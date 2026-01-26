import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PriceResponse } from '../models/prices.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Prices {
  readonly httpClient = inject(HttpClient);

  getPrices() {
    return this.httpClient
      .get<PriceResponse>('/api/prices')
      .pipe(map((res: PriceResponse) => res.data));
  }
}
