import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProductBodyRequest, ProductResponse } from '../models/products.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Products {
  httpClient = inject(HttpClient);

  getProducts(body?: ProductBodyRequest) {
    return this.httpClient.get<ProductResponse>(environment.API_URL + 'api/products', {
      params: { ...body },
    });
  }
}
