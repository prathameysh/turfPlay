"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { ActivityIndicator, View } from "react-native"

import LoginScreen from "./screens/LoginScreen"
import RegisterScreen from "./screens/RegisterScreen"
import HomeScreen from "./screens/HomeScreen"
import BookingScreen from "./screens/BookingScreen"
import MyBookingsScreen from "./screens/MyBookingsScreen"
import BlockSlotScreen from "./screens/BlockSlotScreen"

const Stack = createStackNavigator()

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState(null)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken")
      const role = await AsyncStorage.getItem("userRole")
      if (token) {
        setUserToken(token)
        setUserRole(role)
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (token, role) => {
    try {
      await AsyncStorage.setItem("userToken", token)
      await AsyncStorage.setItem("userRole", role)
      setUserToken(token)
      setUserRole(role)
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem("userToken")
      await AsyncStorage.removeItem("userRole")
      setUserToken(null)
      setUserRole(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken == null ? (
          // Auth screens
          <>
            <Stack.Screen name="Login">{(props) => <LoginScreen {...props} onSignIn={signIn} />}</Stack.Screen>
            <Stack.Screen name="Register">{(props) => <RegisterScreen {...props} onSignIn={signIn} />}</Stack.Screen>
          </>
        ) : (
          // App screens
          <>
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} onSignOut={signOut} userRole={userRole} />}
            </Stack.Screen>
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
            {userRole === "owner" && <Stack.Screen name="BlockSlot" component={BlockSlotScreen} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
