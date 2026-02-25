/**
 * Costanti per i colori degli effetti delle carte One Piece
 */

export const BLUE_EFFECTS = [
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
] as const;

export const PINK_EFFECTS = ['Once Per Turn'] as const;

export const BLACK_EFFECTS = ['DON!! x2', 'DON!! x3', 'DON!! x1'] as const;

export const ORANGE_EFFECTS = ['Rush', 'Banish', 'Blocker', 'Double Attack'] as const;

export const RED_EFFECTS = ['Counter'] as const;

export const YELLOW_EFFECTS = ['Trigger'] as const;

/**
 * Mappa degli effetti per colore
 */
export const EFFECT_COLORS = {
  blue: BLUE_EFFECTS,
  pink: PINK_EFFECTS,
  black: BLACK_EFFECTS,
  orange: ORANGE_EFFECTS,
  red: RED_EFFECTS,
  yellow: YELLOW_EFFECTS,
} as const;

/**
 * Tutti gli effetti disponibili
 */
export const ALL_EFFECTS = [
  ...BLUE_EFFECTS,
  ...PINK_EFFECTS,
  ...BLACK_EFFECTS,
  ...ORANGE_EFFECTS,
  ...RED_EFFECTS,
  ...YELLOW_EFFECTS,
] as const;

/**
 * Type helper per gli effetti
 */
export type EffectColor = 'blue' | 'pink' | 'black' | 'orange' | 'red' | 'yellow' | 'default';
export type Effect = (typeof ALL_EFFECTS)[number];
