import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { PriceResponse, PricesBodyRequest } from '../models/prices.model';
import { catchError, map, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class Prices {
  readonly httpClient = inject(HttpClient);

  private readonly platformId = inject(PLATFORM_ID);

  getPricesHistory(body: PricesBodyRequest) {
    if (!isPlatformBrowser(this.platformId)) {
      // Evita la chiamata HTTP durante il prerendering
      return of([]);
    }

    return this.httpClient
      .get<PriceResponse>(`/api/prices/${body.idProduct}`, {
        params: { ...body },
      })
      .pipe(
        map((res: PriceResponse) => res.data),
        catchError((error) => {
          console.error('Error fetching prices:', error);
          return of([]); // Restituisci un array vuoto in caso di errore
        }),
      );
  }
  getPrices(body?: PricesBodyRequest) {
    if (!isPlatformBrowser(this.platformId)) {
      // Evita la chiamata HTTP durante il prerendering
      return of([]);
    }

    return this.httpClient
      .get<PriceResponse>('/api/prices', {
        params: { ...body },
      })
      .pipe(
        map((res: PriceResponse) => res.data),
        catchError((error) => {
          console.error('Error fetching prices:', error);
          return of([]); // Restituisci un array vuoto in caso di errore
        }),
      );
  }
}
