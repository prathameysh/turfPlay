"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { BASE_URL } from "../config"

export default function RegisterScreen({ navigation, onSignIn }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    turfName: "",
    location: "",
    imageURL: "",
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRegister = async () => {
    const { name, email, password, role, turfName, location, imageURL } = formData

    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    if (role === "owner" && (!turfName || !location || !imageURL)) {
      Alert.alert("Error", "Please fill in all turf details for owner registration")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        await onSignIn(data.token, data.user.role)
        Alert.alert("Success", "Registration successful!")
      } else {
        Alert.alert("Error", data.error || "Registration failed")
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please check your connection.")
      console.error("Registration error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our turf booking community</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          value={formData.name}
          onChangeText={(value) => handleInputChange("name", value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={formData.email}
          onChangeText={(value) => handleInputChange("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password *"
          value={formData.password}
          onChangeText={(value) => handleInputChange("password", value)}
          secureTextEntry
        />

        <Text style={styles.sectionTitle}>Account Type</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleButton, formData.role === "user" && styles.roleButtonActive]}
            onPress={() => handleInputChange("role", "user")}
          >
            <Text style={[styles.roleButtonText, formData.role === "user" && styles.roleButtonTextActive]}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, formData.role === "owner" && styles.roleButtonActive]}
            onPress={() => handleInputChange("role", "owner")}
          >
            <Text style={[styles.roleButtonText, formData.role === "owner" && styles.roleButtonTextActive]}>
              Turf Owner
            </Text>
          </TouchableOpacity>
        </View>

        {formData.role === "owner" && (
          <View style={styles.ownerSection}>
            <Text style={styles.sectionTitle}>Turf Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Turf Name *"
              value={formData.turfName}
              onChangeText={(value) => handleInputChange("turfName", value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Location *"
              value={formData.location}
              onChangeText={(value) => handleInputChange("location", value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Image URL *"
              value={formData.imageURL}
              onChangeText={(value) => handleInputChange("imageURL", value)}
              autoCapitalize="none"
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  roleContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#ddd",
    marginHorizontal: 5,
    alignItems: "center",
  },
  roleButtonActive: {
    borderColor: "#0066cc",
    backgroundColor: "#0066cc",
  },
  roleButtonText: {
    fontSize: 16,
    color: "#666",
  },
  roleButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  ownerSection: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0066cc",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#0066cc",
    fontSize: 16,
  },
})
