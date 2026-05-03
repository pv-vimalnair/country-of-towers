import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./src/screens/HomeScreen";
import LobbyScreen from "./src/screens/LobbyScreen";
import GameBoardScreen from "./src/screens/GameBoardScreen";
import MatchEndScreen from "./src/screens/MatchEndScreen";

type Screen = "Home" | "Lobby" | "GameBoard" | "MatchEnd";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("Home");
  const [routeParams, setRouteParams] = useState<Record<string, any>>({});

  const navigate = (screen: Screen, params?: any) => {
    setCurrentScreen(screen);
    if (params) {
      setRouteParams((prev) => ({ ...prev, [screen]: params }));
    }
  };

  return (
    <>
      <StatusBar style="light" />
      {currentScreen === "Home" && <HomeScreen navigation={{ navigate }} />}
      {currentScreen === "Lobby" && (
        <LobbyScreen navigation={{ navigate, goBack: () => navigate("Home") }} />
      )}
      {currentScreen === "GameBoard" && (
        <GameBoardScreen navigation={{ navigate, goBack: () => navigate("Lobby") }} />
      )}
      {currentScreen === "MatchEnd" && (
        <MatchEndScreen
          navigation={{ navigate, goBack: () => navigate("Home") }}
          route={{ params: routeParams["MatchEnd"] }}
        />
      )}
    </>
  );
}
