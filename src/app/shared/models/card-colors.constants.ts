/**
 * Colori delle carte One Piece TCG
 */

export const CARD_COLORS = [
  { name: 'Red', value: 'Red', hex: '#d70000' },
  { name: 'Blue', value: 'Blue', hex: '#0066cc' },
  { name: 'Green', value: 'Green', hex: '#24ec1c' },
  { name: 'Purple', value: 'Purple', hex: '#8b4789' },
  { name: 'Yellow', value: 'Yellow', hex: '#ffcd00' },
  { name: 'Black', value: 'Black', hex: '#000000' },
] as const;

export type CardColor = (typeof CARD_COLORS)[number]['value'];
