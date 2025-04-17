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
  const lastSent = useRef(Date.now());

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

        if (distance < 10) return; // ignore small jitters
        const now = Date.now();
        if (now - lastSent.current < 60) return; // throttle frequency
        lastSent.current = now;

        let direction = 9; // stop by default
        const deg = (angle * 180) / Math.PI;
        if (deg > -22.5 && deg <= 22.5) direction = 4;
        else if (deg > 22.5 && deg <= 67.5) direction = 8;
        else if (deg > 67.5 && deg <= 112.5) direction = 2;
        else if (deg > 112.5 && deg <= 157.5) direction = 6;
        else if (deg > 157.5 || deg <= -157.5) direction = 3;
        else if (deg > -157.5 && deg <= -112.5) direction = 5;
        else if (deg > -112.5 && deg <= -67.5) direction = 1;
        else if (deg > -67.5 && deg <= -22.5) direction = 7;

        const MAX_SPEED = 100;

        const rawSpeed = (distance / radius) * 255;
        const speed = Math.min(Math.floor(rawSpeed), MAX_SPEED);
        onMove(direction, speed);

      },
      onPanResponderRelease: () => {
        Animated.spring(position, {
          toValue: { x: centerX, y: centerY },
          useNativeDriver: false,
        }).start();
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
