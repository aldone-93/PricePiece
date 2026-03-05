import { Component, inject, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Products } from '../../shared/services/products';

interface ExpansionGroup {
  label: string;
  prefix: string;
  expansions: string[];
}

@Component({
  selector: 'app-set-selector',
  imports: [CommonModule],
  templateUrl: './set-selector.html',
  styleUrl: './set-selector.scss',
})
export class SetSelector {
  private productsService = inject(Products);

  expansionSelected = output<string>();

  expansionsResource = rxResource({
    stream: () => this.productsService.getCodes(),
  });

  get groups(): ExpansionGroup[] {
    const all: string[] = (this.expansionsResource.value() ?? []).map((e: any) =>
      typeof e === 'string' ? e : (e.expansion ?? e.code ?? String(e)),
    );

    return [
      {
        label: 'OP',
        prefix: 'OP',
        expansions: all.filter((e) => e.toUpperCase().startsWith('OP')),
      },
      {
        label: 'ST',
        prefix: 'ST',
        expansions: all.filter((e) => e.toUpperCase().startsWith('ST')),
      },
      {
        label: 'P',
        prefix: 'P',
        expansions: all.filter(
          (e) => e.toUpperCase().startsWith('P') && !e.toUpperCase().startsWith('OP'),
        ),
      },
    ];
  }

  select(expansion: string) {
    this.expansionSelected.emit(expansion);
  }
}
