"use client";

import { useState, useEffect } from "react";
import { Picker } from "@react-native-picker/picker";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config";

export default function BlockSlotScreen() {
  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartHour, setSelectedStartHour] = useState(null);
  const [selectedEndHour, setSelectedEndHour] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [blockingLoading, setBlockingLoading] = useState(false);

  useEffect(() => {
    fetchMyTurfs();
  }, []);

  useEffect(() => {
    // Set default date to today
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];
    setSelectedDate(dateString);
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTurf) {
      fetchOccupiedSlots();
    }
  }, [selectedDate, selectedTurf]);

  const fetchMyTurfs = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${BASE_URL}/my-turfs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTurfs(data);
        if (data.length > 0) {
          setSelectedTurf(data[0]._id);
        }
      } else {
        Alert.alert("Error", data.error || "Failed to fetch your turfs");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.");
      console.error("Fetch turfs error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOccupiedSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/occupied?date=${selectedDate}&turfId=${selectedTurf}`
      );
      const data = await response.json();

      if (response.ok) {
        setOccupiedSlots(data);
      } else {
        Alert.alert("Error", "Failed to fetch occupied slots");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.");
      console.error("Fetch occupied slots error:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split("T")[0];
      const displayDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dates.push({ value: dateString, display: displayDate });
    }

    return dates;
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 6; i <= 23; i++) {
      const hour12 = i > 12 ? i - 12 : i;
      const ampm = i >= 12 ? "PM" : "AM";
      hours.push({
        value: i,
        display: `${hour12}:00 ${ampm}`,
      });
    }
    return hours;
  };

  const isSlotOccupied = (hour) => {
    return occupiedSlots.some(
      (slot) => hour >= slot.startHour && hour < slot.endHour
    );
  };

  const handleBlockSlot = async () => {
    if (!selectedTurf) {
      Alert.alert("Error", "Please select a turf");
      return;
    }

    if (!selectedStartHour || !selectedEndHour) {
      Alert.alert("Error", "Please select start and end time");
      return;
    }

    if (selectedStartHour >= selectedEndHour) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }

    setBlockingLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${BASE_URL}/block-slot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          turfId: selectedTurf,
          date: selectedDate,
          startHour: selectedStartHour,
          endHour: selectedEndHour,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Time slot blocked successfully!");
        fetchOccupiedSlots(); // Refresh occupied slots
        setSelectedStartHour(null);
        setSelectedEndHour(null);
      } else {
        Alert.alert("Error", data.error || "Failed to block slot");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.");
      console.error("Block slot error:", error);
    } finally {
      setBlockingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading your turfs...</Text>
      </View>
    );
  }

  if (turfs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No turfs found</Text>
        <Text style={styles.emptySubText}>
          You need to register a turf to block time slots
        </Text>
      </View>
    );
  }

  const dates = generateDates();
  const hours = generateHours();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Block Time Slots</Text>
        <Text style={styles.headerSubtitle}>
          Block time slots for offline bookings or maintenance
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Turf</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTurf}
            onValueChange={(itemValue) => setSelectedTurf(itemValue)}
            style={styles.picker}
          >
            {turfs.map((turf) => (
              <Picker.Item
                key={turf._id}
                label={`${turf.name} - ${turf.location}`}
                value={turf._id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dateContainer}>
            {dates.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[
                  styles.dateButton,
                  selectedDate === date.value && styles.dateButtonActive,
                ]}
                onPress={() => setSelectedDate(date.value)}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    selectedDate === date.value && styles.dateButtonTextActive,
                  ]}
                >
                  {date.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time Slot to Block</Text>
        {slotsLoading ? (
          <ActivityIndicator size="small" color="#0066cc" />
        ) : (
          <>
            <Text style={styles.subTitle}>Start Time</Text>
            <View style={styles.timeContainer}>
              {hours.map((hour) => (
                <TouchableOpacity
                  key={`start-${hour.value}`}
                  style={[
                    styles.timeButton,
                    selectedStartHour === hour.value && styles.timeButtonActive,
                    isSlotOccupied(hour.value) && styles.timeButtonOccupied,
                  ]}
                  onPress={() => setSelectedStartHour(hour.value)}
                  disabled={isSlotOccupied(hour.value)}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      selectedStartHour === hour.value &&
                        styles.timeButtonTextActive,
                      isSlotOccupied(hour.value) &&
                        styles.timeButtonTextOccupied,
                    ]}
                  >
                    {hour.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subTitle}>End Time</Text>
            <View style={styles.timeContainer}>
              {hours.map((hour) => (
                <TouchableOpacity
                  key={`end-${hour.value}`}
                  style={[
                    styles.timeButton,
                    selectedEndHour === hour.value && styles.timeButtonActive,
                    isSlotOccupied(hour.value) && styles.timeButtonOccupied,
                  ]}
                  onPress={() => setSelectedEndHour(hour.value)}
                  disabled={isSlotOccupied(hour.value)}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      selectedEndHour === hour.value &&
                        styles.timeButtonTextActive,
                      isSlotOccupied(hour.value) &&
                        styles.timeButtonTextOccupied,
                    ]}
                  >
                    {hour.display}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#ff4444" }]} />
          <Text style={styles.legendText}>Already Occupied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#ff8800" }]} />
          <Text style={styles.legendText}>Selected to Block</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.blockButton,
          blockingLoading && styles.blockButtonDisabled,
        ]}
        onPress={handleBlockSlot}
        disabled={blockingLoading}
      >
        {blockingLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.blockButtonText}>Block Time Slot</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    backgroundColor: "white",
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    height: 50,
  },
  dateContainer: {
    flexDirection: "row",
  },
  dateButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  dateButtonActive: {
    backgroundColor: "#ff8800",
  },
  dateButtonText: {
    fontSize: 14,
    color: "#666",
  },
  dateButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    minWidth: 80,
    alignItems: "center",
  },
  timeButtonActive: {
    backgroundColor: "#ff8800",
  },
  timeButtonOccupied: {
    backgroundColor: "#ff4444",
  },
  timeButtonText: {
    fontSize: 14,
    color: "#666",
  },
  timeButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  timeButtonTextOccupied: {
    color: "white",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#666",
  },
  blockButton: {
    backgroundColor: "#ff8800",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  blockButtonDisabled: {
    backgroundColor: "#ccc",
  },
  blockButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
