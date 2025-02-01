import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

export default function TabChatScreen() {
  // state for messages with default bot messages
  const [messages, setMessages] = useState<{ id: string; text: string; sender: "bot" | "user" }[]>([
    { id: "1", text: "Hello! How can I assist you today?", sender: "bot" },
  ]);

  // state for user input of messages 
  const [input, setInput] = useState("");

  // function to handle sending a message
  const handleSend = () => {
    if (input.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: `${prevMessages.length + 1}`, text: input, sender: "user" },
        { id: `${prevMessages.length + 2}`, text: "Got it! Let me check that for you.", sender: "bot" },
      ]);

      // clear input after sending
      setInput("");
    }
  };

  return (
    // KeyboardAvoidngView ensures that the input box is not hidden by the keyboard. 
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.sender === "bot" ? styles.botMessage : styles.userMessage,
                ]}
              >
                <Text style={item.sender === "bot" ? styles.botText : styles.userText}>
                  {item.text}
                </Text>
              </View>
            )}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  innerContainer: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chatContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "red",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#333",
  },
  botText: {
    color: "white",
  },
  userText: {
    color: "#FFF",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 20,
    paddingHorizontal: 15,
    color: "#FFF",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#CC0033",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
