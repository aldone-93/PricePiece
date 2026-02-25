import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import {
  BLUE_EFFECTS,
  PINK_EFFECTS,
  BLACK_EFFECTS,
  ORANGE_EFFECTS,
  RED_EFFECTS,
  YELLOW_EFFECTS,
  type EffectColor,
} from '../../models/effect-colors.constants';

@Component({
  selector: 'app-chips',
  imports: [CommonModule],
  templateUrl: './chips.html',
  styleUrl: './chips.scss',
})
export class Chips {
  effects = input.required<string[]>();
  trigger = input<string>();
  // Divide il testo in parti: testo normale e chip
  parsedEffects = computed(() => {
    return this.effects().map((text) => this.parseText(text));
  });

  parseText(text: string): Array<{ type: 'text' | 'chip'; content: string; color?: string }> {
    const regex = /\[([^\]]+)\]/g;
    const parts: Array<{ type: 'text' | 'chip'; content: string; color?: string }> = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Aggiungi il testo prima della chip
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }

      // Aggiungi la chip
      const effectName = match[1];
      parts.push({
        type: 'chip',
        content: effectName,
        color: this.getChipColor(effectName),
      });

      lastIndex = regex.lastIndex;
    }

    // Aggiungi il testo rimanente
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  }

  getChipColor(effect: string): EffectColor {
    if (BLUE_EFFECTS.includes(effect as any)) return 'blue';
    if (PINK_EFFECTS.includes(effect as any)) return 'pink';
    if (BLACK_EFFECTS.includes(effect as any)) return 'black';
    if (ORANGE_EFFECTS.includes(effect as any)) return 'orange';
    if (RED_EFFECTS.includes(effect as any)) return 'red';
    if (YELLOW_EFFECTS.includes(effect as any)) return 'yellow';
    return 'default';
  }
}
