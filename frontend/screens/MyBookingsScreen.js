"use client"

import { useState, useEffect } from "react"
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, RefreshControl } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BASE_URL } from "../config"

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      const response = await fetch(`${BASE_URL}/mybookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        setBookings(data)
      } else {
        Alert.alert("Error", data.error || "Failed to fetch bookings")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.")
      console.error("Fetch bookings error:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchBookings()
  }

  const formatTime = (hour) => {
    const hour12 = hour > 12 ? hour - 12 : hour
    const ampm = hour >= 12 ? "PM" : "AM"
    return `${hour12}:00 ${ampm}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.turfName}>{item.turfId?.name || "Unknown Turf"}</Text>
        <Text style={styles.bookingDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.turfLocation}>{item.turfId?.location || "Unknown Location"}</Text>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(item.startHour)} - {formatTime(item.endHour)}
        </Text>
        <Text style={styles.durationText}>
          ({item.endHour - item.startHour} hour{item.endHour - item.startHour !== 1 ? "s" : ""})
        </Text>
      </View>
      <Text style={styles.bookingId}>Booking ID: {item._id}</Text>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
            <Text style={styles.emptySubText}>Book a turf to see your reservations here</Text>
          </View>
        }
      />
    </View>
  )
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
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  listContainer: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  turfName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  bookingDate: {
    fontSize: 14,
    color: "#0066cc",
    fontWeight: "bold",
  },
  turfLocation: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  durationText: {
    fontSize: 14,
    color: "#888",
  },
  bookingId: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
})
