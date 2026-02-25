import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { PriceResponse, PricesBodyRequest } from '../models/prices.model';
import { catchError, map, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ProductCard } from '../../pages/home-page/components/product-card/product-card';

@Injectable({
  providedIn: 'root',
})
export class Variants {
  readonly httpClient = inject(HttpClient);

  private readonly platformId = inject(PLATFORM_ID);

  getVariants(name: string) {
    if (!isPlatformBrowser(this.platformId)) {
      // Evita la chiamata HTTP durante il prerendering
      return of([]);
    }

    return this.httpClient.get(`${environment.API_URL}variants/${name}`).pipe(
      map((res: any) => res),
      catchError((error) => {
        console.error('Error fetching prices:', error);
        return of([]); // Restituisci un array vuoto in caso di errore
      }),
    );
  }
}
