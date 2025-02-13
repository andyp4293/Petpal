import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface LiveCameraFeedProps {
  uri?: string;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, width: '100%', height: 300 },
});

export default function LiveCameraFeed({ uri }: LiveCameraFeedProps) {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: uri || "http://192.168.4.1:81/stream" }}
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
    </View>
  );
}
