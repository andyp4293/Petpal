import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const screenHeight = Dimensions.get('window').height;

interface LiveCameraFeedProps {
  uri?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width: '100%',
    height: screenHeight / (100 / 35), // Takes 35% of screen height
  },
  blankScreen: {
    width: '100%',
    height: screenHeight / (100 / 35),
    backgroundColor: 'black',
  }
});

export default function LiveCameraFeed({ uri }: LiveCameraFeedProps) {
  return (
    <View style={styles.container}>
      {uri ? (
        <WebView
          source={{ uri }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
        />
      ) : (
        <View style={styles.blankScreen} />
      )}
    </View>
  );
}
