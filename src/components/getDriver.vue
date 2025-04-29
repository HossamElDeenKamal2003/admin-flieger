<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <Sidebar @toggle="handleSidebarToggle" />

    <!-- Main Content -->
    <main class="main-content" :class="{ 'main-content-expanded': !isSidebarCollapsed }">
      <!-- Header -->
      <header class="header">
        <div class="greeting">
          <h1>Good morning, MR. {{ adminName }}<span class="wave">👋</span></h1>
          <p v-if="newRequestsCount > 0">you have {{ newRequestsCount }} new Captain's Request</p>
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
        {{ error }}
        <button @click="getDrivers">Retry</button>
      </div>

      <!-- Captains List Section -->
      <section class="captains-list">
        <div class="table-header">
          <h2>Captains list</h2>
          <div class="table-controls">
            <input type="text" placeholder="Search by Name" v-model="searchQuery" />
            <select>

              <option>Offline</option>
            </select>
          </div>
        </div>

        <!-- Captains Table -->
        <table>
          <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Photo</th>
            <th>Name</th>
            <th>National ID</th>
            <th>City</th>
            <th>Vehicle</th>
            <th>Phone Number</th>
            <th>Trips</th>
            <th>Offline Trips</th>
            <th>State</th>
            <th>Wallet</th>
            <th>Date Of Certain License</th>
            <th>Captains Account</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="captain in paginatedCaptains" :key="captain.id">
            <td><input type="checkbox" /></td>
            <td>
              <img
                  :src="captain.profile_image || 'https://via.placeholder.com/40'"
                  alt="Captain Photo"
                  class="captain-photo"
              />
            </td>
            <td>{{ captain.username }}</td>
            <td>{{ captain.id }}</td>
            <td>{{ captain.city || 'N/A' }}</td>
            <td>{{ captain.vehicleType || 'N/A' }}</td>
            <td>{{ captain.phoneNumber || 'N/A' }}</td>
            <td>{{ captain.ctr || 0 }}</td>
            <td>{{ captain.offlineTrips || 0 }}</td>
            <td>
                <span :class="captain.status === 'Online' ? 'status-online' : 'status-offline'">
                  {{ captain.status || 'offline' }}
                </span>
            </td>
            <td>{{ captain.wallet || 0 }}</td>
            <td>{{ captain.licence_expire_date || 'N/A' }}</td>
            <td>
              <router-link
                  :to="{ name: 'DriverDetails', params: { driverId: captain._id } }"
                  class="action-open"
              >
                View Details
              </router-link>
            </td>
          </tr>
          <tr v-if="paginatedCaptains.length === 0">
            <td colspan="13" class="no-data">No captains found</td>
          </tr>
          </tbody>
        </table>

        <!-- Table Footer -->
        <div class="table-footer">
          <div>
            <p>Total Captains: {{ captains.length }}</p>
            <p>Active Captains: {{ activeCap }}</p>
          </div>
          <div class="pagination">
            <span>
              {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, filteredCaptains.length) }}
              of {{ filteredCaptains.length }} items
            </span>
            <button :disabled="currentPage === 1" @click="currentPage--">❮</button>
            <button>{{ currentPage }}</button>
            <button :disabled="currentPage >= totalPages" @click="currentPage++">❯</button>
          </div>
        </div>
      </section>

      <!-- Captains Waiting List Section -->
      <section class="waiting-list">
        <div class="table-header">
          <h2>Captains waiting list</h2>
        </div>

        <!-- Waiting Table -->
        <table>
          <thead>
          <tr>
            <th><input type="checkbox" /></th>
            <th>Photo</th>
            <th>Name</th>
            <th>National ID</th>
            <th>City</th>
            <th>Phone Number</th>
            <th>Vehicle</th>
            <th>Model</th>
            <th>Date Of Certain License</th>
            <th>Document</th>
            <th>Captains Account</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="waitingCaptain in paginatedWaitingCaptains" :key="waitingCaptain.id">
            <td><input type="checkbox" /></td>
            <td>
              <img
                  :src="waitingCaptain.profile_image || 'https://via.placeholder.com/40'"
                  alt="Captain Photo"
                  class="captain-photo"
              />
            </td>
            <td>{{ waitingCaptain.username }}</td>
            <td>{{ waitingCaptain.id }}</td>
            <td>{{ waitingCaptain.city || 'N/A' }}</td>
            <td>{{ waitingCaptain.phoneNumber || 'N/A' }}</td>
            <td>{{ waitingCaptain.vehicleType || 'N/A' }}</td>
            <td>{{ waitingCaptain.vehicleModel || 'N/A' }}</td>
            <td>{{ waitingCaptain.licenseDate || 'N/A' }}</td>
            <td><button class="action-open">Open</button></td>
            <td>
              <button
                  class="action-disable"
                  @click="toggleWaitingCaptainStatus(waitingCaptain)"
              >
                {{ waitingCaptain.block ? 'Enable' : 'Disable' }}
              </button>
            </td>
          </tr>
          <tr v-if="paginatedWaitingCaptains.length === 0">
            <td colspan="11" class="no-data">No waiting captains found</td>
          </tr>
          </tbody>
        </table>

        <!-- Waiting Table Footer -->
        <div class="table-footer">
          <div>
            <p>Total Captain Waiting: {{ waitingCaptains.length }}</p>
            <p>Active Requests: {{ activeWaiting }}</p>
          </div>
          <div class="pagination">
            <span>
              {{ (currentWaitingPage - 1) * waitingItemsPerPage + 1 }}-{{ Math.min(currentWaitingPage * waitingItemsPerPage, waitingCaptains.length) }}
              of {{ waitingCaptains.length }} items
            </span>
            <button :disabled="currentWaitingPage === 1" @click="currentWaitingPage--">❮</button>
            <button>{{ currentWaitingPage }}</button>
            <button :disabled="currentWaitingPage >= totalWaitingPages" @click="currentWaitingPage++">❯</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import Sidebar from './sidebarComponent.vue';
import axios from 'axios';

export default {
  components: {
    Sidebar
  },
  data() {
    return {
      isSidebarCollapsed: false,
      captains: [],
      waitingCaptains: [],
      searchQuery: '',
      adminName: localStorage.getItem('username'),
      filter: 'All Captains',
      currentPage: 1,
      itemsPerPage: 10,
      currentWaitingPage: 1,
      waitingItemsPerPage: 10,
      baseUrl: 'https://backend.fego-rides.com/admin',
      activeCap: 0,
      activeWaiting: 0,
      newRequestsCount: 0,
      loading: false,
      error: null
    };
  },
  computed: {
    filteredCaptains() {
      let filtered = this.captains;
      if (this.searchQuery) {
        filtered = filtered.filter(captain =>
            captain.username?.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      if (this.filter !== 'All Captains') {
        filtered = filtered.filter(captain => captain.status === this.filter);
      }
      return filtered;
    },
    paginatedCaptains() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredCaptains.slice(start, end);
    },
    paginatedWaitingCaptains() {
      const start = (this.currentWaitingPage - 1) * this.waitingItemsPerPage;
      const end = start + this.waitingItemsPerPage;
      return this.waitingCaptains.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredCaptains.length / this.itemsPerPage);
    },
    totalWaitingPages() {
      return Math.ceil(this.waitingCaptains.length / this.waitingItemsPerPage);
    }
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
    async getDrivers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${this.baseUrl}/get-drivers`);
        console.log(response.data);
        // Reset arrays
        this.captains = [];
        this.waitingCaptains = [];
        this.activeCap = 0;
        this.activeWaiting = 0;
        this.newRequestsCount = 0;

        response.data.forEach(driver => {
          if (driver.block) {
            this.waitingCaptains.push(driver);
            if (driver.status === 'Online') {
              this.activeWaiting++;
            }
            this.newRequestsCount++;
          } else {
            this.captains.push(driver);
            if (driver.status === 'Online') {
              this.activeCap++;
            }
          }
        });
      } catch (err) {
        this.error = 'Failed to load drivers. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    toggleWaitingCaptainStatus(captain) {
      // This would typically call an API endpoint to update the status
      captain.block = !captain.block;

      if (captain.block) {
        // Move to waiting list
        this.waitingCaptains.push(captain);
        this.captains = this.captains.filter(c => c.id !== captain.id);
      } else {
        // Move to active list
        this.captains.push(captain);
        this.waitingCaptains = this.waitingCaptains.filter(c => c.id !== captain.id);
      }

      // Update counts
      this.activeCap = this.captains.filter(c => c.status === 'Online').length;
      this.activeWaiting = this.waitingCaptains.filter(c => c.status === 'Online').length;
      this.newRequestsCount = this.waitingCaptains.length;
    }
  },
  watch: {
    filter() {
      this.currentPage = 1; // Reset to first page when filter changes
    },
    searchQuery() {
      this.currentPage = 1; // Reset to first page when search changes
    }
  },
  created() {
    this.getDrivers();
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
}

/* Main Content */
.main-content {
  margin-left: 250px; /* Default margin for desktop */
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  transition: margin-left 0.3s ease;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.greeting h1 {
  font-size: 1.5rem;
  margin: 0;
}

.greeting p {
  color: #888;
  margin: 5px 0 0;
}

.wave {
  font-size: 1.2rem;
}

.header-icons i {
  font-size: 1.5rem;
  margin-left: 15px;
  cursor: pointer;
}

/* Captains List */
.captains-list,
.waiting-list {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h2 {
  font-size: 1.2rem;
}

.table-controls {
  display: flex;
  gap: 10px;
}

.table-controls input,
.table-controls select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  font-weight: bold;
  color: #333;
}

.captain-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.status-online,
.status-offline {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-online {
  background-color: #28c76f;
}

.status-offline {
  background-color: #ff4d4f;
}

.status-enabled,
.status-blocked,
.action-open,
.action-disable {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.status-enabled {
  background-color: #e6f7fa;
  color: #00cfe8;
}

.status-blocked {
  background-color: #ffebee;
  color: #ff4d4f;
}

.action-open {
  background-color: #e6f7fa;
  color: #00cfe8;
  margin-right: 5px;
  text-decoration: none;
}

.action-disable {
  background-color: #ffebee;
  color: #ff4d4f;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 80px; /* Default margin when sidebar is collapsed on mobile */
  }

  .main-content-expanded {
    margin-left: 250px; /* Margin when sidebar is expanded on mobile */
  }
}

@media (min-width: 769px) {
  .main-content {
    margin-left: 250px !important; /* Always expanded on desktop */
  }
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

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

.main-content-expanded {
  margin-left: 250px;
}
</style>