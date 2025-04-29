```vue
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
        <button :class="{ 'active-tab': activeTab === 'all' }" @click="activeTab = 'all'">
          All <span class="count-badge">{{ allCount }}</span>
        </button>
        <button :class="{ 'active-tab': activeTab === 'pending' }" @click="activeTab = 'pending'">
          PENDING <span class="count-badge">{{ pendingCount }}</span>
        </button>
        <button :class="{ 'active-tab': activeTab === 'completed' }" @click="activeTab = 'end'">
          COMPLETED <span class="count-badge">{{ completedCount }}</span>
        </button>
        <button
            :class="{ 'active-tab': activeTab === 'cancelledByUser' }"
            @click="activeTab = 'cancelledByUser'"
        >
          CANCELLED <span class="count-badge">{{ cancelledByUserCount }}</span>
        </button>
        <button
            :class="{ 'active-tab': activeTab === 'cancelledByCaptain' }"
            @click="activeTab = 'cancelledByCaptain'"
        >
          CANCELLED BY CAPTAIN <span class="count-badge">{{ cancelledByCaptainCount }}</span>
        </button>
      </div>

      <!-- Table -->
      <div class="table-container">
        <div v-if="loading" class="loading">Loading trips...</div>
        <div v-else-if="filteredTrips.length === 0" class="no-data">No trips available</div>
        <table v-else>
          <thead>
          <tr>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Trip ID</th>
            <th>Ordered Time</th>
            <th>Start Location</th>
            <th>Finish Location</th>
            <th>Value</th>
            <th>Payment</th>
            <th>Wallet driver after trip</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="trip in filteredTrips" :key="trip._id">
            <!-- Driver (Image + Name) -->
            <td>
              <div style="display: flex; align-items: center;">
                <img
                    v-if="trip.driver?.profileImage"
                    :src="trip.driver.profileImage"
                    alt="Driver Image"
                    style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 8px;"
                >
                <span>{{ trip.driver?.username || 'N/A' }}</span>
              </div>
            </td>

            <!-- Vehicle -->
            <td>
                <span v-if="trip.driver">
                  {{ trip.vehicleType }} ({{ trip.driver.username }})
                </span>
              <span v-else>
                  {{ trip.vehicleType }}
                </span>
            </td>

            <!-- Trip ID -->
            <td>{{ trip.uniqueId }}</td>

            <!-- Ordered Time -->
            <td>{{ formatDate(trip.createdAt) }}</td>

            <!-- Start Location -->
            <td>{{ trip.pickupLocationName }}</td>

            <!-- Finish Location -->
            <td>{{ trip.destination }}</td>

            <!-- Value -->
            <td>{{ trip.cost }} EGP</td>

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
          </tr>
          </tbody>
        </table>
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
      isSidebarExpanded: true,
      baseUrl: "https://backend.fego-rides.com",
      loading: false,
    };
  },
  computed: {
    filteredTrips() {
      if (this.activeTab === "all") {
        return this.trips;
      }
      return this.trips.filter((trip) => trip.status === this.activeTab);
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
      return this.trips.filter((trip) => trip.status === "cancelledByUser").length;
    },
    cancelledByCaptainCount() {
      return this.trips.filter((trip) => trip.status === "cancelledByCaptain").length;
    },
  },
  created() {
    this.getTrips();
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    async getTrips() {
      try {
        this.loading = true;
        const response = await axios.post(`${this.baseUrl}/wallet/get-data`);
        this.trips = response.data.data.map((trip) => {
          if (trip.moneyFlow?.document?.flow?.[0] && !trip.moneyFlow.flowItem) {
            trip.moneyFlow.flowItem = trip.moneyFlow.document.flow[0];
          }
          console.log(response.data)
          return trip;
        });
      } catch (error) {
        console.error("Error fetching trips:", error);
        alert(error.response?.data?.message || error.message);
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