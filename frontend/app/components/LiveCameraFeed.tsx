import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
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
    },
    blankScreen: {
        display: 'flex',
        width: '100%',
        height: screenHeight / (100 / 35),
        backgroundColor: 'black',
    }
});

export default function LiveCameraFeed({uri}: LiveCameraFeedProps){
    
    return (
        <View style={styles.container}>
            {uri ? (
                //<WebView source={{uri: ''}} style={styles.webview}/>
                <Text>Your URI is this: {uri}</Text>
            )
            :
            (
                <View style={styles.blankScreen}/>

            )
        }
        </View>
    )
}