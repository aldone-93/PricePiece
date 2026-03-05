import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Products } from '../../shared/services/products';
import { ProductCard } from '../home-page/components/product-card/product-card';
import { SingleProductDialog } from '../home-page/single-product-dialog/single-product-dialog';
import { CardInfo } from '../../shared/models/products.model';

@Component({
  selector: 'app-image-search',
  imports: [CommonModule, ProductCard, SingleProductDialog],
  templateUrl: './image-search.html',
  styleUrl: './image-search.scss',
})
export class ImageSearch {
  private productsService = inject(Products);

  preview = signal<string | null>(null);
  isDragging = signal(false);
  isLoading = signal(false);
  results = signal<any[]>([]);
  error = signal<string | null>(null);
  selectedProduct = signal<CardInfo | undefined>(undefined);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.processFile(input.files[0]);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.processFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  processFile(file: File) {
    // Mostra anteprima
    const reader = new FileReader();
    reader.onload = (e) => this.preview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    // Invia al backend
    this.isLoading.set(true);
    this.results.set([]);
    this.error.set(null);

    this.productsService.searchImage(file).subscribe({
      next: (res: any) => {
        this.results.set(res.productInfo ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Errore durante la ricerca. Riprova.');
        this.isLoading.set(false);
      },
    });
  }

  reset() {
    this.preview.set(null);
    this.results.set([]);
    this.error.set(null);
  }

  openDialog(product: CardInfo) {
    this.selectedProduct.set(product);
    const popover = document.getElementById('imageSearchDialog') as any;
    popover?.showPopover();
  }

  closePopover() {
    const popover = document.getElementById('imageSearchDialog') as any;
    popover?.hidePopover();
  }
}
