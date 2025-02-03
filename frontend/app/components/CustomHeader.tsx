import React from "react";
import { View, Text, StyleSheet } from "react-native";

type CustomHeaderProps = {
  title?: string;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ title = "Custom Header" }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1e3504", 
    padding: 15,
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "#F5F5DC",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default CustomHeader;
