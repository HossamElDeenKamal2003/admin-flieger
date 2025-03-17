<template>
  <div class="discount-container">
    <h1>Discount Management</h1>

    <!-- User Message Section -->
    <div class="message-section">
      <h2>User Message</h2>
      <input v-model="userMessage.text" placeholder="Enter user message text" />
      <input v-model="userMessage.sender" placeholder="Enter sender name" />
      <button @click="updateUserMessage">Update User Message</button>
      <p v-if="userMessage.updatedAt">Last Updated: {{ formatDate(userMessage.updatedAt) }}</p>
    </div>

    <!-- Driver Message Section -->
    <div class="message-section">
      <h2>Driver Message</h2>
      <input v-model="driverMessage.text" placeholder="Enter driver message text" />
      <input v-model="driverMessage.sender" placeholder="Enter sender name" />
      <button @click="updateDriverMessage">Update Driver Message</button>
      <p v-if="driverMessage.updatedAt">Last Updated: {{ formatDate(driverMessage.updatedAt) }}</p>
    </div>

    <!-- Update Days and Amount Section -->
    <div class="update-section">
      <h2>Update Discount Options</h2>
      <input v-model="updateData.id" placeholder="Enter Discount ID" />
      <input v-model="updateData.days" type="number" placeholder="Enter days" />
      <input v-model="updateData.amount" type="number" placeholder="Enter amount" />
      <button @click="updateDiscountOptions">Update Days and Amount</button>
    </div>

    <!-- Update Boolean for User -->
    <div class="update-section">
      <h2>Update User Boolean</h2>
      <label>
        <input type="checkbox" v-model="userBool" /> Enable User Boolean
      </label>
      <button @click="updateUserBoolean">Update User Boolean</button>
    </div>

    <!-- Update Boolean for Driver -->
    <div class="update-section">
      <h2>Update Driver Boolean</h2>
      <label>
        <input type="checkbox" v-model="driverBool" /> Enable Driver Boolean
      </label>
      <button @click="updateDriverBoolean">Update Driver Boolean</button>
    </div>

    <!-- Display Offers -->
    <div class="offers-section">
      <h2>Offers</h2>
      <ul>
        <li v-for="offer in offers" :key="offer._id">
          {{ offer.numberOftrip }} trips - {{ offer.days }} days - {{ offer.amount }}EGP - Active: {{ offer.bool }}
          <p v-if="offer.messageUser">Last Message Update: {{ formatDate(offer.messageUser.updatedAt) }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const baseUrl = 'https://backend.fego-rides.com';

export default {
  data() {
    return {
    name: "couponsComponent",
      userMessage: { text: '', sender: '', updatedAt: null },
      driverMessage: { text: '', sender: '', updatedAt: null },
      updateData: { id: '', days: null, amount: null },
      userBool: false,
      driverBool: false,
      offers: []
    };
  },
  created() {
    this.fetchOffers();
  },
  methods: {
    async fetchOffers() {
      try {
        const response = await axios.get(`${baseUrl}/getOffers`);
        this.offers = response.data.discount;

        // Log the response and extract updatedAt for debugging
        console.log('API Response:', response.data);
        if (this.offers.length > 0 && this.offers[0].messageUser) {
          console.log('MessageUser UpdatedAt:', this.offers[0].messageUser.updatedAt);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      }
    },
    async updateUserMessage() {
      try {
        const response = await axios.put(`${baseUrl}/discount/67b0ab0de5b7c6a23dbc461a`, {
          text: this.userMessage.text,
          sender: this.userMessage.sender
        });
        this.userMessage.updatedAt = response.data.updatedMessage.updatedAt;
        alert('User message updated successfully!');
        this.fetchOffers(); // Refresh offers after update
      } catch (error) {
        console.error('Error updating user message:', error);
      }
    },
    async updateDriverMessage() {
      try {
        const response = await axios.put(`${baseUrl}/discount/67b0ab10e5b7c6a23dbc461d`, {
          text: this.driverMessage.text,
          sender: this.driverMessage.sender
        });
        this.driverMessage.updatedAt = response.data.updatedMessage.updatedAt;
        alert('Driver message updated successfully!');
        this.fetchOffers(); // Refresh offers after update
      } catch (error) {
        console.error('Error updating driver message:', error);
      }
    },
    async updateDiscountOptions() {
      try {
        const response = await axios.put(`${baseUrl}/update`, {
          id: this.updateData.id,
          days: this.updateData.days,
          amount: this.updateData.amount
        });
        console.log(response);
        alert('Discount options updated successfully!');
        this.fetchOffers(); // Refresh offers after update
      } catch (error) {
        console.error('Error updating discount options:', error);
      }
    },
    async updateUserBoolean() {
      try {
        const response = await axios.patch(`${baseUrl}/update-bool-user`, {
          bool: this.userBool,
          type: 'user'
        });
        console.log(response);
        alert('User boolean updated successfully!');
        this.fetchOffers(); // Refresh offers after update
      } catch (error) {
        console.error('Error updating user boolean:', error);
      }
    },
    async updateDriverBoolean() {
      try {
        const response = await axios.patch(`${baseUrl}/update-bool-driver`, {
          bool: this.driverBool,
          type: 'driver'
        });
        console.log(response);
        alert('Driver boolean updated successfully!');
        this.fetchOffers(); // Refresh offers after update
      } catch (error) {
        console.error('Error updating driver boolean:', error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>

<style>
.discount-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  text-align: center;
}
.message-section, .update-section, .offers-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
input {
  display: block;
  margin: 10px auto;
  padding: 8px;
  width: 80%;
}
button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
label {
  display: block;
  margin: 10px 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>