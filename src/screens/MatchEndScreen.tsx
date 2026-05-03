import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";

export default function MatchEndScreen({ navigation, route }: any) {
  const { winner, myId, eloChange } = route.params || {};
  const isWinner = winner === myId;
  const eloDiff = eloChange || 0;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { color: isWinner ? "#10B981" : "#EF4444" }]}>
        {isWinner ? "🎉 VICTORY!" : "😢 DEFEAT"}
      </Text>
      <Text style={[styles.eloText, { color: isWinner ? "#10B981" : "#EF4444" }]}>
        {isWinner ? "+" : ""}
        {eloDiff} ELO
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Lobby")}
        >
          <Text style={styles.buttonText}>Play Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Main Menu</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    marginBottom: 16,
  },
  eloText: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 60,
  },
  buttonRow: {
    width: "80%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "#6B21A8",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
  },
  buttonText: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "600",
  },
});
