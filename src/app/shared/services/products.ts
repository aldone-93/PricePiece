import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProductBodyRequest, ProductResponse } from '../models/products.model';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Products {
  httpClient = inject(HttpClient);

  getProducts(body?: ProductBodyRequest) {
    return this.httpClient
      .get<ProductResponse>(environment.API_URL + 'products', {
        params: { ...body },
      })
      .pipe(
        // Map the response to extract the products array
        map((response) => response.data),
      );
  }

  getExpansionsSummary() {
    return this.httpClient.get(environment.API_URL + 'expansions/summary').pipe(
      // Map the response to extract the products array
      map((response: any) => response.summary),
    );
  }
}
