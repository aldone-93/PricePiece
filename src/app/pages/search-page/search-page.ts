import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { Products } from '../../shared/services/products';
import { ProductBodyRequest } from '../../shared/models/products.model';
import { FormsModule } from '@angular/forms';
import { ProductCard } from '../home-page/components/product-card/product-card';
import { SkeletonProducts } from '../home-page/components/skeleton-products/skeleton-products';

@Component({
  selector: 'app-search-page',
  imports: [FormsModule, ProductCard, SkeletonProducts],
  templateUrl: './search-page.html',
  styleUrls: ['./search-page.scss'],
})
export class SearchPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(Products);

  // Filtri di ricerca
  searchFilters = signal<ProductBodyRequest>({});

  // Form fields
  name = signal('');
  color = signal('');
  type = signal('');
  expansion = signal('');
  rarity = signal('');

  constructor() {
    // Leggi i query params all'inizializzazione
    effect(
      () => {
        this.route.queryParams.subscribe((params) => {
          this.name.set(params['name'] || '');
          this.color.set(params['color'] || '');
          this.type.set(params['type'] || '');
          this.expansion.set(params['expansion'] || '');
          this.rarity.set(params['rarity'] || '');

          this.updateFilters();
        });
      },
      { allowSignalWrites: true },
    );
  }

  // Resource per caricare i prodotti
  searchResults = rxResource({
    params: () => this.searchFilters(),
    stream: (params) => this.productsService.getProducts(),
  });

  updateFilters() {
    const filters: any = {};

    if (this.name()) filters.name = this.name();
    if (this.color()) filters.color = this.color();
    if (this.type()) filters.type = this.type();
    if (this.expansion()) filters.expansion = this.expansion();
    if (this.rarity()) filters.rarity = this.rarity();

    this.searchFilters.set(filters);
  }

  onSearch() {
    // Aggiorna i query params nella URL
    const queryParams: any = {};

    if (this.name()) queryParams.name = this.name();
    if (this.color()) queryParams.color = this.color();
    if (this.type()) queryParams.type = this.type();
    if (this.expansion()) queryParams.expansion = this.expansion();
    if (this.rarity()) queryParams.rarity = this.rarity();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  clearFilters() {
    this.name.set('');
    this.color.set('');
    this.type.set('');
    this.expansion.set('');
    this.rarity.set('');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }
}
