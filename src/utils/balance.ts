export const balance = {
  cardStats: {} as Record<string, { played: number; wins: number }>,
  recordPlay(cardId: string) {
    if (!this.cardStats[cardId]) this.cardStats[cardId] = { played: 0, wins: 0 };
    this.cardStats[cardId].played++;
  },
  recordWin(cardId: string) {
    if (!this.cardStats[cardId]) this.cardStats[cardId] = { played: 1, wins: 0 };
    this.cardStats[cardId].wins++;
  },
  getReport() {
    const entries = Object.entries(this.cardStats);
    entries.sort((a, b) => b[1].wins / Math.max(b[1].played, 1) - a[1].wins / Math.max(a[1].played, 1));
    return entries.map(([id, stats]) => ({
      card: id,
      played: stats.played,
      winRate: Math.round((stats.wins / Math.max(stats.played, 1)) * 100),
    }));
  },
};
