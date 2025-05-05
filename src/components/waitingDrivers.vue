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
          <p v-if="filteredWaitingCaptains.length > 0">
            You have {{ filteredWaitingCaptains.length }} captain{{ filteredWaitingCaptains.length === 1 ? '' : 's' }} on the waiting list
          </p>
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

      <!-- Waiting List Section -->
      <section class="waiting-list">
        <div class="table-header">
          <h2>Captains Waiting List</h2>
          <div class="table-controls">
            <input type="text" placeholder="Search by Name, Phone, or National ID" v-model="searchWaitingQuery" />
          </div>
        </div>

        <!-- Waiting Table -->
        <table>
          <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
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
          <tr
              v-for="waitingCaptain in paginatedWaitingCaptains"
              :key="waitingCaptain.id"
              class="clickable-row"
              @click="goToDriverDetails(waitingCaptain._id)"
          >
            <td @click.stop>
              <input type="checkbox" v-model="waitingCaptain.selected" />
            </td>
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
            <td>{{ waitingCaptain.carModel || 'N/A' }}</td>
            <td>{{ waitingCaptain.licence_expire_date || 'N/A' }}</td>
            <td @click.stop>
              <button class="action-open" @click="openDocument(waitingCaptain)">Open</button>
            </td>
            <td @click.stop>
              <router-link
                  :to="{ name: 'DriverDetails', params: { driverId: waitingCaptain._id } }"
                  class="action-open"
              >
                View Details
              </router-link>
              <span class="action-disable">
                Disabled
              </span>
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
            <p>Total Captains Waiting: {{ filteredWaitingCaptains.length }}</p>
            <p>Active Requests: {{ activeWaiting }}</p>
          </div>
          <div class="pagination">
            <span>
              {{ (currentWaitingPage - 1) * waitingItemsPerPage + 1 }}-{{ Math.min(currentWaitingPage * waitingItemsPerPage, filteredWaitingCaptains.length) }}
              of {{ filteredWaitingCaptains.length }} items
            </span>
            <button :disabled="currentWaitingPage === 1" @click="currentWaitingPage--;">❮</button>
            <button>{{ currentWaitingPage }}</button>
            <button :disabled="currentWaitingPage >= totalWaitingPages" @click="currentWaitingPage++;">❯</button>
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
      waitingCaptains: [],
      searchWaitingQuery: '',
      adminName: localStorage.getItem('username') || 'Admin',
      currentWaitingPage: 1,
      waitingItemsPerPage: 10,
      baseUrl: 'https://backend.fego-rides.com/admin',
      activeWaiting: 0,
      loading: false,
      error: null,
      selectAll: false
    };
  },
  computed: {
    filteredWaitingCaptains() {
      let filtered = this.waitingCaptains.filter(captain => captain.block === false && (captain.ctr || 0) === 0);
      if (this.searchWaitingQuery) {
        const query = this.searchWaitingQuery.toLowerCase();
        filtered = filtered.filter(captain =>
            (captain.username?.toLowerCase().includes(query)) ||
            (captain.phoneNumber?.toLowerCase().includes(query)) ||
            (captain.id?.toString().toLowerCase().includes(query))
        );
      }
      return filtered;
    },
    paginatedWaitingCaptains() {
      const start = (this.currentWaitingPage - 1) * this.waitingItemsPerPage;
      const end = start + this.waitingItemsPerPage;
      return this.filteredWaitingCaptains.slice(start, end);
    },
    totalWaitingPages() {
      return Math.ceil(this.filteredWaitingCaptains.length / this.waitingItemsPerPage);
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
        this.waitingCaptains = [];
        this.activeWaiting = 0;
        response.data.forEach(driver => {
          if (!driver.block && (driver.ctr || 0) === 0) {
            this.waitingCaptains.push({ ...driver, selected: false });
            if (driver.status?.toLowerCase() === 'online') {
              this.activeWaiting++;
            }
          }
        });
      } catch (err) {
        this.error = 'Failed to load waiting captains. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    async toggleCaptainStatus(captain) {
      this.loading = true;
      this.error = null;
      try {
        // Placeholder API call to update captain status
        await axios.post(`${this.baseUrl}/update-driver-status`, {
          driverId: captain._id,
          block: !captain.block
        });
        captain.block = !captain.block;
        // If captain is enabled, remove from waiting list
        if (captain.block) {
          this.waitingCaptains = this.waitingCaptains.filter(c => c.id !== captain.id);
          this.activeWaiting = this.waitingCaptains.filter(c => c.status?.toLowerCase() === 'online').length;
        }
      } catch (err) {
        this.error = 'Failed to update captain status. Please try again.';
      } finally {
        this.loading = false;
      }
    },
    openDocument(captain) {
      // Placeholder action for opening a document
      // In a real app, this could open a modal, download a file, or navigate to a URL
      if (captain.documentUrl) {
        window.open(captain.documentUrl, '_blank');
      } else {
        alert(`No document available for ${captain.username}.`);
        console.log('Document action for captain:', captain.id);
      }
    },
    goToDriverDetails(driverId) {
      this.$router.push({ name: 'DriverDetails', params: { driverId } });
    },
    toggleSelectAll() {
      this.waitingCaptains.forEach(captain => {
        captain.selected = this.selectAll;
      });
    }
  },
  watch: {
    searchWaitingQuery() {
      this.currentWaitingPage = 1;
      this.selectAll = false;
    },
    waitingCaptains: {
      handler() {
        this.selectAll = this.waitingCaptains.every(captain => captain.selected);
      },
      deep: true
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

.table-controls input {
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

.action-open,
.action-disable {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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