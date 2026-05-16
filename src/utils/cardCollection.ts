// Shared utility for tracking which cards have been played
// Used by CollectionScreen and balance.ts

const _playedCards: Set<string> = new Set();

export function markCardPlayed(cardId: string) {
  _playedCards.add(cardId);
}

export function getPlayedCards(): Set<string> {
  return _playedCards;
}

export function isCardPlayed(cardId: string): boolean {
  return _playedCards.has(cardId);
}

export function resetPlayedCards() {
  _playedCards.clear();
}
