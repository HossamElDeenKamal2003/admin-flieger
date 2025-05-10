<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar @toggle="handleSidebarToggle" />
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header>
        <div class="header-left">
          <i class="fas fa-bars" @click="handleSidebarToggle"></i>
          <WaitingDriversNumber :waiting-captains="waitingCaptains" />
        </div>
        <div class="header-right">
          <i class="fas fa-plus-circle"></i>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="fetchUserData">Retry</button>
      </div>

      <!-- User Details -->
      <div class="user-details" v-if="userData">
        <!-- User Data -->
        <div class="user-data">
          <h2>Users Data</h2>
          <div class="data-row">
            <span>Name:</span>
            <input v-model="userData.name" @change="updateField('name', userData.name)" />
          </div>
          <div class="data-row">
            <span>Phone Number:</span>
            <input v-model="userData.phoneNumber" @change="updateField('phoneNumber', userData.phoneNumber)" />
          </div>
          <div class="data-row">
            <span>Rate:</span>
            <span class="stars">★ <input v-model.number="userData.rating" @change="updateField('rating', userData.rating)" /></span>
          </div>
          <div class="data-row">
            <span>Wallet:</span>
            <input v-model.number="userData.wallet" @change="updateField('wallet', userData.wallet)" /> EGP
          </div>
          <div class="data-row">
            <span>Block Status:</span>
            <span :class="userData.block ? 'status-blocked' : 'status-enabled'">
              {{ userData.block ? 'User is blocked' : 'User is unblocked' }}
            </span>
          </div>
        </div>

        <!-- Trip Stats -->
        <div class="trip-stats">
          <div class="stat-item completed">
            <button class="fas fa-check-circle" @click="filterTrips('COMPLETED')"></button>
            Completed Trips {{ userData.completedTrips || 0 }}
          </div>
          <div class="stat-item cancelled">
            <button class="fas fa-times-circle" @click="filterTrips('CANCELLED')"></button>
            Cancelled Trips {{ userData.cancelledTrips || 0 }}
          </div>
        </div>

        <!-- Tabs for Block -->
        <div class="tabs">
          <button
              :class="{ 'tab': true, 'active': activeTab === 'block' }"
              @click="handleTabClick('block')"
          >
            {{ userData.block ? 'Unblock' : 'Block' }}
          </button>
        </div>

        <!-- Trip History Table -->
        <div class="trip-history">
          <table>
            <thead>
            <tr>
              <th>Trip ID</th>
              <th>Vehicle</th>
              <th>Ordered Time</th>
              <th>Start Location</th>
              <th>Finish Location</th>
              <th>Value</th>
              <th>Payment</th>
              <th>Wallet</th>
              <th>Trip State</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trip, index) in paginatedData" :key="trip.tripId">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ trip.vehicle || 'N/A' }}</td>
              <td>{{ trip.orderedTime || 'N/A' }}</td>
              <td>{{ trip.startLocation || 'N/A' }}</td>
              <td>{{ trip.finishLocation || 'N/A' }}</td>
              <td>{{ trip.value || 0 }}</td>
              <td>{{ trip.payment || 'N/A' }}</td>
              <td>{{ trip.wallet || '0 EGP' }}</td>
              <td :class="trip.status === 'CANCELLED' ? 'status-cancelled' : 'status-completed'">
                {{ trip.status || 'N/A' }}
              </td>
              <td><button @click="openEditModal(trip)">Edit</button></td>
            </tr>
            <tr v-if="paginatedData.length === 0">
              <td colspan="10" class="no-data">No trip history found</td>
            </tr>
            </tbody>
          </table>

          <!-- Table Footer -->
          <div class="table-footer">
            <div>
              <p>Total Trips: {{ totalTrips || 0 }}</p>
            </div>
            <div class="pagination">
              <span>
                {{ paginationStart }}-{{ paginationEnd }}
                of {{ totalItems }} items
              </span>
              <button :disabled="currentPage === 1" @click="currentPage--">prev</button>
              <button>{{ currentPage }}</button>
              <button :disabled="currentPage >= totalPages" @click="currentPage++">next</button>
            </div>
          </div>
        </div>

        <!-- Edit Trip Modal -->
        <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
          <div class="modal-content" @click.stop>
            <h3>Edit Trip - {{ selectedTrip.tripId }}</h3>
            <div class="modal-field">
              <label>Trip ID:</label>
              <input v-model="selectedTrip.tripId" @change="updateTrip(selectedTrip.tripId, 'tripId', selectedTrip.tripId)" />
            </div>
            <div class="modal-field">
              <label>Vehicle:</label>
              <input v-model="selectedTrip.vehicle" @change="updateTrip(selectedTrip.tripId, 'vehicle', selectedTrip.vehicle)" />
            </div>
            <div class="modal-field">
              <label>Ordered Time:</label>
              <input v-model="selectedTrip.orderedTime" @change="updateTrip(selectedTrip.tripId, 'orderedTime', selectedTrip.orderedTime)" />
            </div>
            <div class="modal-field">
              <label>Start Location:</label>
              <input v-model="selectedTrip.startLocation" @change="updateTrip(selectedTrip.tripId, 'startLocation', selectedTrip.startLocation)" />
            </div>
            <div class="modal-field">
              <label>Finish Location:</label>
              <input v-model="selectedTrip.finishLocation" @change="updateTrip(selectedTrip.tripId, 'finishLocation', selectedTrip.finishLocation)" />
            </div>
            <div class="modal-field">
              <label>Value:</label>
              <input v-model.number="selectedTrip.value" @change="updateTrip(selectedTrip.tripId, 'value', selectedTrip.value)" />
            </div>
            <div class="modal-field">
              <label>Payment:</label>
              <input v-model="selectedTrip.payment" @change="updateTrip(selectedTrip.tripId, 'payment', selectedTrip.payment)" />
            </div>
            <div class="modal-field">
              <label>Wallet:</label>
              <input v-model="selectedTrip.wallet" @change="updateTrip(selectedTrip.tripId, 'wallet', selectedTrip.wallet)" />
            </div>
            <div class="modal-field">
              <label>Status:</label>
              <select v-model="selectedTrip.status" @change="updateTrip(selectedTrip.tripId, 'status', selectedTrip.status)">
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div class="modal-buttons">
              <button @click="saveTripChanges">Update</button>
              <button @click="closeEditModal">Close</button>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div class="comments-section">
          <h2>Commits</h2>
          <div class="comment" v-for="comment in userData.comments" :key="comment.id">
            <div class="comment-header">
              <img :src="comment.userImage" alt="User" class="comment-user-image" />
              <div>
                <p class="comment-user-name">{{ comment.userName }}</p>
                <p class="comment-rating">★ {{ comment.rating }}</p>
              </div>
            </div>
            <p class="comment-text">{{ comment.text }}</p>
          </div>
          <div v-if="!userData.comments || userData.comments.length === 0" class="no-comments">
            No comments found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from './sidebarComponent.vue';
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: "UserDetails",
  data() {
    return {
      isSidebarExpanded: true,
      userData: null,
      data: [],
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      error: null,
      baseUrl: 'https://backend.fego-rides.com',
      activeTab: null,
      filterStatus: null,
      totalTrips: 0,
      paginationStart: 0,
      paginationEnd: 0,
      totalItems: 0,
      showEditModal: false,
      selectedTrip: {},
    };
  },
  components: {
    WaitingDriversNumber,
    Sidebar,
  },
  computed: {
    paginatedData() {
      let filteredTrips = this.data;
      if (this.filterStatus) {
        filteredTrips = this.data.filter(trip => trip.status === this.filterStatus);
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filteredTrips.slice(start, end) || [];
    },
    paginationStartComputed() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    paginationEndComputed() {
      const end = (this.currentPage - 1) * this.itemsPerPage + this.itemsPerPage;
      return Math.min(end, this.totalItemsComputed || 0);
    },
    totalItemsComputed() {
      if (this.filterStatus) {
        return this.data.filter(trip => trip.status === this.filterStatus).length;
      }
      return this.data.length || 0;
    },
    totalTripsComputed() {
      return this.totalItemsComputed;
    },
    totalPages() {
      return Math.ceil((this.totalItemsComputed || 0) / this.itemsPerPage);
    }
  },
  watch: {
    paginationStartComputed(newValue) {
      this.paginationStart = newValue;
    },
    paginationEndComputed(newValue) {
      this.paginationEnd = newValue;
    },
    totalItemsComputed(newValue) {
      this.totalItems = newValue;
    },
    totalTripsComputed(newValue) {
      this.totalTrips = newValue;
    }
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    handleTabClick(tabName) {
      this.activeTab = tabName;
      if (tabName === 'block') {
        this.toggleBlock();
      }
    },
    async toggleBlock() {
      try {
        this.isLoading = true;
        const userId = this.$route.params.userId;
        const currentBlockStatus = this.userData.block;
        const newBlockStatus = !currentBlockStatus;

        await axios.patch(`${this.baseUrl}/user-profile/patch-block/${userId}`, {
          block: newBlockStatus
        });

        this.userData.block = newBlockStatus;
        alert(`User ${newBlockStatus ? 'blocked' : 'unblocked'} successfully`);
      } catch (error) {
        console.error('Error toggling block status:', error);
        this.$toast?.error('Failed to update block status');
      } finally {
        this.isLoading = false;
      }
    },
    async fetchUserData() {
      this.isLoading = true;
      this.error = null;
      try {
        const userId = this.$route.params.userId;
        const response = await axios.get(`${this.baseUrl}/user-profile/getUser/${userId}`);
        const user = response.data.user || response.data;
        this.userData = {
          name: user.username || `${user.firstName} ${user.lastName}` || 'N/A',
          phoneNumber: user.phoneNumber || user.mobile || 'N/A',
          rating: user.rate || 0,
          wallet: user.wallet || 0,
          completedTrips: user.completedTrips || 23,
          cancelledTrips: user.cancelledTrips || 10,
          block: user.block || false,
          trips: [],
          comments: [],
        };
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.error = 'Failed to load user data. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    async fetchTrips() {
      try {
        const userId = this.$route.params.userId;
        const response = await axios.post(`https://backend.fego-rides.com/wallet/filterTripsWithMoneyFlow`, {
          id: userId,
          type: "user",
          page: 1
        });

        const trips = response.data.trips;

        this.data = trips.map(trip => {
          const moneyFlow = trip.driverMoneyFlowId?.flow?.[0] || {};
          return {
            tripId: trip.uniqueId || 'N/A',
            vehicle: 'Car',
            orderedTime: trip.date || 'N/A',
            startLocation: 'N/A',
            finishLocation: 'N/A',
            value: moneyFlow.tripCost || 0,
            payment: moneyFlow.payCash > 0 ? 'Cash' : 'Wallet',
            wallet: `${moneyFlow.payWallet || 0} EGP`,
            status: moneyFlow.payWallet > 0 ? 'COMPLETED' : 'CANCELLED'
          };
        });
      } catch (error) {
        console.error('Error fetching trips:', error);
        this.error = 'Failed to load trips. Please try again later.';
      }
    },
    async updateField(fieldName, value) {
      try {
        this.isLoading = true;
        const userId = this.$route.params.userId;
        await axios.patch(`${this.baseUrl}/user-profile/update-field/${userId}`, {
          [fieldName]: value
        });
        alert(`${fieldName} updated successfully`);
      } catch (error) {
        console.error(`Error updating ${fieldName}:`, error);
        this.$toast?.error(`Failed to update ${fieldName}`);
        await this.fetchUserData();
      } finally {
        this.isLoading = false;
      }
    },
    async updateTrip(tripId, fieldName, value) {
      try {
        this.isLoading = true;
        const userId = this.$route.params.userId;
        const payload = {};
        if (fieldName === 'all') {
          payload.trip = value;
        } else {
          payload[fieldName] = value;
        }
        await axios.patch(`${this.baseUrl}/user-profile/update-trip/${userId}`, {
          tripId,
          ...payload
        });
        alert(`${fieldName} for trip ${tripId} updated successfully`);
      } catch (error) {
        console.error(`Error updating trip ${tripId} ${fieldName}:`, error);
        this.$toast?.error(`Failed to update trip ${tripId} ${fieldName}`);
        await this.fetchUserData();
      } finally {
        this.isLoading = false;
      }
    },
    openEditModal(trip) {
      this.selectedTrip = { ...trip };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.selectedTrip = {};
    },
    saveTripChanges() {
      this.updateTrip(this.selectedTrip.tripId, 'all', this.selectedTrip);
      this.closeEditModal();
    },
    filterTrips(status) {
      this.filterStatus = status;
      this.currentPage = 1;
    }
  },
  created() {
    this.fetchUserData();
    this.fetchTrips();
  }
};
</script>

<style scoped>
/* Base Styles */
.dashboard {
  position: relative; /* Allow absolute positioning of children */
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  display: flex;
  justify-content: end;
}
.main-content{
  width: 80%;
}
/* Sidebar */
.sidebar {
  position: absolute; /* Overlay on top of main content */
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  transition: width 0.3s ease;
  color: #ffffff;
  z-index: 1000; /* Ensure sidebar is above main content */
}

.sidebar-collapsed {
  width: 80px;
}

/* Main Content */
.main-content {
  width: 90%; /* Full width */
  background-color: #f5f7fa;
  padding: 24px;
  min-height: 100vh; /* Ensure it takes full height */
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left i {
  font-size: 20px;
  color: #6b7280;
  margin-right: 16px;
  cursor: pointer;
}

.header-right i {
  font-size: 20px;
  color: #6b7280;
}

/* User Details */
.user-details {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* User Data */
.user-data {
  border: 2px solid #8e44ad;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.user-data h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0 0 16px 0;
}

.data-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}

.data-row span:first-child {
  font-weight: 500;
  color: #6b7280;
}

.data-row span:last-child,
.data-row input {
  color: #374151;
}

.data-row input {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 60%;
}

.stars {
  color: #f59e0b;
}

/* Trip Stats */
.trip-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.stat-item button {
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 8px;
  font-size: 16px;
}

.stat-item.completed {
  background-color: #2563eb;
}

.stat-item.completed button {
  color: #ffffff;
}

.stat-item.cancelled {
  background-color: #ff4d4f;
}

.stat-item.cancelled button {
  color: #ffffff;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.tab {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.tab.active {
  background-color: #ff4d4f;
  color: white;
}

.tab:not(.active) {
  background-color: #ecf0f1;
  color: #34495e;
}

/* Trip History Table */
.trip-history {
  margin-bottom: 16px;
}

.trip-history table {
  width: 100%;
  border-collapse: collapse;
}

.trip-history th,
.trip-history td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.trip-history th {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background-color: #f9fafb;
  text-transform: uppercase;
}

.trip-history td {
  font-size: 14px;
  color: #374151;
}

.status-completed {
  color: #28c76f;
}

.status-cancelled {
  color: #ff4d4f;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-footer p {
  color: #2c3e50;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #6b48ff;
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
  color: #374151;
}

/* Comments Section */
.comments-section {
  margin-top: 16px;
}

.comments-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0 0 16px 0;
}

.comment {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-user-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2a44;
  margin: 0;
}

.comment-rating {
  font-size: 12px;
  color: #f59e0b;
  margin: 2px 0 0 0;
}

.comment-text {
  font-size: 14px;
  color: #374151;
  margin: 0;
}

.no-comments {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* Error Message */
.error-message {
  background-color: #ffebee;
  color: #ff4d4f;
  padding: 15px;
  margin: 20px 0;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6b48ff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-field {
  margin-bottom: 15px;
}

.modal-field label {
  display: block;
  margin-bottom: 5px;
}

.modal-field input,
.modal-field select {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button:first-child {
  background-color: #6b48ff;
  color: white;
}

.modal-buttons button:last-child {
  background-color: #ff4d4f;
  color: white;
}

.trip-history table td button {
  padding: 5px 10px;
  background-color: #6b48ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Status Indicators */
.status-enabled {
  color: #28c76f;
  font-weight: 600;
}

.status-blocked {
  color: #ff4d4f;
  font-weight: 600;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }

  .sidebar-collapsed {
    width: 80px;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    margin-top: 8px;
  }

  .trip-stats {
    flex-direction: column;
  }

  .trip-history table {
    font-size: 12px;
  }

  .trip-history th,
  .trip-history td {
    padding: 8px;
  }
}

@media (min-width: 769px) {
  .sidebar {
    width: 250px;
  }
}
</style>