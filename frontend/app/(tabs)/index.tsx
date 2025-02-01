import React from "react";
import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// Array for the hours based on a 12-hour clock
const hours = Array.from({ length: 24 }, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const suffix = i < 12 ? "AM" : "PM"; // Determine AM/PM based on the hour
  if(hour === 12 && suffix === "AM") return "";
  return `${hour} ${suffix}`;
});

// Array of event objects
const events = [
  {
    id: "1",
    title: "Intro to Computer Science",
    time: "12:10 PM - 1:30 PM",
    location: "SEC-111",
    start: 12.166, // 12:10 PM in fractional hours
    duration: 1.33333, // Duration in hours
  },
  {
    id: "2",
    title: "Zumba",
    time: "6:00 PM - 7:00 PM",
    location: "Werblin - Multipurpose Room",
    start: 18, // 6 PM
    duration: 1,
  },
];


export default function TabHomeScreen(): JSX.Element {
  const renderHour = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }): JSX.Element => (
    <View style={styles.hourRow}>
      {/* Hour label */}
      <Text style={styles.hourText}>{item}</Text>
      {/* Divider line */}
      <View style={styles.hourDivider} />

      {/* Render events */}
      {events
        .filter(
          (event) => event.start >= index && event.start < index + 1 // Event starts within the hour
        )
        .map((event) => {
          const fractionalStart = event.start - index; // Fractional offset within the hour
          const topPosition = fractionalStart * ROW_HEIGHT; // Calculate precise top position
          const eventHeight = event.duration * ROW_HEIGHT; // Height of the event

          return (
            <View
              key={event.id}
              style={[
                styles.eventContainer,
                {
                  top: topPosition,
                  height: eventHeight,
                },
              ]}
            >
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDetails}>{event.time}</Text>
              <Text style={styles.eventDetails}>{event.location}</Text>
            </View>
          );
        })}

    </View>
  );

  return (
    <FlatList
      data={hours}
      renderItem={renderHour}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.timeContainer}
      showsVerticalScrollIndicator={true}
    />
  );
}

const ROW_HEIGHT = 60;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  timeContainer: {
    paddingBottom: 20, // Extra space for scroll
  },
  hourRow: {
    height: ROW_HEIGHT, // Fixed height for each hour
    // position: "relative", // Enable absolute positioning within each row
  },
  hourText: {
    color: "#fff",
    position: "absolute",
    left: 10,
    top: -7.5,
    fontSize: 12,
    zIndex: 1, // Ensure hour text is above events
  },
  hourDivider: {
    position: "absolute",
    left: 60,
    right: 10,
    height: 1,
    backgroundColor: "#333",
  },
  eventContainer: {
    position: "absolute",
    left: 60, // Offset to avoid overlapping with hour labels
    width: width - 80, // Adjust width based on screen width
    backgroundColor: "red",
    borderRadius: 5,
    padding: 10,
    zIndex: 2, // Ensure events are above the divider
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  eventDetails: {
    fontSize: 12,
    color: "#fff",
  },
});
