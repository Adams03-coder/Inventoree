import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/auth-context";
import { InventoryProvider } from "../contexts/inventory-context";
import { ThemeProvider } from "../contexts/theme-context";
import { ChatProvider } from "../contexts/chat-context";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <InventoryProvider>
            <ChatProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
              
                      <RootLayoutNav />
               

              </GestureHandlerRootView>
            </ChatProvider>
          </InventoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}