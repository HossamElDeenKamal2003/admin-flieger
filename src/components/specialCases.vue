<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <Sidebar @toggle="handleSidebarToggle" />

    <!-- Main Content -->
    <main class="main-content" :class="{ 'main-content-expanded': !isSidebarCollapsed }">
      <!-- Header -->
      <header class="header">
        <div class="greeting">
          <WaitingDriversNumber :waiting-captains="waitingCaptains" />
          <h1>Pending Trips</h1>
          <p>Manage pending trip requests</p>
        </div>
        <div class="header-icons">
          <i class="icon notifications"></i>
          <i class="icon menu"></i>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="retryFetch">Retry</button>
      </div>

      <!-- Pending Trips Table -->
      <section class="pending-trips-table" v-if="!loading && !error">
        <h2 class="table-title">Pending Trips</h2>
        <div class="table-responsive">
          <table>
            <thead>
            <tr>
              <th>No.</th>
              <th>User ID</th>
              <th>Username</th>
              <th>Phone Number</th>
              <th>Vehicle Type</th>
              <th>Pickup Location</th>
              <th>Destination</th>
              <th>Cost</th>
              <th>Discount (%)</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trip, index) in paginatedPendingTrips" :key="trip._id">
              <td>{{ (pendingPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ trip.userId._id }}</td>
              <td>{{ trip.userId.username }}</td>
              <td>{{ trip.userId.phoneNumber }}</td>
              <td>{{ trip.vehicleType || 'N/A' }}</td>
              <td>{{ trip.pickupLocationName || 'N/A' }}</td>
              <td>{{ trip.destination || 'N/A' }}</td>
              <td>{{ trip.cost || 0 }}</td>
              <td>
                <input
                    v-model.number="trip.discount"
                    type="number"
                    class="percent-input"
                    min="0"
                    max="100"
                    placeholder="0-100"
                />
              </td>
              <td>
                <div class="status-buttons">
                  <button
                      class="status-button approve"
                      :class="{ active: trip.status === 'accepted' }"
                      @click="setStatus(trip, 'accepted')"
                  >
                    Accept
                  </button>
                  <button
                      class="status-button reject"
                      :class="{ active: trip.status === 'rejected' }"
                      @click="setStatus(trip, 'rejected')"
                  >
                    Reject
                  </button>
                  <button
                      class="status-button pending"
                      :class="{ active: trip.status === 'pending' }"
                      @click="setStatus(trip, 'pending')"
                  >
                    Pending
                  </button>
                </div>
              </td>
              <td>{{ formatDate(trip.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                      @click="updateTrip(trip)"
                      class="save-button"
                  >
                    Save
                  </button>
                  <button @click="deleteTrip(trip._id)" class="delete-button">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedPendingTrips.length === 0">
              <td colspan="12" class="no-data">No pending trips found</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pending Table Footer (Pagination) -->
        <div class="table-footer">
          <div>
            <p>Total Pending Trips: {{ pendingTrips.length }}</p>
          </div>
          <div class="pagination">
            <span>
              {{ (pendingPage - 1) * itemsPerPage + 1 }}-{{ Math.min(pendingPage * itemsPerPage, pendingTrips.length) }}
              of {{ pendingTrips.length }} items
            </span>
            <button :disabled="pendingPage === 1" @click="pendingPage--">
              Prev
            </button>
            <button>{{ pendingPage }}</button>
            <button :disabled="pendingPage >= pendingTotalPages" @click="pendingPage++">
              Next
            </button>
          </div>
        </div>
      </section>

      <!-- Non-Pending Trips Table -->
      <section class="pending-trips-table" v-if="!loading && !error">
        <h2 class="table-title">Accepted/Rejected Trips</h2>
        <div class="filter-container">
          <label for="statusFilter">Filter by Status: </label>
          <select v-model="statusFilter" id="statusFilter" @change="applyFilter">
            <option value="all">All</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
            <tr>
              <th>No.</th>
              <th>User ID</th>
              <th>Username</th>
              <th>Phone Number</th>
              <th>Vehicle Type</th>
              <th>Pickup Location</th>
              <th>Destination</th>
              <th>Cost</th>
              <th>Discount (%)</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trip, index) in paginatedNonPendingTrips" :key="trip._id">
              <td>{{ (nonPendingPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ trip.userId._id }}</td>
              <td>{{ trip.userId.username }}</td>
              <td>{{ trip.userId.phoneNumber }}</td>
              <td>{{ trip.vehicleType || 'N/A' }}</td>
              <td>{{ trip.pickupLocationName || 'N/A' }}</td>
              <td>{{ trip.destination || 'N/A' }}</td>
              <td>{{ trip.cost || 0 }}</td>
              <td>
                <input
                    v-model.number="trip.discount"
                    type="number"
                    class="percent-input"
                    min="0"
                    max="100"
                    placeholder="0-100"
                />
              </td>
              <td>
                <div class="status-buttons">
                  <button
                      class="status-button approve"
                      :class="{ active: trip.status === 'accepted' }"
                      @click="setStatus(trip, 'accepted')"
                  >
                    Accept
                  </button>
                  <button
                      class="status-button reject"
                      :class="{ active: trip.status === 'rejected' }"
                      @click="setStatus(trip, 'rejected')"
                  >
                    Reject
                  </button>
                  <button
                      class="status-button pending"
                      :class="{ active: trip.status === 'pending' }"
                      @click="setStatus(trip, 'pending')"
                  >
                    Pending
                  </button>
                </div>
              </td>
              <td>{{ formatDate(trip.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                      @click="updateTrip(trip)"
                      class="save-button"
                  >
                    Save
                  </button>
                  <button @click="deleteTrip(trip._id)" class="delete-button">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedNonPendingTrips.length === 0">
              <td colspan="12" class="no-data">No accepted/rejected trips found</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Non-Pending Table Footer (Pagination) -->
        <div class="table-footer">
          <div>
            <p>Total Accepted/Rejected Trips: {{ filteredNonPendingTrips.length }}</p>
          </div>
          <div class="pagination">
            <span>
              {{ (nonPendingPage - 1) * itemsPerPage + 1 }}-{{ Math.min(nonPendingPage * itemsPerPage, filteredNonPendingTrips.length) }}
              of {{ filteredNonPendingTrips.length }} items
            </span>
            <button :disabled="nonPendingPage === 1" @click="nonPendingPage--">
              Prev
            </button>
            <button>{{ nonPendingPage }}</button>
            <button :disabled="nonPendingPage >= nonPendingTotalPages" @click="nonPendingPage++">
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import Sidebar from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";
import axios from "axios";

export default {
  name: "PendingTrips",
  components: {
    Sidebar,
    WaitingDriversNumber,
  },
  data() {
    return {
      trips: [],
      loading: true,
      error: null,
      waitingCaptains: 0,
      pendingPage: 1,
      nonPendingPage: 1,
      itemsPerPage: 5,
      isSidebarCollapsed: false,
      statusFilter: "all", // Default filter to show all non-pending trips
    };
  },
  computed: {
    pendingTrips() {
      return this.trips.filter(trip => trip.status === 'pending');
    },
    nonPendingTrips() {
      return this.trips.filter(trip => trip.status !== 'pending');
    },
    filteredNonPendingTrips() {
      if (this.statusFilter === "all") return this.nonPendingTrips;
      return this.nonPendingTrips.filter(trip => trip.status === this.statusFilter);
    },
    paginatedPendingTrips() {
      const start = (this.pendingPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.pendingTrips.slice(start, end);
    },
    paginatedNonPendingTrips() {
      const start = (this.nonPendingPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredNonPendingTrips.slice(start, end);
    },
    pendingTotalPages() {
      return Math.ceil(this.pendingTrips.length / this.itemsPerPage);
    },
    nonPendingTotalPages() {
      return Math.ceil(this.filteredNonPendingTrips.length / this.itemsPerPage);
    },
  },
  async created() {
    await this.fetchTrips();
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.isSidebarCollapsed = collapsed;
    },
    handleResize() {
      if (window.innerWidth <= 768) {
        this.isSidebarCollapsed = true;
      } else {
        this.isSidebarCollapsed = false;
      }
    },
    async fetchTrips() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get("https://backend.fego-rides.com/pendingTrips", {
          timeout: 10000,
        });
        if (response.status !== 200) {
          throw new Error("Failed to fetch pending trips");
        }
        this.trips = response.data.trips.map(trip => ({
          ...trip,
          _id: trip._id || trip.id,
          userId: trip.userId || { _id: "N/A", username: "N/A", phoneNumber: "N/A" },
          username: trip.userId?.username || trip.username || "N/A",
          phoneNumber: trip.userId?.phoneNumber || "N/A",
          vehicleType: trip.vehicleType || "N/A",
          pickupLocationName: trip.pickupLocationName || "N/A",
          destination: trip.destination || "N/A",
          cost: trip.cost || 0,
          discount: trip.discount || 0,
          status: trip.status || "pending",
          createdAt: trip.createdAt || null,
        }));
      } catch (error) {
        console.error("Error fetching trips:", error);
        this.error = error.response?.data?.message || "Failed to fetch pending trips.";
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).replace(/\//g, "/");
    },
    async setStatus(trip, status) {
      trip.status = status;
      await this.updateTrip(trip);
    },
    async updateTrip(trip) {
      if (trip.discount === null || trip.discount === undefined || isNaN(trip.discount)) {
        alert("Please enter a valid discount value");
        return;
      }
      if (trip.discount < 0 || trip.discount > 100) {
        alert("Discount must be between 0 and 100");
        return;
      }
      if (!trip.status || !["pending", "accepted", "rejected"].includes(trip.status)) {
        alert("Please select a valid status");
        return;
      }
      try {
        const payload = {
          id: trip._id,
          status: trip.status,
          discount: trip.discount,
        };
        const response = await axios.patch("https://backend.fego-rides.com/pendingTrips", payload, {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        });
        if (response.status === 200) {
          alert("Trip updated successfully");
          await this.fetchTrips(); // Refresh data
        }
      } catch (error) {
        console.error("Error updating trip:", error);
        alert("Failed to update trip: " + (error.response?.data?.message || error.message));
      }
    },
    async deleteTrip(tripId) {
      if (!confirm("Are you sure you want to delete this trip?")) return;
      try {
        const response = await axios.delete("https://backend.fego-rides.com/pendingTrips", {
          data: { id: tripId },
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        });
        if (response.status === 200) {
          await this.fetchTrips();
          alert("Trip deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting trip:", error);
        alert("Failed to delete trip: " + (error.response?.data?.message || error.message));
      }
    },
    retryFetch() {
      this.fetchTrips();
    },
    applyFilter() {
      this.nonPendingPage = 1; // Reset to first page when filter changes
    },
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  font-family: "Arial", sans-serif;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  transition: margin-left 0.3s ease;
}

.main-content-expanded {
  margin-left: 250px !important;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.greeting {
  flex: 1;
  min-width: 250px;
}

.greeting h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #2c3e50;
}

.greeting p {
  color: #7f8c8d;
  margin: 5px 0 0;
}

.header-icons i {
  font-size: 1.5rem;
  margin-left: 15px;
  cursor: pointer;
}

.pending-trips-table {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #8e44ad;
  overflow: hidden;
  margin-bottom: 30px;
}

.table-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.filter-container {
  margin-bottom: 15px;
}

.filter-container label {
  margin-right: 10px;
  color: #2c3e50;
  font-weight: 600;
}

.filter-container select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.pending-trips-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  min-width: 600px;
}

.pending-trips-table th,
.pending-trips-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.pending-trips-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #34495e;
  white-space: nowrap;
}

.pending-trips-table td {
  white-space: nowrap;
  color: #2c3e50;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.status-button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  font-size: 0.8rem;
  cursor: pointer;
  color: white;
  white-space: nowrap;
}

.status-button.approve {
  background-color: #28a745;
}

.status-button.approve.active {
  background-color: #218838;
  font-weight: bold;
}

.status-button.reject {
  background-color: #dc3545;
}

.status-button.reject.active {
  background-color: #c82333;
  font-weight: bold;
}

.status-button.pending {
  background-color: #ffc107;
  color: #333;
}

.status-button.pending.active {
  background-color: #e0a800;
  color: #333;
  font-weight: bold;
}

.percent-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.9rem;
  box-sizing: border-box;
  max-width: 60px;
}

.percent-input::placeholder {
  color: #aaa;
  font-style: italic;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.save-button,
.delete-button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
}

.save-button {
  background-color: #6b48ff;
  color: white;
}

.save-button:hover {
  background-color: #563bd1;
}

.delete-button {
  background-color: #6c757d;
  color: white;
}

.delete-button:hover {
  background-color: #5a6268;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
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

.error-message {
  background-color: #ffebee;
  color: #ff4d4f;
  padding: 15px;
  margin: 20px 0;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.error-message button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  align-self: flex-start;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 80px;
  }

  .main-content-expanded {
    margin-left: 250px;
  }

  .pending-trips-table {
    padding: 10px;
  }

  .table-footer {
    flex-direction: column;
    align-items: center;
  }

  .table-footer div {
    margin-bottom: 10px;
  }

  .pagination {
    justify-content: center;
  }
}

@media (min-width: 769px) {
  .main-content {
    margin-left: 250px !important;
  }
}
</style>