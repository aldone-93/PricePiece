import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { Products } from '../../shared/services/products';
import { CardInfo, ProductBodyRequest } from '../../shared/models/products.model';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductCard } from '../home-page/components/product-card/product-card';
import { SkeletonProducts } from '../home-page/components/skeleton-products/skeleton-products';
import { SingleProductDialog } from '../home-page/single-product-dialog/single-product-dialog';
import { debounce, form } from '@angular/forms/signals';
import { CommonModule } from '@angular/common';
import { FormField } from '@angular/forms/signals';
import { CARD_COLORS } from '../../shared/models/card-colors.constants';

interface formData {
  name: string;
  color: string[];
  type: string;
  expansion: string;
  rarity: string;
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

  // Filtri di ricerca
  selectedProduct = signal<CardInfo | undefined>(undefined);

  // Form fields
  formData = signal<formData>({
    name: '',
    color: [],
    type: '',
    expansion: '',
    rarity: '',
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

  // Resource per caricare i prodotti
  searchResults = rxResource({
    params: () => this.formData(),
    stream: ({ params }) =>
      this.productsService.getProductsWithBlueprints(params as ProductBodyRequest),
  });

  clearFilters() {
    this.formData.set({
      name: '',
      color: [],
      type: '',
      expansion: '',
      rarity: '',
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
    });
  }

  openSingleProductDialog(product: CardInfo) {
    this.selectedProduct.set(product);

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
