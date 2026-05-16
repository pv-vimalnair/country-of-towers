// LobbyScreen — Matchmaking queue with timeout handling
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useGameRoom } from "../hooks/useGameRoom";
import ErrorOverlay from "../components/ErrorOverlay";

export default function LobbyScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // F8: Error state + retry count for exponential backoff
  const [errorState, setErrorState] = useState<'timeout' | 'error' | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // F9: Use the new hook with status-based API
  const { room, status, error, joinQueue, leave } = useGameRoom();
  const connected = status === "connected" || status === "idle";

  // Timer for elapsed time during search
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searching) {
      timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [searching]);

  // F8: Queue timeout detection with exponential backoff
  useEffect(() => {
    if (!searching) return;
    const timeoutMs = 30000 * Math.pow(1.5, retryCount); // Exponential backoff
    const timeout = setTimeout(() => {
      setErrorState('timeout');
      setSearching(false);
      leave();
    }, timeoutMs);
    return () => clearTimeout(timeout);
  }, [searching, retryCount]);

  // Auto-navigate to game board when 2 players are in the room
  useEffect(() => {
    if (!room || !searching) return;
    let mounted = true;
    const checkReady = () => {
      if (!mounted) return;
      if (room.state?.players?.size === 2) {
        navigation.navigate("GameBoard");
      }
    };
    if (room.state) {
      checkReady();
    }
    room.onStateChange.once(checkReady);
    const interval = setInterval(checkReady, 500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [room, searching]);

  // F9: Handle connection error from hook
  useEffect(() => {
    if (status === "error" && error) {
      setErrorState('error');
      setSearching(false);
    }
  }, [status, error]);

  const handleFindMatch = async () => {
    if (!username.trim()) return;
    setSearching(true);
    setElapsed(0);
    setErrorState(null);
    // F9: Use joinQueue from the new hook
    await joinQueue(username.trim());
  };

  const handleCancel = () => {
    setSearching(false);
    setElapsed(0);
    setErrorState(null);
    leave();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* F8: Error overlay for timeout */}
      <ErrorOverlay
        type="timeout"
        visible={errorState === 'timeout'}
        onRetry={() => {
          setErrorState(null);
          setRetryCount((c) => c + 1);
          setSearching(true);
          setElapsed(0);
          joinQueue(username.trim());
        }}
      />

      {/* F8: Error overlay for connection error */}
      <ErrorOverlay
        type="error"
        message={error || undefined}
        visible={errorState === 'error'}
        onRetry={() => {
          setErrorState(null);
          setRetryCount((c) => c + 1);
          setSearching(true);
          setElapsed(0);
          joinQueue(username.trim());
        }}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {!searching ? (
        <View style={styles.formArea}>
          {!connected ? (
            <Text
              style={{
                color: "#F59E0B",
                fontSize: 16,
                marginBottom: 12,
              }}
            >
              Connecting to server...
            </Text>
          ) : (
            <Text
              style={{
                color: "#10B981",
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              ✅ Connected
            </Text>
          )}
          {error && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              ⚠️ {error}
            </Text>
          )}
          <Text style={styles.heading}>Enter the Arena</Text>
          <TextInput
            style={styles.input}
            placeholder="Your username"
            placeholderTextColor="#475569"
            value={username}
            onChangeText={setUsername}
            maxLength={20}
          />
          <TouchableOpacity
            style={[
              styles.button,
              (!username.trim() || !connected) && styles.buttonDisabled,
            ]}
            onPress={handleFindMatch}
            disabled={!username.trim() || !connected}
          >
            <Text style={styles.buttonText}>Find Match</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.searchArea}>
          <ActivityIndicator size="large" color="#6B21A8" />
          <Text style={styles.searchText}>Searching for opponent...</Text>
          <Text style={styles.searchTimer}>{elapsed}s</Text>
          {elapsed > 30 && (
            <Text style={styles.expandText}>Expanding search range...</Text>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 24,
  },
  backButton: {
    marginBottom: 40,
  },
  backText: {
    color: "#94A3B8",
    fontSize: 16,
  },
  formArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#334155",
  },
  button: {
    width: "100%",
    backgroundColor: "#6B21A8",
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "600",
  },
  searchArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  searchText: {
    color: "#94A3B8",
    fontSize: 18,
  },
  searchTimer: {
    color: "#6B21A8",
    fontSize: 48,
    fontWeight: "700",
  },
  expandText: {
    color: "#F59E0B",
    fontSize: 14,
  },
  cancelButton: {
    marginTop: 40,
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  cancelText: {
    color: "#EF4444",
    fontSize: 16,
  },
});
