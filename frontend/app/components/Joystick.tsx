import React, { useRef } from "react";
import {
  View,
  PanResponder,
  StyleSheet,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
} from "react-native";

type JoystickProps = {
  onMove: (direction: number, speed: number) => void;
  onEnd: () => void;
  onStart?: () => void;
};

export default function Joystick({ onMove, onEnd, onStart }: JoystickProps) {
  const centerX = 75;
  const centerY = 75;
  const radius = 60;
  const position = useRef(new Animated.ValueXY({ x: centerX, y: centerY })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onStart?.();
      },
      onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const dx = gesture.dx;
        const dy = gesture.dy;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), radius);
        const angle = Math.atan2(dy, dx);

        const x = centerX + distance * Math.cos(angle);
        const y = centerY + distance * Math.sin(angle);
        position.setValue({ x, y });

        // Map angle to a direction value. (Adjust mapping as needed)
        let direction = 9; // default: stop
        const deg = (angle * 180) / Math.PI;
        if (deg > -22.5 && deg <= 22.5) direction = 4;
        else if (deg > 22.5 && deg <= 67.5) direction = 8;
        else if (deg > 67.5 && deg <= 112.5) direction = 2;
        else if (deg > 112.5 && deg <= 157.5) direction = 6;
        else if (deg > 157.5 || deg <= -157.5) direction = 3;
        else if (deg > -157.5 && deg <= -112.5) direction = 5;
        else if (deg > -112.5 && deg <= -67.5) direction = 1;
        else if (deg > -67.5 && deg <= -22.5) direction = 7;

        // Speed is proportional to the distance from the center, capped to 255.
        const speed = Math.floor((distance / radius) * 255);

        // Call the onMove callback provided by the parent (which can send commands via WebSocket)
        onMove(direction, speed);
      },
      onPanResponderRelease: () => {
        // Animate the thumb back to center
        Animated.spring(position, {
          toValue: { x: centerX, y: centerY },
          useNativeDriver: false,
        }).start();
        // Call onEnd to indicate joystick release (e.g., to send a stop command)
        onEnd();
      },
    })
  ).current;

  return (
    <View style={styles.wrapper}>
      <View style={styles.base} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [
                { translateX: Animated.subtract(position.x, 25) },
                { translateY: Animated.subtract(position.y, 25) },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  base: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#222",
    opacity: 0.3,
    position: "relative",
  },
  thumb: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eee",
  },
});
