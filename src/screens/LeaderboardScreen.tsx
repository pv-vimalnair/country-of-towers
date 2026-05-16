import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { colors } from '../styles/theme';

interface LeaderboardEntry {
  rank: number;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface LeaderboardScreenProps {
  navigation: any;
}

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const res = await fetch('http://localhost:2567/api/leaderboard?limit=100');
      const data = await res.json();
      setEntries(data.players || []);
    } catch (e) {
      // Use mock data if server unavailable
      setEntries([
        { rank: 1, username: 'DragonSlayer', elo: 1450, wins: 42, losses: 8, winRate: 84 },
        { rank: 2, username: 'TowerKing', elo: 1380, wins: 35, losses: 12, winRate: 74 },
        { rank: 3, username: 'CardMaster', elo: 1320, wins: 28, losses: 15, winRate: 65 },
        { rank: 4, username: 'StoneGiant', elo: 1280, wins: 25, losses: 18, winRate: 58 },
        { rank: 5, username: 'WallBuilder', elo: 1240, wins: 22, losses: 20, winRate: 52 },
        { rank: 6, username: 'OrcWarrior', elo: 1200, wins: 20, losses: 22, winRate: 48 },
        { rank: 7, username: 'MageApprentice', elo: 1150, wins: 18, losses: 25, winRate: 42 },
        { rank: 8, username: 'NewPlayer', elo: 1100, wins: 15, losses: 28, winRate: 35 },
        { rank: 9, username: 'GoblinScout', elo: 1050, wins: 12, losses: 30, winRate: 29 },
        { rank: 10, username: 'TowerNovice', elo: 1000, wins: 8, losses: 35, winRate: 19 },
      ]);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top 100 Players</Text>
      </View>

      <ScrollView>
        {/* Table header */}
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headerCell, { flex: 0.5 }]}>#</Text>
          <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Player</Text>
          <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>ELO</Text>
          <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>W/L</Text>
          <Text style={[styles.cell, styles.headerCell, { flex: 0.8 }]}>WR%</Text>
        </View>

        {entries.map((entry) => (
          <View key={entry.rank} style={[styles.row, entry.rank <= 3 && styles.topRow]}>
            <Text style={[styles.cell, { flex: 0.5, color: entry.rank === 1 ? colors.gold : entry.rank === 2 ? '#C0C0C0' : entry.rank === 3 ? '#CD7F32' : colors.textSecondary }]}>
              {entry.rank === 1 ? '\u{1F451}' : entry.rank}
            </Text>
            <Text style={[styles.cell, { flex: 2, color: colors.text }]}>{entry.username}</Text>
            <Text style={[styles.cell, { flex: 1, color: colors.primary }]}>{entry.elo}</Text>
            <Text style={[styles.cell, { flex: 1, color: colors.textSecondary }]}>{entry.wins}/{entry.losses}</Text>
            <Text style={[styles.cell, { flex: 0.8, color: entry.winRate >= 60 ? colors.success : colors.textSecondary }]}>{entry.winRate}%</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { color: colors.textSecondary, fontSize: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  row: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  topRow: { backgroundColor: 'rgba(107,33,168,0.1)' },
  cell: { fontSize: 14 },
  headerCell: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
});
