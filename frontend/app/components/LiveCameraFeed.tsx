import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    }
});

export default function LiveCameraFeed(){
    return (
        <View style={styles.container}>
            <WebView source={{uri: ''}} style={styles.webview}/>
        </View>
    )
}