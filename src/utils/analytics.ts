export const analytics = {
  logEvent: (name: string, params?: Record<string, any>) => {
    if (__DEV__) console.log(`[Analytics] ${name}`, params);
    // In production: firebase.analytics().logEvent(name, params)
  },
  logMatchStart: () => analytics.logEvent('match_start'),
  logCardPlayed: (cardId: string) => analytics.logEvent('card_played', { card_id: cardId }),
  logMatchEnd: (winner: boolean, elo: number) => analytics.logEvent('match_end', { winner, elo }),
};
