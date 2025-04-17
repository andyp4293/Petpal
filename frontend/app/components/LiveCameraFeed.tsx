import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';


interface LiveCameraFeedProps {
  uri?: string;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: {
    flex: 1,
    width: '100%',
    height: 255,
    transform: [{ rotate: '180deg' }], // Flip vertically
  },
});



export default function LiveCameraFeed({ uri }: LiveCameraFeedProps) {
  return (
    <WebView
    source={{
      uri: uri, 
    }}
    style={styles.webview}
    javaScriptEnabled={true}
    domStorageEnabled={true}
    allowsInlineMediaPlayback={true}
    mediaPlaybackRequiresUserAction={false}
    onError={(syntheticEvent) => {
      const { nativeEvent } = syntheticEvent;
      console.error("WebView Error:", nativeEvent);
    }}
  />
  );
}
