<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar @toggle="handleSidebarToggle" />
    </div>

    <!-- Main Content -->
    <div :class="['main-content', { 'main-content-expanded': isSidebarExpanded }]">
      <!-- Header -->
      <header>
        <div>
          <h1>Good morning, MR.FADY 👋</h1>
          <p>you have 1 new captain's request</p>
        </div>
        <div class="header-icons">
          <i class="fas fa-plus-circle"></i>
        </div>
      </header>

      <!-- Tabs -->
      <div class="tabs">
        <button :class="{ 'active-tab': activeTab === 'all' }" @click="setActiveTab('all')">
          All <span class="count-badge">{{ allCount }}</span>
        </button>
        <button :class="{ 'active-tab': activeTab === 'pending' }" @click="setActiveTab('pending')">
          PENDING <span class="count-badge">{{ pendingCount }}</span>
        </button>
        <button :class="{ 'active-tab': activeTab === 'end' }" @click="setActiveTab('end')">
          COMPLETED <span class="count-badge">{{ completedCount }}</span>
        </button>
        <button
            :class="{ 'active-tab': activeTab === 'cancelledByUser' }"
            @click="setActiveTab('cancelledByUser')"
        >
          CANCELLED <span class="count-badge">{{ cancelledByUserCount }}</span>
        </button>
        <button
            :class="{ 'active-tab': activeTab === 'cancelledByCaptain' }"
            @click="setActiveTab('cancelledByCaptain')"
        >
          CANCELLED BY CAPTAIN <span class="count-badge">{{ cancelledByCaptainCount }}</span>
        </button>
      </div>

      <!-- Table Controls -->
      <div class="table-controls">
        <input type="text" v-model="searchUniqueId" placeholder="Search by Trip ID" />
        <select v-model="vehicleTypeFilter">
          <option value="">All Vehicles</option>
          <option value="car">Car</option>
          <option value="motorcycle">Motorcycle</option>
          <option value="van">Van</option>
        </select>
        <input type="date" v-model="dateFilter" placeholder="Filter by Date" />
      </div>

      <!-- Table -->
      <div class="table-container">
        <div v-if="loading" class="loading">Loading trips...</div>
        <div v-else-if="paginatedTrips.length === 0" class="no-data">No trips available</div>
        <table v-else>
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
            <th>Wallet driver after trip</th>
            <th>Trip Comment</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="trip in paginatedTrips" :key="trip._id || trip.tripId?._id">
            <!-- User Name -->
            <td>
              <div style="display: flex; align-items: center;">
                <span>{{ trip.user?.username || trip.userId?.username || 'N/A' }}</span>
              </div>
            </td>

            <!-- User Phone -->
            <td>{{ trip.user?.phoneNumber || trip.userId?.phoneNumber || 'N/A' }}</td>

            <!-- Driver Name -->
            <td>
              <div style="display: flex; align-items: center;">
                <img
                    v-if="trip.driver?.profileImage || trip.driverId?.profile_image"
                    :src="trip.driver?.profileImage || trip.driverId?.profile_image"
                    alt="Driver Image"
                    style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 8px;"
                >
                <span>{{ trip.driver?.username || trip.driverId?.username || 'N/A' }}</span>
              </div>
            </td>

            <!-- Driver Phone -->
            <td>{{ trip.driver?.phoneNumber || trip.driverId?.phoneNumber || 'N/A' }}</td>

            <!-- Vehicle -->
            <td>
                <span v-if="trip.driver || trip.driverId">
                  {{ trip.vehicleType || trip.tripId?.vehicleType || 'N/A' }}
                  ({{ trip.driver?.username || trip.driverId?.username || 'N/A' }})
                </span>
              <span v-else>
                  {{ trip.vehicleType || trip.tripId?.vehicleType || 'N/A' }}
                </span>
            </td>

            <!-- Trip ID -->
            <td>{{ trip.uniqueId || trip.tripId?.uniqueId || 'N/A' }}</td>

            <!-- Ordered Time -->
            <td>{{ formatDate(trip.date || trip.tripId?.date) }}</td>

            <!-- Start Location -->
            <td>{{ trip.pickupLocationName || trip.tripId?.pickupLocationName || 'N/A' }}</td>

            <!-- Finish Location -->
            <td>{{ trip.destination || trip.tripId?.destination || 'N/A' }}</td>

            <!-- Value -->
            <td>{{ trip.cost || trip.tripId?.cost || 0 }} EGP</td>

            <!-- Payment -->
            <td>
              <template v-if="trip.moneyFlow?.flowItem">
                {{ formatCurrency(trip.moneyFlow.flowItem.payWallet) }} Wallet +
                {{ formatCurrency(trip.moneyFlow.flowItem.payCash) }} Cash EGP
                <br>
                <small>Total:
                  {{ formatCurrency(
                      (trip.moneyFlow.flowItem.payWallet || 0) +
                      (trip.moneyFlow.flowItem.payCash || 0)
                  ) }} EGP
                </small>
              </template>
              <span v-else>N/A</span>
            </td>

            <!-- Wallet driver after trip -->
            <td>
                <span
                    :class="{
                    'wallet-non-zero': trip.moneyFlow?.flowItem?.walletAfter !== 0,
                    'wallet-zero': !trip.moneyFlow?.flowItem?.walletAfter
                  }"
                >
                  {{ formatCurrency(trip.moneyFlow?.flowItem?.walletAfter || 0) }} EGP
                </span>
            </td>

            <!-- Trip Comment -->
            <td>{{ trip.comment || trip.tripId?.comment || 'N/A' }}</td>
          </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="pagination" v-if="paginatedTrips.length > 0">
          <span>
            {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredTrips.length) }}
            of {{ filteredTrips.length }} items
          </span>
          <button :disabled="currentPage === 1" @click="currentPage--">prev</button>
          <button>{{ currentPage }}</button>
          <button :disabled="currentPage >= totalPages" @click="currentPage++">next</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Sidebar from "./sidebarComponent.vue";
import axios from "axios";

export default {
  name: "tripsComponent",
  components: {
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
      searchUniqueId: "",
      vehicleTypeFilter: "",
      dateFilter: "",
      currentPage: 1,
      itemsPerPage: 10,
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
          const uniqueId = trip.uniqueId || trip.tripId?.uniqueId || '';
          return uniqueId.toLowerCase().includes(query);
        });
      }

      if (this.vehicleTypeFilter) {
        filtered = filtered.filter(
            (trip) => (trip.vehicleType || trip.tripId?.vehicleType) === this.vehicleTypeFilter
        );
      }

      if (this.dateFilter) {
        filtered = filtered.filter((trip) => {
          const tripDate = new Date(trip.createdAt || trip.tripId?.createdAt).toISOString().split("T")[0];
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
    this.getTrips();
    console.log("Trips", this.trips);
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
        const response = await axios.post(`${this.baseUrl}/wallet/get-data`);
        this.trips = response.data.data.map((trip) => {
          if (trip.moneyFlow?.document?.flow?.[0] && !trip.moneyFlow.flowItem) {
            trip.moneyFlow.flowItem = trip.moneyFlow.document.flow[0];
          }
          console.log("Trips", this.trips)
          return trip;
        });
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        this.loading = false;
      }
    },
    async getCancelledByUserTrips() {
      try {
        this.loading = true;
        const response = await axios.get(`${this.baseUrl}/admin/get-cancelled-trips`);
        this.cancelledByUserTrips = response.data.trips || [];
        console.log(this.cancelledByUserTrips);
      } catch (error) {
        console.error("Error fetching cancelled by user trips:", error);
      } finally {
        this.loading = false;
      }
    },
    async getCancelledByCaptainTrips() {
      try {
        this.loading = true;
        const response = await axios.get(`${this.baseUrl}/admin/get-cancelled-by-driver`);
        this.cancelledByCaptainTrips = response.data.trips || [];
      } catch (error) {
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
      return date.toLocaleString();
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

header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2a44;
}

header p {
  font-size: 14px;
  color: #2563eb;
  cursor: pointer;
  margin-top: 4px;
}

.header-icons i {
  font-size: 20px;
  color: #6b7280;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  margin-top: 24px;
}

.tabs button {
  flex: 1;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabs button.active-tab {
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

/* Table Controls */
.table-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.table-controls input,
.table-controls select {
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
}

/* Table */
.table-container {
  margin-top: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
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

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-end;
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

/* Loading and No Data States */
.loading,
.no-data {
  text-align: center;
  padding: 24px;
  font-size: 16px;
  color: #6b7280;
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

  .header-icons {
    margin-top: 8px;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tabs button {
    flex: 1 1 50%;
    margin-bottom: 8px;
  }

  .table-controls {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
```

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
}

/* Main Content */
.main-content {
  flex: 1;
  background-color: #ffffff;
  padding: 24px;
  transition: margin-left 0.3s ease;
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

header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2a44;
}

header p {
  font-size: 14px;
  color: #2563eb;
  cursor: pointer;
  margin-top: 4px;
}

.header-icons i {
  font-size: 20px;
  color: #6b7280;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  margin-top: 24px;
}

.tabs button {
  flex: 1;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabs button.active-tab {
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

/* Table */
.table-container {
  margin-top: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
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

/* Loading and No Data States */
.loading,
.no-data {
  text-align: center;
  padding: 24px;
  font-size: 16px;
  color: #6b7280;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
  }
  .sidebar-collapsed {
    width: 80px;
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

  .header-icons {
    margin-top: 8px;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tabs button {
    flex: 1 1 50%;
    margin-bottom: 8px;
  }
}
</style>
```