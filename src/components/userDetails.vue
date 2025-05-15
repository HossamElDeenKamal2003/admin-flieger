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
          <div class="user-data-container">
            <div class="profile-image-container">
              <img
                  :src="userData.profileImage || defaultProfileImage"
                  alt="User Profile"
                  class="profile-image"
                  @error="handleImageError"
              />
            </div>
            <div class="user-data-details">
              <div class="data-row">
                <span>Name:</span>
                <span>{{ userData.name || 'N/A' }}</span>
              </div>
              <div class="data-row">
                <span>Phone Number:</span>
                <span>{{ userData.phoneNumber || 'N/A' }}</span>
              </div>
              <div class="data-row">
                <span>Rate:</span>
                <span class="stars">★ {{ userData.rating || 0 }}</span>
              </div>
              <div class="data-row">
                <span>Wallet:</span>
                <div class="field-container">
                  <span>{{ userData.wallet || 0 }} EGP</span>
                  <font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startEditing('wallet')" />
                </div>
              </div>
              <div class="data-row">
                <span>Block Status:</span>
                <span :class="userData.block ? 'status-enabled' : 'status-blocked'">
                  {{ userData.block ? 'User is unblocked' : 'User is blocked' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Wallet Modal -->
        <div v-if="showEditModal" class="modal-overlay" @click="cancelEdit">
          <div class="modal-content" @click.stop>
            <h3>Edit Wallet</h3>
            <div class="modal-field">
              <label>Wallet (EGP):</label>
              <input
                  v-model.number="editWalletValue"
                  type="number"
                  @keyup.enter="saveEdit"
                  @blur="saveEdit"
              />
            </div>
            <div class="modal-buttons">
              <button @click="saveEdit">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Trip Stats -->
        <div class="trip-stats">
          <div class="stat-item completed">
            <button class="fas fa-check-circle" @click="filterTrips('COMPLETED')"></button>
            Completed Trips {{ completedTripsCount }}
          </div>
          <div class="stat-item cancelled">
            <button class="fas fa-times-circle" @click="filterTrips('CANCELLED')"></button>
            Cancelled Trips {{ cancelledTripsCount }}
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
              <td>{{ formatDate(trip.orderedTime) || 'N/A' }}</td>
              <td>{{ trip.startLocation || 'N/A' }}</td>
              <td>{{ trip.finishLocation || 'N/A' }}</td>
              <td>{{ trip.value || 0 }} EGP</td>
              <td>{{ trip.payment || 'N/A' }}</td>
              <td>{{ trip.wallet || '0 EGP' }}</td>
              <td :class="{'status-end': trip.status === 'end', 'status-cancelled': trip.status === 'cancelled'}">{{ trip.status || 'N/A' }}</td>
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
              <p>Total Trips: {{ totalItems }}</p>
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
        <div v-if="showEditTripModal" class="modal-overlay" @click="closeEditModal">
          <div class="modal-content" @click.stop>
            <h3>Edit Trip - {{ selectedTrip.tripId }}</h3>
            <div class="modal-field">
              <label>Status:</label>
              <select v-model="selectedTrip.status" @change="updateTrip(selectedTrip.tripId, 'status', selectedTrip.status)">
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="END">END</option>
              </select>
            </div>
            <div class="modal-buttons">
              <button @click="saveTripChanges">Update</button>
              <button @click="closeEditModal">Close</button>
            </div>
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
  components: {
    WaitingDriversNumber,
    Sidebar,
  },
  data() {
    return {
      isSidebarExpanded: true,
      userData: null,
      tripsData: [],
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      error: null,
      baseUrl: 'https://backend.fego-rides.com',
      activeTab: null,
      filterStatus: null,
      showEditModal: false,
      showEditTripModal: false,
      selectedTrip: {},
      editWalletValue: null,
      waitingCaptains: 0,
      defaultProfileImage: '/assets/default-avatar.png', // Fallback image
    };
  },
  computed: {
    completedTripsCount() {
      return this.tripsData.filter(trip =>
          trip.status === 'COMPLETED' || trip.status === 'END'
      ).length;
    },
    cancelledTripsCount() {
      return this.tripsData.filter(trip => trip.status === 'CANCELLED').length;
    },
    filteredTrips() {
      if (!this.filterStatus) return this.tripsData;

      if (this.filterStatus === 'COMPLETED') {
        return this.tripsData.filter(trip =>
            trip.status === 'COMPLETED' || trip.status === 'END'
        );
      }
      return this.tripsData.filter(trip => trip.status === this.filterStatus);
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredTrips.slice(start, end);
    },
    totalItems() {
      return this.filteredTrips.length;
    },
    totalPages() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    paginationStart() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    paginationEnd() {
      const end = this.currentPage * this.itemsPerPage;
      return Math.min(end, this.totalItems);
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
        const newBlockStatus = !this.userData.block;

        await axios.patch(`${this.baseUrl}/user-profile/patch-block/${userId}`, {
          block: newBlockStatus
        });

        this.userData.block = newBlockStatus;
        alert(`User ${newBlockStatus ? 'blocked' : 'unblocked'} successfully`);
      } catch (error) {
        console.error('Error toggling block status:', error);
        alert('Failed to update block status');
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
          block: user.block || false,
          profileImage: user.profileImage || null
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
        this.isLoading = true;
        const userId = this.$route.params.userId;
        const response = await axios.post(`${this.baseUrl}/wallet/filterTripsWithMoneyFlow`, {
          id: userId,
          type: "user",
          page: 1
        });

        this.tripsData = response.data.trips.map(trip => {
          const moneyFlow = trip.driverMoneyFlowId?.flow?.[0] || {};
          return {
            tripId: trip.uniqueId || 'N/A',
            vehicle: trip.vehicleType || 'Car',
            orderedTime: trip.date,
            startLocation: trip.startLocation?.address || 'N/A',
            finishLocation: trip.finishLocation?.address || 'N/A',
            value: moneyFlow.tripCost || 0,
            payment: moneyFlow.payCash > 0 ? 'Cash' : 'Wallet',
            wallet: `${moneyFlow.payWallet || 0} EGP`,
            status: trip.status || 'N/A'
          };
        });
      } catch (error) {
        console.error('Error fetching trips:', error);
        this.error = 'Failed to load trips. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    filterTrips(status) {
      this.filterStatus = status;
      this.currentPage = 1;
    },
    openEditModal(trip) {
      this.selectedTrip = { ...trip };
      this.showEditTripModal = true;
    },
    closeEditModal() {
      this.showEditTripModal = false;
      this.selectedTrip = {};
    },
    async saveTripChanges() {
      try {
        this.isLoading = true;
        const userId = this.$route.params.userId;
        await axios.patch(`${this.baseUrl}/user-profile/update-trip/${userId}`, {
          tripId: this.selectedTrip.tripId,
          status: this.selectedTrip.status
        });

        // Update local data
        const index = this.tripsData.findIndex(t => t.tripId === this.selectedTrip.tripId);
        if (index !== -1) {
          this.tripsData[index].status = this.selectedTrip.status;
        }

        alert('Trip updated successfully');
        this.closeEditModal();
      } catch (error) {
        console.error('Error updating trip:', error);
        alert('Failed to update trip');
      } finally {
        this.isLoading = false;
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
        alert(`Failed to update ${fieldName}`);
      } finally {
        this.isLoading = false;
      }
    },
    startEditing() {
      this.editWalletValue = this.userData.wallet;
      this.showEditModal = true;
    },
    async saveEdit() {
      if (this.editWalletValue !== null) {
        await this.updateField('wallet', this.editWalletValue);
        this.userData.wallet = this.editWalletValue;
      }
      this.cancelEdit();
    },
    cancelEdit() {
      this.showEditModal = false;
      this.editWalletValue = null;
    },
    handleImageError(event) {
      event.target.src = this.defaultProfileImage;
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
  position: relative;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  display: flex;
  justify-content: end;
}

/* Sidebar */
.sidebar {
  position: absolute;
  top: 0;
  left: 0;
  width: 250px;
  height: 100%;
  transition: width 0.3s ease;
  color: #ffffff;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 80px;
}

/* Main Content */
.main-content {
  width: 90%;
  background-color: #f5f7fa;
  padding: 24px;
  min-height: 100vh;
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

.user-data-container {
  display: flex;
  gap: 24px;
}

.profile-image-container {
  flex: 0 0 auto;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid #8e44ad;
  object-fit: cover;
}

.user-data-details {
  flex: 1;
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

.field-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-icon {
  cursor: pointer;
  color: #6b48ff;
  font-size: 14px;
}

.edit-icon:hover {
  color: #ff4d4f;
}

.stars {
  color: #f59e0b;
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

.status-completed {
  color: #6b48ff;
  font-weight: 600;
}

.status-cancelled {
  color: red;
  font-weight: 600;
  text-decoration: line-through;
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
  margin-top: 16px;
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

@media (max-width: 2000px) {
  .main-content {
    width: 85%;
  }
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

  .user-data-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-image-container {
    margin-bottom: 16px;
  }
}

@media (min-width: 769px) {
  .sidebar {
    width: 250px;
  }
}

.status-cancelled {
  color: red;
}
.status-completed {
  color: green;
}
.status-ended {
  color: purple;
}
.status-cancelled {
  color: red;
}
.status-end {
  color: purple;
}
</style>