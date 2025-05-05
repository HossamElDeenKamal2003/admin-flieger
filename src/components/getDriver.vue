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
          <WaitingDriversNumber :waiting-captains="waitingCaptains" />
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
            <input type="text" placeholder="Search by Name, Phone, or National ID" v-model="searchQuery" />
            <select v-model="filter">
              <option value="All Captains">All Captains</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>
            <select v-model="sortBy">
              <option value="none">Sort by</option>
              <option value="ctr-desc">CTR (High to Low)</option>
              <option value="ctr-asc">CTR (Low to High)</option>
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
            <th>Completed Trips</th>
            <th>State</th>
            <th>Wallet</th>
            <th>Date Of Certain License</th>
            <th>Captains Account</th>
            <th>Block Status</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="captain in paginatedCaptains"
              :key="captain.id"
              class="clickable-row"
              @click="goToDriverDetails(captain._id)"
          >
            <td @click.stop><input type="checkbox" /></td>
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
            <td>
              <span class="status-container">
                <span :class="captain.status?.toLowerCase() === 'online' ? 'status-dot-online' : 'status-dot-offline'" :title="`Status: ${captain.status}`"></span>
                <span class="status-text">{{ captain.status || 'Offline' }}</span>
              </span>
            </td>
            <td>{{ captain.wallet || 0 }}</td>
            <td>{{ captain.licence_expire_date || 'N/A' }}</td>
            <td @click.stop>
              <router-link
                  :to="{ name: 'DriverDetails', params: { driverId: captain._id } }"
                  class="action-open"
              >
                View Details
              </router-link>
            </td>
            <td @click.stop>
              <span :class="captain.block ? 'status-enabled' : 'status-blocked'">
                {{ captain.block ? 'ENABLED' : 'BLOCKED' }}
              </span>
            </td>
          </tr>
          <tr v-if="paginatedCaptains.length === 0">
            <td colspan="14" class="no-data">No captains found</td>
          </tr>
          </tbody>
        </table>

        <!-- Table Footer -->
        <div class="table-footer">
          <div>
            <p>Total Captains: {{ captains.length }}</p>
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
    </main>
  </div>
</template>

<script>
import Sidebar from './sidebarComponent.vue';
import axios from 'axios';
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  components: {
    WaitingDriversNumber,
    Sidebar
  },
  data() {
    return {
      isSidebarCollapsed: false,
      captains: [],
      searchQuery: '',
      adminName: localStorage.getItem('username'),
      filter: 'All Captains',
      sortBy: 'none',
      currentPage: 1,
      itemsPerPage: 10,
      baseUrl: 'https://backend.fego-rides.com/admin',
      activeCap: 0,
      loading: false,
      error: null
    };
  },
  computed: {
    filteredCaptains() {
      let filtered = this.captains.filter(captain => captain.block === true || (captain.block === false && (captain.ctr || 0) > 0));
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(captain =>
            (captain.username?.toLowerCase().includes(query)) ||
            (captain.phoneNumber?.toLowerCase().includes(query)) ||
            (captain.id?.toString().toLowerCase().includes(query))
        );
      }
      if (this.filter !== 'All Captains') {
        filtered = filtered.filter(captain =>
            (captain.status || 'Offline').toLowerCase() === this.filter.toLowerCase()
        );
      }
      if (this.sortBy === 'ctr-desc') {
        filtered = filtered.sort((a, b) => (b.ctr || 0) - (a.ctr || 0));
      } else if (this.sortBy === 'ctr-asc') {
        filtered = filtered.sort((a, b) => (a.ctr || 0) - (b.ctr || 0));
      }
      return filtered;
    },
    paginatedCaptains() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredCaptains.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredCaptains.length / this.itemsPerPage);
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
        this.captains = [];
        this.activeCap = 0;
        response.data.forEach(driver => {
          if (driver.block || (!driver.block && (driver.ctr || 0) > 0)) {
            this.captains.push(driver);
            if (driver.status?.toLowerCase() === 'online') {
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
    goToDriverDetails(driverId) {
      this.$router.push({ name: 'DriverDetails', params: { driverId } });
    }
  },
  watch: {
    filter() {
      this.currentPage = 1;
    },
    sortBy() {
      this.currentPage = 1;
    },
    searchQuery() {
      this.currentPage = 1;
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

.main-content {
  margin-left: 250px;
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  transition: margin-left 0.3s ease;
}

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

.wave {
  font-size: 1.2rem;
}

.header-icons i {
  font-size: 1.5rem;
  margin-left: 15px;
  cursor: pointer;
}

.captains-list {
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

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: #f5f7fa;
}

.captain-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-text {
  display: inline-block;
}

.status-dot-online,
.status-dot-offline {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-dot-online {
  background-color: #28c76f;
}

.status-dot-offline {
  background-color: #ff4d4f;
}

.status-enabled,
.status-blocked,
.action-open {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.status-enabled {
  background-color: #e6f7fa;
  color: #6b48ff;
}

.status-blocked {
  background-color: #e79c9c;
  color: red;
}

.action-open {
  background-color: #e6f7fa;
  color: #00cfe8;
  margin-right: 5px;
  text-decoration: none;
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

@media (max-width: 768px) {
  .main-content {
    margin-left: 80px;
  }

  .main-content-expanded {
    margin-left: 250px;
  }
}

@media (min-width: 769px) {
  .main-content {
    margin-left: 250px !important;
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