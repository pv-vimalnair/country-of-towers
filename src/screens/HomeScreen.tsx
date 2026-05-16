// HomeScreen — Main menu
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Card from "../components/Card";
import cardsData from "../data/cards.json";

const sampleCards = [
  cardsData.catapult,
  cardsData.dragon_eye,
  cardsData.goblin_army,
  cardsData.lucky_coin,
  cardsData.pegasus_rider,
  cardsData.quartz,
];

export default function HomeScreen({ navigation }: any) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleArea}>
        <Text style={styles.title}>Country of Towers</Text>
        <Text style={styles.subtitle}>Real-time 1v1 Card Battles</Text>
      </View>

      {/* Card preview — sample hand */}
      <View style={styles.cardPreview}>
        <Text style={styles.sectionLabel}>Sample Cards</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handRow}
        >
          {sampleCards.map((card, i) => (
            <Card
              key={card.id}
              cardId={card.id}
              name={card.name}
              color={card.color as "red" | "blue" | "green"}
              cost={card.cost}
              description={card.description}
              selected={selectedIndex === i}
              onPress={() =>
                setSelectedIndex(selectedIndex === i ? null : i)
              }
              style={{ marginRight: i < sampleCards.length - 1 ? -20 : 0 }}
            />
          ))}
        </ScrollView>
        <Text style={styles.tapHint}>Tap a card to select it</Text>
      </View>

      <View style={styles.menuArea}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Lobby")}
        >
          <Text style={styles.buttonText}>Play Online</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate("Collection")}
        >
          <Text style={styles.buttonText}>Card Collection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate("Leaderboard")}
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>v1.0.0</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  titleArea: {
    alignItems: "center",
    marginBottom: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#F8FAFC",
    fontFamily: "ClashDisplay",
  },
  subtitle: {
    fontSize: 16,
    color: "#94A3B8",
    marginTop: 8,
  },
  menuArea: {
    width: "80%",
    gap: 16,
  },
  button: {
    backgroundColor: "#6B21A8",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
  },
  buttonText: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "600",
  },
  version: {
    position: "absolute",
    bottom: 40,
    color: "#475569",
    fontSize: 12,
  },
  cardPreview: {
    alignItems: "center",
    marginBottom: 40,
    width: "100%",
  },
  sectionLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  handRow: {
    paddingHorizontal: 24,
    alignItems: "flex-end",
    height: 180,
  },
  tapHint: {
    fontSize: 12,
    color: "#475569",
    marginTop: 12,
  },
});
