import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PriceResponse, PricesBodyRequest } from '../models/prices.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Prices {
  readonly httpClient = inject(HttpClient);

  getPrices(body?: PricesBodyRequest) {
    return this.httpClient
      .get<PriceResponse>('/api/prices', {
        params: { ...body },
      })
      .pipe(map((res: PriceResponse) => res.data));
  }
}
