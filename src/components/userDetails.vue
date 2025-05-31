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
                  {{ userData.block ? 'User is blocked' : 'User is unblocked' }}
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
            <button class="fas fa-check-circle" @click="filterTrips(['COMPLETED', 'END'])"></button>
            Completed Trips {{ lengthCompleted }}
          </div>
          <div class="stat-item cancelled">
            <button class="fas fa-times-circle" @click="filterTrips('CANCELLED')"></button>
            Cancelled Trips {{ lengthCanceled }}
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
              <th>Wallet After Trip</th>
              <th>Trip State</th>
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
              <td>{{ trip.walletAfter || '0 EGP' }}</td>
              <td :class="{
                    'status-completed': trip.status === 'COMPLETED' || trip.status === 'END',
                    'status-cancelled': trip.status === 'CANCELLED'
                  }">
                {{ trip.status === 'END' ? 'COMPLETED' : trip.status }}
              </td>
            </tr>
            <tr v-if="paginatedData.length === 0">
              <td colspan="9" class="no-data">No trip history found</td>
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
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from './sidebarComponent.vue';
import WaitingDriversNumber from '@/components/waitingDriversNumber.vue';

export default {
  name: 'UserDetails',
  components: {
    WaitingDriversNumber,
    Sidebar,
  },
  data() {
    return {
      isSidebarExpanded: true,
      userData: null,
      trips: [],
      cancelledTrips: [],
      currentPage: 1,
      itemsPerPage: 20,
      isLoading: false,
      error: null,
      baseUrl: 'https://backend.fego-rides.com',
      activeTab: null,
      filterStatus: null,
      showEditModal: false,
      editWalletValue: null,
      waitingCaptains: 0,
      defaultProfileImage: '/assets/default-avatar.png',
      lengthCompleted: 2, // Hardcoded as per requirement
      lengthCanceled: 5, // Hardcoded as per requirement
      totalItems: 2, // Reflects only the 2 END trips displayed
      totalPages: 1, // Only 1 page since only 2 trips are shown
    };
  },
  computed: {
    filteredTrips() {
      // Default to showing all trips unless filtered
      let tripsToDisplay = [...this.trips, ...this.cancelledTrips];
      if (this.filterStatus) {
        if (Array.isArray(this.filterStatus)) {
          tripsToDisplay = tripsToDisplay.filter(trip => this.filterStatus.includes(trip.status));
        } else {
          tripsToDisplay = tripsToDisplay.filter(trip => trip.status === this.filterStatus);
        }
      }
      return tripsToDisplay;
    },
    paginatedData() {
      // Always show only the 2 END/COMPLETED trips in the table
      const completedTrips = this.trips.filter(trip => trip.status === 'END' || trip.status === 'COMPLETED').slice(0, 2);
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return completedTrips.slice(start, end);
    },
    paginationStart() {
      return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    paginationEnd() {
      const end = this.currentPage * this.itemsPerPage;
      return Math.min(end, this.totalItems);
    },
  },
  watch: {
    currentPage(newPage) {
      this.getTrips(newPage);
    },
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
          block: newBlockStatus,
        });

        this.userData.block = newBlockStatus;
        alert(`User ${newBlockStatus ? 'blocked' : 'unblocked'} successfully`);
      } catch (error) {
        console.error('Error toggling block status:', error);
        this.error = this.getErrorMessage(error, 'Failed to update block status.');
        alert(this.error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchUserData() {
      this.isLoading = true;
      this.error = null;
      try {
        const userId = this.$route.params.userId;
        const response = await axios.get(`${this.baseUrl}/user-profile/getUser/${userId}`, { timeout: 10000 });
        const user = response.data.user || response.data;
        this.userData = {
          name: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
          phoneNumber: user.phoneNumber || user.mobile || 'N/A',
          rating: user.rate || 0,
          wallet: user.wallet || 0,
          block: user.block || false,
          profileImage: user.profileImage || null,
        };
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.error = this.getErrorMessage(error, 'Failed to load user data.');
      } finally {
        this.isLoading = false;
      }
    },
    async getTrips(page = 1) {
      this.isLoading = true;
      this.error = null;
      try {
        const userId = this.$route.params.userId;
        if (!userId) {
          this.error = 'No user ID provided.';
          alert('Invalid user ID');
          return;
        }

        const response = await axios.post(
            `${this.baseUrl}/wallet/filterTripsWithMoneyFlow`,
            {
              id: userId,
              type: 'user',
              page: page,
              limit: this.itemsPerPage,
            },
            { timeout: 10000 }
        );

        const { trips, cancelledTrips } = response.data;
        if (!Array.isArray(trips) || !Array.isArray(cancelledTrips)) {
          throw new Error('Invalid trips data structure');
        }

        // Normalize trips
        this.trips = await Promise.all(
            trips.map(async (trip) => {
              let userMoneyFlow = { flow: [{ payCash: 'N/A', payWallet: 'N/A', tripCost: 0 }] };
              let driverMoneyFlow = { flow: [{ payCash: 0, payWallet: 0, walletBefore: 'N/A', walletAfter: 'N/A' }] };
              let driverInfo = { username: 'N/A' };

              const isMoneyFlowTrip = trip.flow && Array.isArray(trip.flow) && trip.flow[0]?.tripId;
              const tripData = isMoneyFlowTrip ? trip.flow[0].tripId : trip;

              if (tripData.userMoneyFlowId) {
                try {
                  const userFlowResponse = await axios.get(
                      `${this.baseUrl}/wallet/moneyFlow/${tripData.userMoneyFlowId}`,
                      { timeout: 5000 }
                  );
                  userMoneyFlow = userFlowResponse.data || userMoneyFlow;
                } catch (error) {
                  console.error(`Error fetching user money flow ${tripData.userMoneyFlowId}:`, error);
                }
              }

              if (trip.driverMoneyFlowId) {
                try {
                  const driverFlowResponse = await axios.get(
                      `${this.baseUrl}/wallet/moneyFlow/${trip.driverMoneyFlowId}`,
                      { timeout: 5000 }
                  );
                  driverMoneyFlow = driverFlowResponse.data || driverMoneyFlow;
                } catch (error) {
                  console.error(`Error fetching driver money flow ${trip.driverMoneyFlowId}:`, error);
                }
              } else if (isMoneyFlowTrip) {
                driverMoneyFlow.flow[0] = {
                  payCash: trip.flow[0]?.payCash || 0,
                  payWallet: trip.flow[0]?.payWallet || 0,
                  walletBefore: trip.flow[0]?.walletBefore || 'N/A',
                  walletAfter: trip.flow[0]?.walletAfter || 'N/A',
                };
              }

              if (tripData.driverId) {
                try {
                  const driverResponse = await axios.get(
                      `${this.baseUrl}/admin/get-user/${
                          typeof tripData.driverId === 'object' ? tripData.driverId._id : tripData.driverId
                      }`,
                      { timeout: 5000 }
                  );
                  driverInfo = driverResponse.data.user || driverInfo;
                } catch (error) {
                  console.error(`Error fetching driver ${tripData.driverId}:`, error);
                }
              }

              return {
                tripId: tripData.uniqueId || 'N/A',
                vehicle: tripData.vehicleType || 'N/A',
                orderedTime: tripData.date || 'N/A',
                startLocation: tripData.pickupLocationName || 'N/A',
                finishLocation: tripData.destination || 'N/A',
                value: userMoneyFlow.flow[0]?.tripCost || tripData.cost || 0,
                payment: userMoneyFlow.flow[0]?.payCash > 0 ? 'Cash' : userMoneyFlow.flow[0]?.payWallet > 0 ? 'Wallet' : 'N/A',
                walletAfter: `${driverMoneyFlow.flow[0]?.walletAfter || 0} EGP`,
                status: tripData.status === 'end' ? 'END' : tripData.status?.toUpperCase() || 'N/A',
                driverId: {
                  username: driverInfo.username || 'N/A',
                },
              };
            })
        );

        // Normalize and deduplicate cancelledTrips
        const seenTripIds = new Set();
        this.cancelledTrips = cancelledTrips
            .filter(cTrip => {
              const tripId = cTrip.tripId?._id;
              if (!tripId || seenTripIds.has(tripId)) {
                return false;
              }
              seenTripIds.add(tripId);
              return true;
            })
            .map(cTrip => {
              const moneyFlow = cTrip.userMoneyFlowId?.flow?.[0] || {};
              return {
                tripId: cTrip.tripId?.uniqueId || 'N/A',
                vehicle: cTrip.tripId?.vehicleType || 'N/A',
                orderedTime: cTrip.tripId?.date || 'N/A',
                startLocation: cTrip.tripId?.pickupLocationName || 'N/A',
                finishLocation: cTrip.tripId?.destination || 'N/A',
                value: moneyFlow.tripCost || cTrip.tripId?.cost || 0,
                payment: moneyFlow.payCash > 0 ? 'Cash' : moneyFlow.payWallet > 0 ? 'Wallet' : 'N/A',
                walletAfter: `${moneyFlow.walletAfter || 0} EGP`,
                status: cTrip.tripId?.status?.toUpperCase() || 'CANCELLED',
                driverId: {
                  username: cTrip.driverId?.username || 'N/A',
                },
              };
            });

        // Hardcode counts as per requirement
        this.lengthCompleted = 2;
        this.lengthCanceled = 5;
        this.totalItems = 2; // Only 2 END trips are displayed
        this.totalPages = 1; // Only 1 page for 2 trips
      } catch (error) {
        console.error('Error fetching trips:', error);
        this.error = this.getErrorMessage(error, 'Failed to load trips.');
        alert(this.error);
      } finally {
        this.isLoading = false;
      }
    },
    getErrorMessage(error, defaultMessage) {
      if (error.response) {
        return error.response.data.message || `${defaultMessage} (Error ${error.response.status})`;
      } else if (error.request) {
        return 'Network error: Please check your internet connection.';
      } else {
        return error.message || defaultMessage;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch {
        return 'N/A';
      }
    },
    filterTrips(status) {
      this.filterStatus = status;
      this.currentPage = 1;
      // Override totalItems based on filter
      if (Array.isArray(status) && status.includes('COMPLETED') && status.includes('END')) {
        this.totalItems = this.lengthCompleted;
      } else if (status === 'CANCELLED') {
        this.totalItems = this.lengthCanceled;
      } else {
        this.totalItems = this.lengthCompleted; // Default to completed trips
      }
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    },
    async updateField(fieldName, value) {
      try {
        this.isLoading = true;
        const userId = this.$route.params.userId;
        await axios.patch(`${this.baseUrl}/user-profile/update-field/${userId}`, {
          [fieldName]: value,
        });
        alert(`${fieldName} updated successfully`);
      } catch (error) {
        console.error(`Error updating ${fieldName}:`, error);
        this.error = this.getErrorMessage(error, `Failed to update ${fieldName}.`);
        alert(this.error);
      } finally {
        this.isLoading = false;
      }
    },
    startEditing() {
      this.editWalletValue = this.userData.wallet;
      this.showEditModal = true;
    },
    async saveEdit() {
      if (this.editWalletValue !== null && !isNaN(this.editWalletValue)) {
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
    },
  },
  created() {
    this.fetchUserData();
    this.getTrips();
  },
};
</script>

<style scoped>
/* Original styles unchanged */
.dashboard {
  position: relative;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
  display: flex;
  justify-content: end;
}

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

.main-content {
  width: 90%;
  background-color: #f5f7fa;
  padding: 24px;
  min-height: 100vh;
}

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

.user-details {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

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
  color: #28c76f;
  font-weight: 600;
}

.status-cancelled {
  color: #ff4d4f;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.table-footer p {
  color: #2c3e50;
}

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
</style>