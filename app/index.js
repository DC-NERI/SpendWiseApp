import React, { useState, useEffect } from "react";
import { StyleSheet, View, ActivityIndicator, Modal, Text, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import * as FileSystem from "expo-file-system";
import * as Updates from "expo-updates";

export default function App() {
  const [webUri, setWebUri] = useState("https://spend-wise-omega.vercel.app");
  const [noConnectionHtmlUri, setNoConnectionHtmlUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false); // Controls modal visibility

  // Function to check for updates
  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true); // Show modal
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
  };

  // Handle the update process
  const handleUpdateNow = async () => {
    setLoading(true); // Show loader while updating
    setUpdateAvailable(false); // Hide modal
    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  };

  useEffect(() => {
    const loadLocalHtml = async () => {
      const fileUri = FileSystem.documentDirectory + "no-connection.html";
      const htmlContent = `
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { text-align: center; padding: 50px; font-family: Arial, sans-serif; }
            h1 { color: red; }
          </style>
        </head>
        <body>
          <h1>No Internet Connection</h1>
          <p>Please check your connection and try again.</p>
        </body>
        </html>
      `;

      await FileSystem.writeAsStringAsync(fileUri, htmlContent, { encoding: FileSystem.EncodingType.UTF8 });
      setNoConnectionHtmlUri(fileUri);
    };

    loadLocalHtml();
    checkForUpdates(); // Check for updates when the app starts

    // Periodic update check every 5 minutes
    const updateInterval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => clearInterval(updateInterval); // Cleanup on unmount
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Update Modal */}
      <Modal visible={updateAvailable} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Available</Text>
            <Text style={styles.modalText}>A new version is available. Would you like to update now?</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setUpdateAvailable(false)}>
                <Text style={styles.buttonText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleUpdateNow}>
                <Text style={styles.buttonText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
      {noConnectionHtmlUri && (
        <WebView
          source={{ uri: webUri }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onError={() => setWebUri(noConnectionHtmlUri)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "gray",
  },
  updateButton: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

