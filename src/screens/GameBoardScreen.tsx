import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useGameRoom } from "../hooks/useGameRoom";
import Card from "../components/Card";
import cardsData from "../data/cards.json";
import { playSound } from "../utils/sound";
import { perf } from "../utils/perf";
import { analytics } from "../utils/analytics";
import { balance } from "../utils/balance";

export default function GameBoardScreen({ navigation }: any) {
  const { room, playCard, discardCard } = useGameRoom();
  const [tick, setTick] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [flyingCard, setFlyingCard] = useState<any>(null);

  // Animation values
  const flyY = useRef(new Animated.Value(0)).current;
  const flyScale = useRef(new Animated.Value(1)).current;
  const flyOpacity = useRef(new Animated.Value(1)).current;
  const wallFlashAnim = useRef(new Animated.Value(0)).current;
  const towerShakeAnim = useRef(new Animated.Value(0)).current;
  const victoryScaleAnim = useRef(new Animated.Value(1)).current;
  const timerPulseAnim = useRef(new Animated.Value(1)).current;
  const turnFlashAnim = useRef(new Animated.Value(1)).current;

  // Previous values for change detection
  const prevOpponentWall = useRef<number | null>(null);
  const prevOpponentTower = useRef<number | null>(null);
  const prevIsMyTurn = useRef<boolean>(false);
  const prevWinnerId = useRef<string | null>(null);

  // Listen to Colyseus state changes + broadcast messages
  useEffect(() => {
    if (!room) return;
    let mounted = true;
    const forceUpdate = () => {
      if (mounted) setTick((t) => t + 1);
    };

    let unsubAdd: (() => boolean) | null = null;
    let unsubRemove: (() => boolean) | null = null;
    let unsubChange: (() => boolean) | null = null;

    const setup = (state: any) => {
      if (!mounted) return;
      perf.start("stateSync");
      unsubAdd = state.players.onAdd(forceUpdate, true);
      unsubRemove = state.players.onRemove(forceUpdate);
      unsubChange = state.players.onChange(forceUpdate);
      forceUpdate();
      perf.end("stateSync");
    };

    if (room.state) {
      setup(room.state);
    } else {
      room.onStateChange.once(setup);
    }

    room.onError.once((code, message) => {
      if (mounted) setConnectionError("⚠️ Connection lost. Reconnecting...");
    });

    room.onMessage("player_disconnected", () => {
      if (mounted) showToast("Opponent disconnected — 60s to reconnect");
    });
    room.onMessage("player_reconnected", () => {
      if (mounted) showToast("Opponent reconnected");
    });

    room.onMessage("game_over", (data: any) => {
      if (!mounted) return;
      const myId = room.sessionId;
      const winner = data.winner || data.winnerId;
      const eloChanges = data.eloChanges || {};
      const myOldElo = room.state?.players?.get(myId)?.elo || 1000;
      const myNewElo = eloChanges[myId] || myOldElo;
      const eloChange = myNewElo - myOldElo;
      const isWinner = winner === myId;
      analytics.logMatchEnd(isWinner, myNewElo);
      setTimeout(() => {
        if (mounted) {
          navigation.navigate("MatchEnd", { winner, myId, eloChange });
        }
      }, 2000);
    });

    return () => {
      mounted = false;
      unsubAdd?.();
      unsubRemove?.();
      unsubChange?.();
    };
  }, [room]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  function triggerWallFlash() {
    wallFlashAnim.setValue(0);
    Animated.sequence([
      Animated.timing(wallFlashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(wallFlashAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(wallFlashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(wallFlashAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(wallFlashAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(wallFlashAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
  }

  function triggerTowerShake() {
    towerShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(towerShakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(towerShakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(towerShakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(towerShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  function triggerVictoryPulse() {
    victoryScaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(victoryScaleAnim, { toValue: 1.5, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(victoryScaleAnim, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.in(Easing.ease) }),
    ]).start();
  }

  function triggerTurnFlash() {
    turnFlashAnim.setValue(0);
    Animated.sequence([
      Animated.timing(turnFlashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(turnFlashAnim, { toValue: 0.5, duration: 100, useNativeDriver: true }),
      Animated.timing(turnFlashAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }

  // Timer tick to force re-render every second
  const [timerTick, setTimerTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTimerTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Derive game state safely
  const state = room?.state as any;
  const sessionId = room?.sessionId || "";
  const players = state ? (Array.from(state.players.entries()) as [string, any][]) : [];
  const me = state?.players?.get(sessionId);
  const opponentEntry = players.find(([id]) => id !== sessionId);
  const opponent = opponentEntry ? opponentEntry[1] : null;
  const isMyTurn = state?.currentPlayerId === sessionId;
  const timeElapsed = state ? Math.floor((Date.now() - state.turnStartTime) / 1000) : 0;
  const timeRemaining = Math.max(0, 30 - timeElapsed);

  // Detect opponent damage
  useEffect(() => {
    if (!opponent) return;
    if (prevOpponentWall.current !== null && opponent.wall < prevOpponentWall.current) {
      triggerWallFlash();
      playSound("damage");
    }
    prevOpponentWall.current = opponent.wall;

    if (prevOpponentTower.current !== null && opponent.tower < prevOpponentTower.current) {
      triggerTowerShake();
      playSound("damage");
    }
    prevOpponentTower.current = opponent.tower;
  }, [opponent?.wall, opponent?.tower]);

  // Detect turn change
  useEffect(() => {
    if (!prevIsMyTurn.current && isMyTurn) {
      triggerTurnFlash();
    }
    prevIsMyTurn.current = isMyTurn;
  }, [isMyTurn]);

  // Detect victory / defeat
  useEffect(() => {
    if (state?.winnerId === sessionId && prevWinnerId.current !== state?.winnerId) {
      triggerVictoryPulse();
      playSound("victory");
    } else if (state?.winnerId && state?.winnerId !== sessionId && prevWinnerId.current !== state?.winnerId) {
      playSound("defeat");
    }
    prevWinnerId.current = state?.winnerId || null;
  }, [state?.winnerId]);

  // Timer pulse
  useEffect(() => {
    if (timeRemaining <= 5 && isMyTurn && !state?.winnerId) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timerPulseAnim, { toValue: 1.05, duration: 200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
          Animated.timing(timerPulseAnim, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        ])
      ).start();
    } else {
      timerPulseAnim.setValue(1);
    }
  }, [timeRemaining, isMyTurn, state?.winnerId]);

  // Early returns after all hooks
  if (!room || !room.state) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Connecting to game...</Text>
      </SafeAreaView>
    );
  }

  if (players.length < 2) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Waiting for opponent...</Text>
      </SafeAreaView>
    );
  }

  if (!me || !opponent) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading players...</Text>
      </SafeAreaView>
    );
  }

  const handlePlay = () => {
    if (selectedIndex === null) return;
    const cardId = me.hand[selectedIndex];
    const card = (cardsData as Record<string, any>)[cardId];
    if (!card) return;

    setFlyingCard(card);
    playSound("cardPlay");
    analytics.logCardPlayed(cardId);
    balance.recordPlay(cardId);
    playCard(selectedIndex);
    setSelectedIndex(null);

    flyY.setValue(0);
    flyScale.setValue(1);
    flyOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(flyY, { toValue: -250, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(flyScale, { toValue: 0, duration: 500, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
      Animated.timing(flyOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      setFlyingCard(null);
    });
  };

  const handleDiscard = () => {
    if (selectedIndex === null) return;
    discardCard(selectedIndex);
    setSelectedIndex(null);
  };

  const canAfford = (card: any) => {
    if (!isMyTurn) return false;
    const cost = card.cost || {};
    if (cost.ore && me.ore < cost.ore) return false;
    if (cost.mana && me.mana < cost.mana) return false;
    if (cost.troops && me.troops < cost.troops) return false;
    return true;
  };

  const missingResource = (card: any): string | null => {
    const cost = card.cost || {};
    if (cost.ore && me.ore < cost.ore) return `Need ${cost.ore} Ore`;
    if (cost.mana && me.mana < cost.mana) return `Need ${cost.mana} Mana`;
    if (cost.troops && me.troops < cost.troops) return `Need ${cost.troops} Troops`;
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Connection error banner */}
      {connectionError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{connectionError}</Text>
        </View>
      )}

      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* Flying card */}
      {flyingCard && (
        <Animated.View
          style={[
            styles.flyCard,
            {
              transform: [{ translateY: flyY }, { scale: flyScale }],
              opacity: flyOpacity,
              borderColor:
                flyingCard.color === "red"
                  ? "#DC2626"
                  : flyingCard.color === "blue"
                  ? "#3B82F6"
                  : "#10B981",
            },
          ]}
        >
          <Text style={styles.flyCardName}>{flyingCard.name}</Text>
        </Animated.View>
      )}

      {/* Opponent */}
      <View style={styles.opponentArea}>
        <Text style={styles.playerName}>
          {opponent.username || "Opponent"}
        </Text>
        <View style={styles.statsRow}>
          <Stat label="Tower" value={opponent.tower} color="#F59E0B" shakeAnim={towerShakeAnim} />
          <View style={{ position: "relative" }}>
            <Stat label="Wall" value={opponent.wall} color="#3B82F6" />
            <Animated.Text
              style={[
                StyleSheet.absoluteFill,
                styles.statValue,
                { color: "#DC2626", opacity: wallFlashAnim, textAlign: "center" },
              ]}
            >
              {opponent.wall}
            </Animated.Text>
          </View>
          <Stat label="Ore" value={opponent.ore} color="#FCA5A5" />
          <Stat label="Mana" value={opponent.mana} color="#93C5FD" />
          <Stat label="Troops" value={opponent.troops} color="#6EE7B7" />
        </View>
      </View>

      {/* Turn Info */}
      <View style={styles.turnArea}>
        <Animated.Text style={[styles.turnText, { opacity: turnFlashAnim }]}>
          {isMyTurn ? "Your Turn" : "Opponent's Turn"}
        </Animated.Text>
        <Animated.View style={{ transform: [{ scale: timerPulseAnim }] }}>
          <Text style={[
            styles.timerText,
            timeRemaining <= 5 && isMyTurn ? { color: "#EF4444" } : {},
          ]}>
            {timeRemaining}s
          </Text>
        </Animated.View>
        <Text style={styles.turnNumber}>Turn {state.turnNumber}</Text>
        {state.winnerId ? (
          <Text style={styles.winnerText}>
            {state.winnerId === sessionId ? "You Win! 🎉" : "You Lose 😢"}
          </Text>
        ) : null}
      </View>

      {/* Player */}
      <View style={styles.playerArea}>
        <Text style={styles.playerName}>{me.username || "You"}</Text>
        <View style={styles.statsRow}>
          <Stat
            label="Tower"
            value={me.tower}
            color="#F59E0B"
            scaleAnim={state.winnerId === sessionId ? victoryScaleAnim : undefined}
          />
          <Stat label="Wall" value={me.wall} color="#3B82F6" />
          <Stat label="Ore" value={me.ore} color="#FCA5A5" />
          <Stat label="Mana" value={me.mana} color="#93C5FD" />
          <Stat label="Troops" value={me.troops} color="#6EE7B7" />
        </View>
      </View>

      {/* Hand */}
      <View style={styles.handArea}>
        <Text style={styles.handLabel}>Your Hand</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handScroll}
        >
          {me.hand.map((cardId: string, i: number) => {
            const card = (cardsData as Record<string, any>)[cardId];
            if (!card) return null;
            const affordable = canAfford(card);
            const missing = missingResource(card);
            return (
              <View key={`${cardId}-${i}`} style={{ position: "relative" }}>
                <Card
                  cardId={cardId}
                  name={card.name}
                  color={card.color as "red" | "blue" | "green"}
                  cost={card.cost}
                  description={card.description}
                  selected={selectedIndex === i}
                  onPress={() =>
                    setSelectedIndex(selectedIndex === i ? null : i)
                  }
                  disabled={!affordable}
                  style={{
                    marginRight: i < me.hand.length - 1 ? -20 : 0,
                  }}
                />
                {missing && (
                  <View style={styles.missingOverlay}>
                    <Text style={styles.missingText}>{missing}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Actions */}
      {selectedIndex !== null && isMyTurn && !state.winnerId && (
        <View style={styles.actionArea}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={handlePlay}
          >
            <Text style={styles.actionButtonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.discardButton]}
            onPress={handleDiscard}
          >
            <Text style={styles.actionButtonText}>Discard</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
  color,
  shakeAnim,
  scaleAnim,
}: {
  label: string;
  value: number;
  color: string;
  shakeAnim?: Animated.Value;
  scaleAnim?: Animated.Value;
}) {
  const style: any = { color };
  if (shakeAnim) {
    style.transform = [{ translateX: shakeAnim }];
  }
  if (scaleAnim) {
    style.transform = [{ scale: scaleAnim }];
  }
  return (
    <View style={styles.statBox}>
      <Animated.Text style={[styles.statValue, style]}>{value}</Animated.Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 16,
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 18,
    textAlign: "center",
    marginTop: 100,
  },
  errorBanner: {
    position: "absolute",
    top: 50,
    left: 24,
    right: 24,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    borderRadius: 12,
    padding: 12,
    zIndex: 200,
    alignItems: "center",
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  toast: {
    position: "absolute",
    top: 50,
    left: 24,
    right: 24,
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 12,
    padding: 12,
    zIndex: 100,
    alignItems: "center",
  },
  toastText: {
    color: "#F59E0B",
    fontSize: 14,
    fontWeight: "600",
  },
  flyCard: {
    position: "absolute",
    bottom: 200,
    alignSelf: "center",
    width: 120,
    height: 170,
    backgroundColor: "#1E293B",
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },
  flyCardName: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    padding: 8,
  },
  opponentArea: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  playerArea: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  turnArea: {
    alignItems: "center",
    marginBottom: 12,
  },
  turnText: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "700",
  },
  timerText: {
    color: "#F59E0B",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  turnNumber: {
    color: "#94A3B8",
    fontSize: 14,
    marginTop: 4,
  },
  winnerText: {
    color: "#10B981",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
  playerName: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 10,
    marginTop: 2,
  },
  handArea: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  handLabel: {
    color: "#94A3B8",
    fontSize: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  handScroll: {
    paddingHorizontal: 8,
    alignItems: "flex-end",
    height: 180,
  },
  missingOverlay: {
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 20,
    backgroundColor: "rgba(239, 68, 68, 0.85)",
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  missingText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
  },
  actionArea: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  playButton: {
    backgroundColor: "#6B21A8",
  },
  discardButton: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  actionButtonText: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "600",
  },
});
