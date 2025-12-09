import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { NotesProvider } from "../context/NotesContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotesProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ title: "Profile" }} />
          <Stack.Screen name="add-note" options={{ title: "Add Note" }} />
          <Stack.Screen name="edit-note" options={{ title: "Edit Note" }} />
        </Stack>
      </NotesProvider>
    </AuthProvider>
  );
}
