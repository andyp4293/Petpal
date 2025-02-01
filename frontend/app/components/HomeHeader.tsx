import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CalendarList } from "react-native-calendars";
import Collapsible from "react-native-collapsible";
import { Ionicons } from "@expo/vector-icons";

// structure of the day object from the react calendar
type Day = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

// structure of the month object from the react calendar
type Month = {
  month: number;
  year: number;
  timestamp: number;
  dateString: string;
};

// props for the homeheader component
type HomeHeaderProps = {
  selectedDate: string; // currently selected date
  setSelectedDate: (date: string) => void; // function to update the selected date
};

// main component for the calendar dropdown header
const HomeHeader: React.FC<HomeHeaderProps> = ({
  selectedDate,
  setSelectedDate,
}) => {
  // state to manage whether the calendar is collapsed
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // state to track the currently visible month
  const [visibleMonth, setVisibleMonth] = useState<Month>({
    month: new Date(selectedDate).getMonth() + 1,
    year: new Date(selectedDate).getFullYear(),
    timestamp: Date.now(),
    dateString: selectedDate,
  });

  // state to manage marked dates on the calendar
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({
    [selectedDate]: { selected: true, selectedColor: "#C8102E" },
  });

  // function to handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date); // update selected date in parent state
    const newDate = new Date(date);
    setVisibleMonth({
      month: newDate.getMonth() + 1,
      year: newDate.getFullYear(),
      timestamp: newDate.getTime(),
      dateString: date,
    });

    // update the marked dates to highlight the selected date
    setMarkedDates({
      [date]: { selected: true, selectedColor: "#C8102E" },
    });
  };

  // determine the current and selected year for display
  const currentYear = new Date().getFullYear();
  const selectedYear = visibleMonth.year;

  // format the visible month and year for the header display
  const monthDisplay =
    new Date(visibleMonth.year, visibleMonth.month - 1).toLocaleString(
      "default",
      { month: "long" }
    ) + (currentYear !== selectedYear ? ` ${selectedYear}` : "");

  return (
    <View>
      {/* header section with toggle button */}
      <View style={[styles.header, { zIndex: 2 }]}>
        <TouchableOpacity
          onPress={() => setIsCollapsed(!isCollapsed)} // toggle calendar visibility
          style={styles.headerContent}
        >
          <Text style={styles.headerText}>{monthDisplay}</Text>
          <Ionicons
            name={isCollapsed ? "chevron-down" : "chevron-up"}
            size={20}
            color="white"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* collapsible calendar */}
      <Collapsible collapsed={isCollapsed}>
        <View style={styles.calendarContainer}>
          <CalendarList
            current={selectedDate} // set the initial date
            onDayPress={(day) => handleDateSelect(day.dateString)} // handle day selection
            onVisibleMonthsChange={(months) => {
              if (months && months[0]) {
                const month = months[0];
                const firstDayOfMonth = `${month.year}-${String(
                  month.month
                ).padStart(2, "0")}-01`; // calculate the first day of the visible month

                handleDateSelect(firstDayOfMonth); // set first day as selected
                setVisibleMonth({
                  month: month.month,
                  year: month.year,
                  timestamp: Date.now(),
                  dateString: firstDayOfMonth,
                }); // update visible month
              }
            }}
            hideExtraDays={false} // show extra days for a complete calendar view
            scrollEnabled // allow horizontal scrolling
            horizontal={true} // make the calendar horizontal
            pagingEnabled // enable paging while scrolling
            markedDates={markedDates} // dynamically mark selected dates
            renderHeader={() => null} // suppress default header rendering
            theme={{
              backgroundColor: "#1C1C1C",
              calendarBackground: "#1C1C1C",
              textSectionTitleColor: "#ffffff",
              dayTextColor: "#ffffff",
              selectedDayBackgroundColor: "#C8102E",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#C8102E",
              monthTextColor: "#ffffff",
              arrowColor: "#ffffff",
              textDisabledColor: "#555555",
            }}
          />
        </View>
      </Collapsible>
    </View>
  );
};

// styles for the component
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#C8102E",
    padding: 15,
    paddingTop: 50,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  calendarContainer: {
    backgroundColor: "#1C1C1C",
    borderBottomWidth: 1,
    borderBottomColor: "#555",
    zIndex: 1,
    marginBottom: -85,
  },
});

export default HomeHeader;
