<template>
  <div class="fego-dashboard">
    <!-- Sidebar -->
    <div class="sidebar">
      <sidebarComponent />
    </div>
    <!-- Main Content -->
    <div class="main-content">
      <WaitingDriversNumber :waiting-captains="waitingCaptains" />
      <div class="coupons-management">
        <h2 class="section-title">Offers Management</h2>

        <!-- User Message and Captains Message (Side by Side) -->
        <div class="messages-row">
          <!-- User Message -->
          <div class="message-card">
            <h3>User Message</h3>
            <input v-model="userMessage.text" placeholder="Enter User Message Text" />
            <input v-model="userMessage.sender" placeholder="Enter sender name" />
            <button @click="updateUserMessage">Confirm</button>
            <p v-if="userMessage.updatedAt">Last Updated: {{ formatDate(userMessage.updatedAt) }}</p>
          </div>

          <!-- Captains Message -->
          <div class="message-card">
            <h3>Captains Message</h3>
            <input v-model="driverMessage.text" placeholder="Enter Captains Message Text" />
            <input v-model="driverMessage.sender" placeholder="Enter sender name" />
            <button @click="updateDriverMessage">Confirm</button>
            <p v-if="driverMessage.updatedAt">Last Updated: {{ formatDate(driverMessage.updatedAt) }}</p>
          </div>
        </div>
        <div class="ids">
          <div>
            <h2>User Offer ID: <span>67b0ab0de5b7c6a23dbc461a</span> <button @click="copyOfferId('user')" class="copy-button">📋</button></h2>
          </div>
          <div>
            <h2>Driver Offer ID: <span>67b0ab10e5b7c6a23dbc461d</span> <button @click="copyOfferId('driver')" class="copy-button">📋</button></h2>
          </div>
        </div>
        <!-- Offer Management -->
        <div class="offer-management-wrapper">
          <div class="offer-management-card">
            <h3>Offer Management</h3>
            <input v-model="updateData.id" placeholder="Enter Offer ID" />
            <input v-model="updateData.days" type="number" placeholder="Enter Days" />
            <input v-model="updateData.amount" type="number" placeholder="Enter Amount" />
            <button @click="updateDiscountOptions">Confirm</button>
            <p v-if="offers.length > 0 && offers[0].updatedAt">Last Updated: {{ formatDate(offers[0].updatedAt) }}</p>
          </div>
        </div>

        <!-- User Offer Applay and Captain Offer Applay (Side by Side) -->
        <div class="offer-apply-row">
          <!-- User Offer Applay -->
          <div class="offer-apply-card">
            <h3>User Offer Applay</h3>
            <label>
              <input type="checkbox" v-model="userBool" /> Apply User Offer
            </label>
            <button @click="updateUserBoolean">Confirm</button>
          </div>

          <!-- Captain Offer Applay -->
          <div class="offer-apply-card">
            <h3>Captain Offer Applay</h3>
            <label>
              <input type="checkbox" v-model="driverBool" /> Apply User Offer
            </label>
            <button @click="updateDriverBoolean">Confirm</button>
          </div>
        </div>

        <!-- Offers -->
        <div class="offers-section">
          <h3>Offers</h3>
          <div class="offer-card" v-for="offer in offers" :key="offer._id">
            <div class="avatar"></div>
            <div class="offer-details">
              <span>
                {{ offer.type === 'user' ? 'Users' : 'Captains' }}: {{ offer.numberOftrip }} trips - {{ offer.days }} day - {{ offer.amount }}EGP - {{ offer.bool ? 'Active' : 'False' }}
              </span>
              <p v-if="offer.messageUser || offer.messageDriver">
                Last Message updated {{ formatDate(offer.messageUser?.updatedAt || offer.messageDriver?.updatedAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import sidebarComponent from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";
const baseUrl = 'https://backend.fego-rides.com';

export default {
  name: "CouponsComponent",
  data() {
    return {
      activeMenu: 'Coupons',
      menuItems: [
        'Dashboard',
        'Orders',
        'Trips',
        'Users',
        'Captains',
        'Moderators',
        'Settings',
        'Coupons'
      ],
      userMessage: { text: '', sender: '', updatedAt: null },
      driverMessage: { text: '', sender: '', updatedAt: null },
      updateData: { id: '', days: null, amount: null },
      userBool: false,
      driverBool: false,
      offers: []
    };
  },
  components: {
    WaitingDriversNumber,
    sidebarComponent
  },
  created() {
    this.fetchOffers();
  },
  methods: {
    async fetchOffers() {
      try {
        const response = await axios.get(`${baseUrl}/getOffers`);
        this.offers = response.data.discount;

        const userOffer = this.offers.find(offer => offer.type === 'user');
        const driverOffer = this.offers.find(offer => offer.type === 'driver');

        if (userOffer) {
          this.userMessage = {
            text: userOffer.messageUser?.text || '',
            sender: userOffer.messageUser?.sender || '',
            updatedAt: userOffer.messageUser?.updatedAt || null
          };
          this.userBool = userOffer.bool || false;
        }

        if (driverOffer) {
          this.driverMessage = {
            text: driverOffer.messageDriver?.text || '',
            sender: driverOffer.messageDriver?.sender || '',
            updatedAt: driverOffer.messageDriver?.updatedAt || null
          };
          this.driverBool = driverOffer.bool || false;
        }

        console.log('API Response:', response.data);
      } catch (error) {
        console.error('Error fetching offers:', error);
        alert('Failed to fetch offers: ' + (error.response?.data?.message || error.message));
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
        this.fetchOffers();
      } catch (error) {
        console.error('Error updating user message:', error);
        alert('Error updating user message: ' + (error.response?.data?.message || error.message));
      }
    },
    async updateDriverMessage() {
      try {
        const response = await axios.put(`${baseUrl}/discount/67b0ab10e5b7c6a23dbc461d`, {
          text: this.driverMessage.text,
          sender: this.driverMessage.sender
        });
        this.driverMessage.updatedAt = response.data.updatedMessage.updatedAt;
        alert('Captains message updated successfully!');
        this.fetchOffers();
      } catch (error) {
        console.error('Error updating captains message:', error);
        alert('Error updating captains message: ' + (error.response?.data?.message || error.message));
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
        this.fetchOffers();
      } catch (error) {
        console.error('Error updating discount options:', error);
        alert('Error updating discount options: ' + (error.response?.data?.message || error.message));
      }
    },
    async updateUserBoolean() {
      try {
        const response = await axios.patch(`${baseUrl}/update-bool-user`, {
          bool: this.userBool,
          type: 'user'
        });
        console.log(response);
        alert('User offer activation updated successfully!');
        this.fetchOffers();
      } catch (error) {
        console.error('Error updating user boolean:', error);
        alert('Error updating user offer activation: ' + (error.response?.data?.message || error.message));
      }
    },
    async updateDriverBoolean() {
      try {
        const response = await axios.patch(`${baseUrl}/update-bool-driver`, {
          bool: this.driverBool,
          type: 'driver'
        });
        console.log(response);
        alert('Captain offer activation updated successfully!');
        this.fetchOffers();
      } catch (error) {
        console.error('Error updating driver boolean:', error);
        alert('Error updating captain offer activation: ' + (error.response?.data?.message || error.message));
      }
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    },
    copyOfferId(type) {
      const id = type === 'user' ? '67b0ab0de5b7c6a23dbc461a' : '67b0ab10e5b7c6a23dbc461d';
      navigator.clipboard.writeText(id)
          .then(() => {
            alert(`${type === 'user' ? 'User Offer ID' : 'Driver Offer ID'} copied to clipboard!`);
          })
          .catch(err => {
            console.error(`Failed to copy ${type} offer ID: `, err);
          });
    }
  }
};
</script>

<style scoped>
.fego-dashboard {
  display: flex;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background-color: #6b5b95;
  color: white;
  padding: 20px;
}

.head {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.head img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.logo {
  font-size: 24px;
  margin: 0;
  padding-bottom: 20px;
  border-bottom: 1px solid #34495e;
  width: 100%;
  text-align: center;
}

.main-menu ul {
  list-style: none;
  padding: 0;
}

.main-menu li {
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
}

.main-menu li:hover {
  background-color: #34495e;
}

.main-menu li.active {
  background-color: #3498db;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  padding: 30px;
  background-color: #f5f7fa;
}

.coupons-management {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #8e44ad;
}

.section-title {
  margin-top: 0;
  color: #2c3e50;
  font-size: 24px;
}

/* Messages Row */
.messages-row {
  display: flex;
  gap: 150px;
  margin-bottom: 20px;
}

.message-card {
  flex: 1;
  padding: 15px;
  border: 2px solid #8e44ad;
  border-radius: 8px;
  background-color: white;
}

.message-card h3 {
  color: #2c3e50;
  margin-top: 0;
  font-size: 18px;
}

/* IDs Section */
.ids {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.copy-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 2px;
  margin-left: 5px;
}

.copy-button:hover {
  opacity: 0.7;
}

/* Offer Management Wrapper for Centering */
.offer-management-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-bottom: 20px;
}

/* Offer Management Card */
.offer-management-card {
  padding: 15px;
  border: 2px solid #8e44ad;
  border-radius: 8px;
  background-color: white;
  width: 50%;
}

.offer-management-card h3 {
  color: #2c3e50;
  margin-top: 0;
  font-size: 18px;
}

/* Offer Apply Row */
.offer-apply-row {
  display: flex;
  gap: 150px;
  margin-bottom: 20px;
}

.offer-apply-card {
  flex: 1;
  padding: 15px;
  border: 2px solid #8e44ad;
  border-radius: 8px;
  background-color: white;
}

.offer-apply-card h3 {
  color: #2c3e50;
  margin-top: 0;
  font-size: 18px;
}

.offer-apply-card label {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

/* Offers Section */
.offers-section h3 {
  color: #2c3e50;
  margin-top: 0;
  font-size: 18px;
}

.offer-card {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 2px solid #8e44ad;
  border-radius: 8px;
  background-color: #f5f5ff;
  margin-bottom: 10px;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: #ddd;
  border-radius: 50%;
  margin-right: 10px;
}

.offer-details span {
  color: #2c3e50;
}

.offer-details p {
  color: #7f8c8d;
  margin: 5px 0 0;
}

/* General Input and Button Styles */
input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f5f5ff;
}

input[type="checkbox"] {
  width: auto;
  margin-right: 10px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  opacity: 0.9;
}

p {
  color: #7f8c8d;
  margin: 10px 0 0;
  font-size: 14px;
}
h3{
  text-align: center;
  font-weight: bold;
}
</style>