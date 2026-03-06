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
  getSealedProducts(body?: ProductBodyRequest) {
    return this.httpClient
      .get<ProductResponse>(environment.API_URL + 'sealedProducts', {
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

  getCodes() {
    return this.httpClient.get(environment.API_URL + 'getDistinctCodes').pipe(
      // Map the response to extract the products array
      map((response: any) => response.categories),
    );
  }

  getBlueprint(code: string) {
    return this.httpClient.get(environment.API_URL + `blueprints/${code}`).pipe(
      // Map the response to extract the products array
      map((response: any) => response),
    );
  }

  getProductsWithBlueprints(body?: ProductBodyRequest) {
    return this.httpClient
      .get<ProductResponse>(environment.API_URL + 'productsWithBlueprint', {
        params: { ...body },
      })
      .pipe(map((response) => response.data));
  }

  getProductsWithBlueprintsRaw(body?: ProductBodyRequest) {
    return this.httpClient.get<ProductResponse>(environment.API_URL + 'productsWithBlueprint', {
      params: { ...body },
    });
  }

  getTypes() {
    return this.httpClient
      .get<string[]>(environment.API_URL + 'types')
      .pipe(map((response) => response));
  }

  getArtists() {
    return this.httpClient
      .get<any>(environment.API_URL + 'artists')
      .pipe(
        map(
          (response) =>
            (Array.isArray(response)
              ? response
              : (response.artists ?? response.data ?? [])) as string[],
        ),
      );
  }

  searchImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.httpClient.post<{ data: any[] }>(environment.API_URL + 'searchImage', formData);
  }
}
