import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Modal } from 'react-native';
import cardsData from '../data/cards.json';
import Card from '../components/Card';
import CardArt from '../components/CardArt';
import { colors } from '../styles/theme';
import { getPlayedCards } from '../utils/cardCollection';

interface CollectionScreenProps {
  navigation: any;
}

export default function CollectionScreen({ navigation }: CollectionScreenProps) {
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const allCards = Object.values(cardsData);
  const playedCards = getPlayedCards();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Card Collection</Text>
        <Text style={styles.subtitle}>{playedCards.size} / {allCards.length} unlocked</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {allCards.map((card: any) => {
          const isPlayed = playedCards.has(card.id);
          return (
            <TouchableOpacity
              key={card.id}
              style={[styles.cardWrapper, !isPlayed && styles.lockedCard]}
              onPress={() => setSelectedCard(card)}
              activeOpacity={0.8}
            >
              <Card
                cardId={card.id}
                name={card.name}
                color={card.color}
                cost={card.cost}
                description={card.description}
                disabled={false}
              />
              {!isPlayed && <View style={styles.lockedOverlay} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Card Detail Modal */}
      <Modal
        visible={!!selectedCard}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCard(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCard && (
              <>
                <View style={styles.modalArt}>
                  <CardArt cardId={selectedCard.id} color={selectedCard.color} size="large" />
                </View>
                <Text style={styles.modalName}>{selectedCard.name}</Text>
                <Text style={styles.modalDescription}>{selectedCard.description}</Text>
                <Text style={styles.modalFlavor}>"{selectedCard.flavor}"</Text>
                <View style={styles.modalStats}>
                  <Text style={styles.statText}>
                    Status: {playedCards.has(selectedCard.id) ? 'Unlocked' : 'Locked'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedCard(null)}
                >
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  backText: { color: colors.textSecondary, fontSize: 16 },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 8 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 12 },
  cardWrapper: { width: '33%', padding: 4, alignItems: 'center' },
  lockedCard: { opacity: 0.6 },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', width: '90%' },
  modalArt: { width: 200, height: 140, borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  modalName: { color: colors.text, fontSize: 22, fontWeight: '700' },
  modalDescription: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 },
  modalFlavor: { color: colors.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  modalStats: { marginTop: 16, padding: 12, backgroundColor: colors.bg, borderRadius: 8 },
  statText: { color: colors.textSecondary, fontSize: 14 },
  closeButton: { marginTop: 16, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 24 },
  closeText: { color: colors.text, fontSize: 16, fontWeight: '600' },
});
