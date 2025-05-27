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
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="getTrips">Retry</button>
      </div>

      <!-- Trip Details -->
      <div class="trip-details" v-if="trips.length > 0">
        <!-- Trip Data -->
        <div class="trip-data">
          <h2>Trips Data</h2>
          <div class="trip-data-container">
            <div class="profile-image-container">
              <!-- Placeholder for trip-related image or icon if needed -->
              <img src="https://via.placeholder.com/100" alt="Trip Icon" class="profile-image" />
            </div>
            <div class="trip-data-details">
              <div class="data-row">
                <span>Total Trips:</span>
                <span>{{ allCount }}</span>
              </div>
              <div class="data-row">
                <span>Pending Trips:</span>
                <span>{{ pendingCount }}</span>
              </div>
              <div class="data-row">
                <span>Completed Trips:</span>
                <span>{{ completedCount }}</span>
              </div>
              <div class="data-row">
                <span>Cancelled Trips:</span>
                <span>{{ cancelledByUserCount + cancelledByCaptainCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Trip Modal -->
        <div v-if="showEditTripModal" class="modal-overlay" @click="closeEditModal">
          <div class="modal-content" @click.stop>
            <h3>Edit Trip - {{ selectedTrip.uniqueId }}</h3>
            <div class="modal-field">
              <label>Status:</label>
              <select v-model="selectedTrip.status" @change="updateTrip(selectedTrip._id, 'status', selectedTrip.status)">
                <option value="pending">PENDING</option>
                <option value="end">COMPLETED</option>
                <option value="cancelledByUser">CANCELLED</option>
                <option value="cancelledByCaptain">CANCELLED BY CAPTAIN</option>
              </select>
            </div>
            <div class="modal-buttons">
              <button @click="saveTripChanges">Update</button>
              <button @click="closeEditModal">Close</button>
            </div>
          </div>
        </div>

        <!-- Trip Stats -->
        <div class="trip-stats">
          <div class="stat-item completed">
            <button class="fas fa-check-circle" @click="setActiveTab('end')"></button>
            Completed Trips {{ completedCount }}
          </div>
          <div class="stat-item cancelled">
            <button class="fas fa-times-circle" @click="setActiveTab('cancelledByUser')"></button>
            Cancelled Trips {{ cancelledByUserCount + cancelledByCaptainCount }}
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button :class="{ 'tab': true, 'active': activeTab === 'all' }" @click="setActiveTab('all')">
            All <span class="count-badge">{{ allCount }}</span>
          </button>
          <button :class="{ 'tab': true, 'active': activeTab === 'pending' }" @click="setActiveTab('pending')">
            PENDING <span class="count-badge">{{ pendingCount }}</span>
          </button>
          <button :class="{ 'tab': true, 'active': activeTab === 'end' }" @click="setActiveTab('end')">
            COMPLETED <span class="count-badge">{{ completedCount }}</span>
          </button>
          <button :class="{ 'tab': true, 'active': activeTab === 'cancelledByUser' }" @click="setActiveTab('cancelledByUser')">
            CANCELLED <span class="count-badge">{{ cancelledByUserCount }}</span>
          </button>
          <button :class="{ 'tab': true, 'active': activeTab === 'cancelledByCaptain' }" @click="setActiveTab('cancelledByCaptain')">
            CANCELLED BY CAPTAIN <span class="count-badge">{{ cancelledByCaptainCount }}</span>
          </button>
        </div>

        <!-- Trip History Table -->
        <div class="trip-history">
          <table>
            <thead>
            <tr>
              <th>User Name</th>
              <th>User Phone</th>
              <th>Driver Name</th>
              <th>Driver Phone</th>
              <th>Vehicle</th>
              <th>Trip ID</th>
              <th>Ordered Time</th>
              <th>Start Location</th>
              <th>Finish Location</th>
              <th>Value</th>
              <th>Payment</th>
              <th>Wallet User After Trip</th>
              <th>Wallet Driver After Trip</th>
              <th>Trip Comment</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="trip in paginatedTrips" :key="trip._id">
              <td>
                <div style="display: flex; align-items: center;">
                  <span>{{ trip.userId?.username || 'N/A' }}</span>
                </div>
              </td>
              <td>{{ trip.userId?.phoneNumber || 'N/A' }}</td>
              <td>
                <div style="display: flex; align-items: center;">
                  <img
                      v-if="trip.driverId?.profile_image"
                      :src="trip.driverId?.profile_image"
                      alt="Driver Image"
                      style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 8px;"
                  >
                  <span>{{ trip.driverId?.username || 'N/A' }}</span>
                </div>
              </td>
              <td>{{ trip.driverId?.phoneNumber || 'N/A' }}</td>
              <td>
                  <span v-if="trip.driverId">
                    {{ trip.vehicleType || 'N/A' }}
                    ({{ trip.driverId?.username || 'N/A' }})
                  </span>
                <span v-else>
                    {{ trip.vehicleType || 'N/A' }}
                  </span>
              </td>
              <td>{{ trip.uniqueId || 'N/A' }}</td>
              <td>{{ formatDate(trip.createdAt) }}</td>
              <td>{{ trip.pickupLocationName || 'N/A' }}</td>
              <td>{{ trip.destination || 'N/A' }}</td>
              <td>{{ formatCurrency(trip.cost || 0) }} EGP</td>
              <td>
                <template v-if="trip.userMoneyFlowId?.flow?.[0]">
                  {{ formatCurrency(trip.userMoneyFlowId.flow[0].payWallet) }} Wallet +
                  {{ formatCurrency(trip.userMoneyFlowId.flow[0].payCash) }} Cash EGP
                  <br>
                  <small>Total: {{ formatCurrency(
                      (trip.userMoneyFlowId.flow[0].payWallet || 0) +
                      (trip.userMoneyFlowId.flow[0].payCash || 0)
                  ) }} EGP</small>
                </template>
                <span v-else>N/A</span>
              </td>
              <td>{{ formatCurrency(trip.userMoneyFlowId?.flow?.[0]?.walletAfter || 0) }} EGP</td>
              <td>
                  <span
                      :class="{
                      'wallet-non-zero': trip.driverMoneyFlowId?.flow?.[0]?.walletAfter !== 0,
                      'wallet-zero': !trip.driverMoneyFlowId?.flow?.[0]?.walletAfter
                    }"
                  >
                    {{ formatCurrency(trip.driverMoneyFlowId?.flow?.[0]?.walletAfter || 0) }} EGP
                  </span>
              </td>
              <td>{{ trip.comment || 'N/A' }}</td>
              <td>
                <button @click="openEditModal(trip)" class="edit-btn">Edit</button>
              </td>
            </tr>
            <tr v-if="paginatedTrips.length === 0">
              <td colspan="15" class="no-data">No trips available</td>
            </tr>
            </tbody>
          </table>

          <!-- Table Footer -->
          <div class="table-footer">
            <div>
              <p>Total Trips: {{ filteredTrips.length }}</p>
            </div>
            <div class="pagination">
              <span>
                {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredTrips.length) }}
                of {{ filteredTrips.length }} items
              </span>
              <button :disabled="currentPage === 1" @click="currentPage--"> prev</button>
              <button disabled>{{ currentPage }}</button>
              <button :disabled="currentPage >= totalPages" @click="currentPage++">next </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "./sidebarComponent.vue";
import axios from "axios";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: "tripsComponent",
  components: {
    WaitingDriversNumber,
    Sidebar,
  },
  data() {
    return {
      activeTab: "all",
      trips: [],
      cancelledByUserTrips: [],
      cancelledByCaptainTrips: [],
      isSidebarExpanded: true,
      baseUrl: "https://backend.fego-rides.com",
      loading: false,
      error: null,
      searchUniqueId: "",
      vehicleTypeFilter: "",
      dateFilter: "",
      currentPage: 1,
      itemsPerPage: 10,
      adminUsername: "",
      waitingCaptains: 0,
      showEditTripModal: false,
      selectedTrip: {},
    };
  },
  computed: {
    filteredTrips() {
      let filtered = [];

      if (this.activeTab === 'cancelledByUser') {
        filtered = this.cancelledByUserTrips;
      } else if (this.activeTab === 'cancelledByCaptain') {
        filtered = this.cancelledByCaptainTrips;
      } else {
        filtered = this.trips;

        if (this.activeTab !== "all") {
          filtered = filtered.filter((trip) => trip.status === this.activeTab);
        }
      }

      if (this.searchUniqueId) {
        const query = this.searchUniqueId.toLowerCase();
        filtered = filtered.filter((trip) => {
          const uniqueId = trip.uniqueId || '';
          return uniqueId.toLowerCase().includes(query);
        });
      }

      if (this.vehicleTypeFilter) {
        filtered = filtered.filter(
            (trip) => trip.vehicleType === this.vehicleTypeFilter
        );
      }

      if (this.dateFilter) {
        filtered = filtered.filter((trip) => {
          const tripDate = new Date(trip.createdAt).toISOString().split("T")[0];
          return tripDate === this.dateFilter;
        });
      }

      return filtered;
    },
    paginatedTrips() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredTrips.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredTrips.length / this.itemsPerPage);
    },
    allCount() {
      return this.trips.length;
    },
    pendingCount() {
      return this.trips.filter((trip) => trip.status === "pending").length;
    },
    completedCount() {
      return this.trips.filter((trip) => trip.status === "end").length;
    },
    cancelledByUserCount() {
      return this.cancelledByUserTrips.length;
    },
    cancelledByCaptainCount() {
      return this.cancelledByCaptainTrips.length;
    },
  },
  watch: {
    searchUniqueId() {
      this.currentPage = 1;
    },
    vehicleTypeFilter() {
      this.currentPage = 1;
    },
    dateFilter() {
      this.currentPage = 1;
    },
    activeTab() {
      this.currentPage = 1;
    },
  },
  created() {
    this.adminUsername = localStorage.getItem('username');
    this.getTrips();
    this.getCancelledByUserTrips();
    this.getCancelledByCaptainTrips();
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    setActiveTab(tab) {
      this.activeTab = tab;
      if (tab === 'cancelledByUser') {
        this.getCancelledByUserTrips();
      } else if (tab === 'cancelledByCaptain') {
        this.getCancelledByCaptainTrips();
      }
    },
    async getTrips() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.post(`${this.baseUrl}/wallet/get-data`);
        this.trips = response.data.trips || [];
        console.log("Trips:", this.trips);
      } catch (error) {
        this.error = "Failed to fetch trips. Please try again.";
        console.error("Error fetching trips:", error);
      } finally {
        this.loading = false;
      }
    },
    async getCancelledByUserTrips() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get(`${this.baseUrl}/admin/get-cancelled-trips`);
        this.cancelledByUserTrips = response.data.trips || [];
        console.log("Cancelled by User Trips:", this.cancelledByUserTrips);
      } catch (error) {
        this.error = "Failed to fetch cancelled by user trips. Please try again.";
        console.error("Error fetching cancelled by user trips:", error);
      } finally {
        this.loading = false;
      }
    },
    async getCancelledByCaptainTrips() {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get(`${this.baseUrl}/admin/get-cancelled-by-driver`);
        this.cancelledByCaptainTrips = response.data.trips || [];
        console.log("Cancelled by Captain Trips:", this.cancelledByCaptainTrips);
      } catch (error) {
        this.error = "Failed to fetch cancelled by captain trips. Please try again.";
        console.error("Error fetching cancelled by captain trips:", error);
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(value) {
      return Number(value || 0).toFixed(2);
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    openEditModal(trip) {
      this.selectedTrip = { ...trip };
      this.showEditTripModal = true;
    },
    closeEditModal() {
      this.showEditTripModal = false;
      this.selectedTrip = {};
    },
    async updateTrip(tripId, field, value) {
      try {
        await axios.put(`${this.baseUrl}/trips/${tripId}`, { [field]: value });
        this.getTrips(); // Refresh data
        this.closeEditModal();
      } catch (error) {
        this.error = "Failed to update trip. Please try again.";
        console.error("Error updating trip:", error);
      }
    },
    saveTripChanges() {
      this.updateTrip(this.selectedTrip._id, 'status', this.selectedTrip.status);
    },
  },
};
</script>

<style scoped>
/* Base Styles */
.dashboard {
  display: flex;
  min-height: 100vh;
  font-family: "Arial", sans-serif;
}

/* Sidebar */
.sidebar {
  width: 250px;
  transition: width 0.3s ease;
  background-color: #f8f9fa;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.sidebar-collapsed {
  width: 80px;
}

/* Main Content */
.main-content {
  flex: 1;
  background-color: #ffffff;
  padding: 24px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content-expanded {
  margin-left: 250px;
}

.main-content-expanded.sidebar-collapsed {
  margin-left: 80px;
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

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  padding: 16px;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-message button {
  padding: 4px 12px;
  background-color: #dc2626;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Trip Details */
.trip-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Trip Data */
.trip-data {
  margin-bottom: 24px;
}

.trip-data-container {
  display: flex;
  align-items: center;
}

.profile-image-container {
  margin-right: 16px;
}

.profile-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.trip-data-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.data-row span:first-child {
  font-weight: 500;
  color: #6b7280;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}

.modal-field {
  margin: 15px 0;
  text-align: left;
}

.modal-field label {
  display: block;
  margin-bottom: 5px;
}

.modal-field input,
.modal-field select {
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
}

.modal-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button:first-child {
  background-color: #2563eb;
  color: #fff;
}

.modal-buttons button:last-child {
  background-color: #6b7280;
  color: #fff;
}

/* Trip Stats */
.trip-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  padding: 12px;
  border-radius: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-item.completed {
  background-color: #10b981;
}

.stat-item.cancelled {
  background-color: #ef4444;
}

.stat-item button {
  background: none;
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.tabs .tab {
  flex: 1;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabs .tab.active {
  color: #000000;
  border-bottom: 2px solid #2563eb;
}

.count-badge {
  display: inline-block;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
  background-color: #e5e7eb;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  margin-left: 8px;
  padding: 0 6px;
  text-align: center;
}

/* Trip History */
.trip-history {
  flex: 1;
  display: flex;
  flex-direction: column;
}

table {
  width: 100%;
  border-collapse: collapse;
  flex: 1;
  display: flex;
  flex-direction: column;
}

thead {
  flex-shrink: 0;
}

tbody {
  flex: 1;
  overflow-y: auto;
}

th,
td {
  padding: 12px;
  text-align: left;
}

th {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background-color: #f9fafb;
  text-transform: uppercase;
}

td {
  font-size: 14px;
  color: #374151;
  border-top: 1px solid #e5e7eb;
}

.no-data {
  text-align: center;
  padding: 16px;
  color: #6b7280;
}

.wallet-non-zero {
  display: inline-block;
  padding: 4px 8px;
  background-color: #d1fae5;
  color: #059669;
  border-radius: 9999px;
  font-size: 14px;
}

.wallet-zero {
  display: inline-block;
  padding: 4px 8px;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 9999px;
  font-size: 14px;
}

.edit-btn {
  padding: 4px 8px;
  background-color: #2563eb;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Table Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination span {
  font-size: 14px;
  color: #6b7280;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 14px;
}

.pagination button:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
  }

  .sidebar {
    width: 80px;
  }

  .main-content-expanded {
    margin-left: 80px;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    margin-top: 8px;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tabs .tab {
    flex: 1 1 50%;
    margin-bottom: 8px;
  }

  .trip-data-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-image-container {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .table-controls {
    flex-direction: column;
    gap: 8px;
  }
}


</style>