import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

const blue = [
  'On Play',
  'Active: Main',
  'When Attacking',
  'Activate: Main',
  'End of Your Turn',
  "Opponent's Turn",
  'On Block',
  'Main',
  'Your Turn',
  "On Your Opponent's Attack",
  'On K.O.',
];

const pink = ['Once Per Turn'];

const black = ['DON!! x2', 'DON!! x3', 'DON!! x1'];

const orange = ['Rush', 'Banish', 'Blocker', 'Double Attack'];
const red = ['Counter'];
const yellow = ['Trigger'];

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

  getChipColor(effect: string): string {
    if (blue.includes(effect)) return 'blue';
    if (pink.includes(effect)) return 'pink';
    if (black.includes(effect)) return 'black';
    if (orange.includes(effect)) return 'orange';
    if (red.includes(effect)) return 'red';
    if (yellow.includes(effect)) return 'yellow';
    return 'default';
  }
}
