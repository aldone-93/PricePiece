import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  hasNext = input<boolean>(false);
  hasPrev = input<boolean>(false);

  pageChange = output<number>();

  // Genera i numeri di pagina da mostrare (max 5 attorno alla pagina corrente)
  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    const start = Math.max(2, current - 2);
    const end = Math.min(total - 1, current + 2);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');
    pages.push(total);
    return pages;
  });

  goTo(page: number | '...') {
    if (page === '...') return;
    this.pageChange.emit(page);
  }

  prev() {
    if (this.hasPrev()) this.pageChange.emit(this.currentPage() - 1);
  }

  next() {
    if (this.hasNext()) this.pageChange.emit(this.currentPage() + 1);
  }
}
