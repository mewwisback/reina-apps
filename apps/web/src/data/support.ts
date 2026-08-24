export interface SupportCard {
  id: string;
  name: string;
  cat: string; // effect text
  hue: string;
  rank: 'SPELL' | 'TRAP' | 'WILD';
}

export const SUPPORT_CARDS: SupportCard[] = [
  { id: 'surge', name: 'SURGE PROTOCOL', cat: "Boost one hero's ATK for the turn", hue: '#3FA8A0', rank: 'SPELL' },
  { id: 'counter', name: 'COUNTER SEAL', cat: 'Negate one incoming attack', hue: '#8C6FD8', rank: 'TRAP' },
  { id: 'supply', name: 'SUPPLY DROP', cat: 'Draw two extra cards', hue: '#3FA8A0', rank: 'SPELL' },
  { id: 'blank', name: 'BLANK CARD', cat: 'Third slot for the Legendary fusion recipe', hue: '#8C6FD8', rank: 'WILD' },
];

export const CARD_TYPES = ['HEROES', 'SPELL', 'TRAP', 'WILD'] as const;
export type CardType = (typeof CARD_TYPES)[number];