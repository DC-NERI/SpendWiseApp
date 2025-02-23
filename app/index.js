import React from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <WebView 
        source={{ uri: "https://spend-wise-omega.vercel.app" }} 
        style={styles.webview} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: "100dvh",
  },
  webview: {
    flex: 1,
  },
});
