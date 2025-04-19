import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Touchable,
  Switch
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons"; 
import { ref, get, set } from "firebase/database"
import { TimerPickerModal } from "react-native-timer-picker"

