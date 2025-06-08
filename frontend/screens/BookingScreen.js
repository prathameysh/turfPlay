"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Image } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BASE_URL } from "../config"

export default function BookingScreen({ route, navigation }) {
  const { turf } = route.params
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedStartHour, setSelectedStartHour] = useState(null)
  const [selectedEndHour, setSelectedEndHour] = useState(null)
  const [occupiedSlots, setOccupiedSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    // Set default date to today
    const today = new Date()
    const dateString = today.toISOString().split("T")[0]
    setSelectedDate(dateString)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchOccupiedSlots()
    }
  }, [selectedDate])

  const fetchOccupiedSlots = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/occupied?date=${selectedDate}&turfId=${turf._id}`)
      const data = await response.json()

      if (response.ok) {
        setOccupiedSlots(data)
      } else {
        Alert.alert("Error", "Failed to fetch occupied slots")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.")
      console.error("Fetch occupied slots error:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split("T")[0]
      const displayDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      dates.push({ value: dateString, display: displayDate })
    }

    return dates
  }

  const generateHours = () => {
    const hours = []
    for (let i = 6; i <= 23; i++) {
      const hour12 = i > 12 ? i - 12 : i
      const ampm = i >= 12 ? "PM" : "AM"
      hours.push({
        value: i,
        display: `${hour12}:00 ${ampm}`,
      })
    }
    return hours
  }

  const isSlotOccupied = (hour) => {
    return occupiedSlots.some((slot) => hour >= slot.startHour && hour < slot.endHour)
  }

  const handleBooking = async () => {
    if (!selectedStartHour || !selectedEndHour) {
      Alert.alert("Error", "Please select start and end time")
      return
    }

    if (selectedStartHour >= selectedEndHour) {
      Alert.alert("Error", "End time must be after start time")
      return
    }

    setBookingLoading(true)
    try {
      const token = await AsyncStorage.getItem("userToken")
      const response = await fetch(`${BASE_URL}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          turfId: turf._id,
          date: selectedDate,
          startHour: selectedStartHour,
          endHour: selectedEndHour,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        Alert.alert("Success", "Booking created successfully!", [{ text: "OK", onPress: () => navigation.goBack() }])
      } else {
        Alert.alert("Error", data.error || "Booking failed")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.")
      console.error("Booking error:", error)
    } finally {
      setBookingLoading(false)
    }
  }

  const dates = generateDates()
  const hours = generateHours()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.turfHeader}>
        <Image source={{ uri: turf.imageURL }} style={styles.turfImage} />
        <View style={styles.turfInfo}>
          <Text style={styles.turfName}>{turf.name}</Text>
          <Text style={styles.turfLocation}>{turf.location}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dateContainer}>
            {dates.map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[styles.dateButton, selectedDate === date.value && styles.dateButtonActive]}
                onPress={() => setSelectedDate(date.value)}
              >
                <Text style={[styles.dateButtonText, selectedDate === date.value && styles.dateButtonTextActive]}>
                  {date.display}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time Slot</Text>
        {loading ? (
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
                      selectedStartHour === hour.value && styles.timeButtonTextActive,
                      isSlotOccupied(hour.value) && styles.timeButtonTextOccupied,
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
                      selectedEndHour === hour.value && styles.timeButtonTextActive,
                      isSlotOccupied(hour.value) && styles.timeButtonTextOccupied,
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
          <Text style={styles.legendText}>Occupied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: "#0066cc" }]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.bookButton, bookingLoading && styles.bookButtonDisabled]}
        onPress={handleBooking}
        disabled={bookingLoading}
      >
        {bookingLoading ? <ActivityIndicator color="white" /> : <Text style={styles.bookButtonText}>Book Now</Text>}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  turfHeader: {
    backgroundColor: "white",
    marginBottom: 20,
  },
  turfImage: {
    width: "100%",
    height: 200,
  },
  turfInfo: {
    padding: 20,
  },
  turfName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  turfLocation: {
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
    backgroundColor: "#0066cc",
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
    backgroundColor: "#0066cc",
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
  bookButton: {
    backgroundColor: "#0066cc",
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonDisabled: {
    backgroundColor: "#ccc",
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
})
