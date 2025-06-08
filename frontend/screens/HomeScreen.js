"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native"
import { BASE_URL } from "../config"

export default function HomeScreen({ navigation, onSignOut, userRole }) {
  const [turfs, setTurfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchTurfs()
  }, [])

  const fetchTurfs = async () => {
    try {
      const response = await fetch(`${BASE_URL}/turfs`)
      const data = await response.json()

      if (response.ok) {
        setTurfs(data)
      } else {
        Alert.alert("Error", "Failed to fetch turfs")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.")
      console.error("Fetch turfs error:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchTurfs()
  }

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: onSignOut, style: "destructive" },
    ])
  }

  const renderTurf = ({ item }) => (
    <TouchableOpacity style={styles.turfCard} onPress={() => navigation.navigate("Booking", { turf: item })}>
      <Image source={{ uri: item.imageURL }} style={styles.turfImage} />
      <View style={styles.turfInfo}>
        <Text style={styles.turfName}>{item.name}</Text>
        <Text style={styles.turfLocation}>{item.location}</Text>
        <Text style={styles.turfOwner}>Owner: {item.ownerId?.name || "Unknown"}</Text>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading turfs...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Turfs</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("MyBookings")}>
          <Text style={styles.navButtonText}>My Bookings</Text>
        </TouchableOpacity>

        {userRole === "owner" && (
          <TouchableOpacity
            style={[styles.navButton, styles.ownerButton]}
            onPress={() => navigation.navigate("BlockSlot")}
          >
            <Text style={styles.navButtonText}>Block Slots</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={turfs}
        renderItem={renderTurf}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No turfs available</Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  signOutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#ff4444",
    borderRadius: 5,
  },
  signOutText: {
    color: "white",
    fontWeight: "bold",
  },
  navigationButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#0066cc",
    borderRadius: 8,
    alignItems: "center",
  },
  ownerButton: {
    backgroundColor: "#ff8800",
  },
  navButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContainer: {
    padding: 20,
  },
  turfCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  turfImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  turfInfo: {
    padding: 15,
  },
  turfName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  turfLocation: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  turfOwner: {
    fontSize: 14,
    color: "#888",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
})
