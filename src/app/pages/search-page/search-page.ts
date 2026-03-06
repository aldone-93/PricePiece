import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { Products } from '../../shared/services/products';
import { CardInfo, ProductBodyRequest, ProductResponse } from '../../shared/models/products.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductCard } from '../home-page/components/product-card/product-card';
import { SkeletonProducts } from '../home-page/components/skeleton-products/skeleton-products';
import { SingleProductDialog } from '../home-page/single-product-dialog/single-product-dialog';
import { debounce, form } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { CARD_COLORS } from '../../shared/models/card-colors.constants';
import { SetSelector } from '../set-selector/set-selector';
import { Pagination } from '../../shared/components/pagination/pagination';

interface formData {
  name: string;
  color: string[];
  type: string;
  expansion: string;
  rarity: string;
  artist: string;
}

@Component({
  selector: 'app-search-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SingleProductDialog,
    FormField,
    ProductCard,
    SetSelector,
    Pagination,
    SkeletonProducts,
  ],
  templateUrl: './search-page.html',
  styleUrls: ['./search-page.scss'],
})
export class SearchPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(Products);

  // Colori disponibili
  cardColors = CARD_COLORS;

  // Rarità disponibili
  rarities = ['Leader', 'Common', 'Uncommon', 'Rare', 'Super Rare', 'Secret Rare', 'Promo'];

  // Filtri di ricerca
  selectedProduct = signal<CardInfo | undefined>(undefined);

  // Form fields
  formData = signal<formData>({
    name: '',
    color: [],
    type: '',
    expansion: '',
    rarity: '',
    artist: '',
  });

  searchForm = form(this.formData, (schema) => {
    debounce(schema.name, 500);
  });

  toggleColor(colorValue: string) {
    const currentColors = this.searchForm.color().value();
    // Se il colore è già selezionato, rimuovilo
    if (currentColors.includes(colorValue)) {
      const newColors = currentColors.filter((c) => c !== colorValue);
      this.searchForm.color().setControlValue(newColors);
    } else {
      // Aggiungi il colore alla lista
      this.searchForm.color().setControlValue([...currentColors, colorValue]);
    }
  }

  isColorSelected(colorValue: string): boolean {
    return this.searchForm.color().value().includes(colorValue);
  }

  // Pagina corrente
  currentPage = signal(1);

  // Resource per caricare i prodotti
  searchResults = rxResource({
    params: () => ({ ...this.formData(), page: this.currentPage() }),
    stream: ({ params }) =>
      this.productsService.getProductsWithBlueprintsRaw(params as ProductBodyRequest),
  });

  pagination = computed(() => this.searchResults.value()?.pagination);
  products = computed(() => this.searchResults.value()?.data ?? []);

  onPageChange(page: number) {
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Resource per caricare i tipi disponibili
  typesResource = rxResource({
    stream: () => this.productsService.getTypes(),
  });

  // Resource per caricare gli artisti disponibili
  artistsResource = rxResource({
    stream: () => this.productsService.getArtists(),
  });

  clearFilters() {
    this.currentPage.set(1);
    this.formData.set({
      name: '',
      color: [],
      type: '',
      expansion: '',
      rarity: '',
      artist: '',
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  openSingleProductDialog(product: any) {
    const foundProduct = product.product.find((p: any) => p.idProduct === product.idProduct);
    this.selectedProduct.set(foundProduct);

    const popover = document.getElementById('singleProductDialog') as any;
    if (popover && popover.showPopover) {
      popover.showPopover();
    }
  }

  closePopover() {
    const popover = document.getElementById('singleProductDialog') as any;
    popover?.hidePopover();
  }
}
