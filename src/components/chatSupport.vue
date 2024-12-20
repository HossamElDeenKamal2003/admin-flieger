<template>
  <div class="chat-support">
    <div class="chat-window" v-if="activeChat">
      <div class="chat-header">
        <h3>Chat with {{ activeChat.user.username }}</h3>
        <button @click="endChat" :disabled="isChatInProgress">End Chat</button>
      </div>
      <div class="chat-messages">
        <div v-for="message in activeChat.messages" :key="message.timestamp"
          :class="message.sender === 'support' ? 'message-support' : 'message-user'">
          <p>{{ message.message }}</p>
        </div>
      </div>
      <div class="chat-input">
        <input v-model="newMessage" placeholder="Type your message..." @keyup.enter="sendMessage" />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import axios from "axios";

export default {
  name: "chatSupport",
  data() {
    return {
      chats: [], // List of active chats
      activeChat: null, // Currently selected chat
      newMessage: "", // Message being typed
      socket: null, // Socket.IO instance
      isChatInProgress: false, // Track if the chat is in progress
    };
  },
  methods: {
    async fetchactiveChat() {
      try {
        const response = await axios.get("http://62.72.16.49:3000/getChats");
        this.activeChat = response.data.chats;
        console.log(this.activeChat)
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    },

    async sendMessage() {
      if (!this.newMessage.trim()) return;

      try {
        const response = await axios.post("http://62.72.16.49:3000/sendMessage", {
          chatId: this.activeChat._id,
          userId: localStorage.getItem('id'),
          sender: "support",
          message: this.newMessage,
        });
console.log(localStorage.getItem('id'));
        this.activeChat.messages.push(response.data.message);
        this.newMessage = "";
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    async endChat() {
      if (!this.activeChat) return;

      try {
        await axios.post("http://62.72.16.49:3000/endChat", { chatId: this.activeChat._id });
        this.isChatInProgress = false;
        this.activeChat = null; // Reset active chat

        // Automatically select the next chat in the list
        if (this.chats.length > 0) {
          this.selectChat(this.chats[0]); // Select the next chat in line
        }
        this.fetchactiveChat()

        // Notify the server or handle chat end here
      } catch (error) {
        console.error("Error ending the chat:", error);
      }
    },
  },
  mounted() {
    // Initialize the Socket.IO connection
    this.socket = io("http://62.72.16.49:3000");

    // Listen for new messages
    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server.");
    });

    this.fetchactiveChat();
  },
  watch: {
    activeChat: {
      handler(newChat, oldChat) {
        if (oldChat) {
          // Remove the old listener for the previous chat
          this.socket.off(`newMessage/${oldChat._id}`);
        }

        if (newChat) {
          // Set up the listener for the new active chat
          this.socket.on(`newMessage/${newChat._id}`, (data) => {
            this.activeChat.messages.push({
              sender: "admin",
              message: data.message,
              timestamp: new Date(),
            });
            console.log("New message received:", data);
          });
        }
      },
      immediate: true, // Ensure the watcher runs on component mount
    },
  },

  beforeUnmount() {
    // Cleanup socket listeners on component destruction
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>

<style scoped>
.chat-support {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  color: #333;
  height: 100vh;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: #fff;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}

.chat-header {
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.chat-header h3 {
  font-size: 1.2rem;
  color: #333;
}

.chat-header button {
  padding: 6px 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.chat-header button:disabled {
  background-color: #ddd;
}

.chat-header button:hover:not(:disabled) {
  background-color: #45a049;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px 0;
  display: flex;
  flex-direction: column;
}
.message-support p{
  color: white;
  font-size: larger;
}

.message {
  max-width: 75%;
  min-width: 30%;
  padding: 10px 15px;
  border-radius: 20px;
  margin-bottom: 12px;
  font-size: 1rem;
  word-wrap: break-word;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.message-support {
  align-self: flex-end;
  background-color: rgb(114, 89, 170); /* Light green for support messages */
  border-bottom-right-radius: 0px;
  width: 30%;
  margin-bottom: 15px;
  padding: 20px;
  border-radius: 15px;

}

.message-user {
  width: 60%;
  background-color: #ece5dd; /* Light grey for user messages */
  border-bottom-left-radius: 0px;
  color: #333;
  width: fit-content;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 15px;
  width: 30%;

}

.chat-input {
  display: flex;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 12px;
  border-top: 1px solid #f0f0f0;
}

.chat-input input {
  flex: 1;
  padding: 10px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  font-size: 1rem;
  background-color: #f5f5f5;
  color: #333;
}

.chat-input button {
  padding: 10px 20px;
  background-color: rgb(114, 89, 170);
  color: white;
  border: none;
  border-radius: 50%;
  margin-left: 10px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s ease;
}

.chat-input button:hover {
  background-color: #45a049;
}

.chat-input input:focus {
  outline: none;
  border-color: #4CAF50;
  background-color: #fff;
}

.chat-messages div {
  display: flex;
  justify-content: flex-start;
}

.chat-messages .message-support::after {
  content: "✓";
  position: absolute;
  right: 10px;
  bottom: 5px;
  font-size: 0.8rem;
  color: #4CAF50;
}

.chat-messages .message-user::after {
  content: "✓";
  position: absolute;
  left: 10px;
  bottom: 5px;
  font-size: 0.8rem;
  color: #4CAF50;
}

</style>