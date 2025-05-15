```vue
<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div :class="['main-content', { 'main-content-expanded': !isSidebarExpanded }]">
      <!-- Header -->
      <header>
        <div class="header-left">
          <i class="fas fa-bars" @click="handleSidebarToggle"></i>
          <waiting-drivers-number />
        </div>
        <div class="header-right">
          <i class="fas fa-plus-circle"></i>
        </div>
      </header>

      <!-- Knowledge Base -->
      <div class="knowledge-base">
        <div class="card">
          <div class="card-header">
            <span>Total Orders</span>
            <i class="fas fa-chevron-right"></i>
          </div>
          <p class="card-value">{{ totalTrips }}</p>
        </div>
        <div class="card">
          <div class="card-header">
            <span>Profit</span>
            <i class="fas fa-chevron-right"></i>
          </div>
          <p class="card-value">{{ profit }}</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Level Counters -->
        <div class="level-counters">
          <h2>Driver Levels</h2>
          <div class="counters-grid">
            <div class="counter-card">
              <span class="counter-label">Level 1 Drivers</span>
              <p class="counter-value">{{ counter.levelOneCount || 0 }}</p>
            </div>
            <div class="counter-card">
              <span class="counter-label">Level 2 Drivers</span>
              <p class="counter-value">{{ counter.levelTwoCount || 0 }}</p>
            </div>
            <div class="counter-card">
              <span class="counter-label">Level 3 Drivers</span>
              <p class="counter-value">{{ counter.levelThreeCount || 0 }}</p>
            </div>
            <div class="counter-card">
              <span class="counter-label">Level 4 Drivers</span>
              <p class="counter-value">{{ counter.levelFourCount || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- Top Captains -->
        <div class="top-captains">
          <h2>Top Captains</h2>
          <div class="captains-list">
            <div class="captain" v-for="captain in topCaptains" :key="captain.id">
              <img :src="captain.image" alt="Captain" class="captain-image" />
              <div class="captain-info">
                <p class="captain-name">{{ captain.name }}</p>
                <p class="captain-id">{{ captain.id }}</p>
                <p class="captain-stats">
                  Trips: {{ captain.trips }} Income: {{ captain.income }}
                </p>
              </div>
              <div class="captain-rating">
                <span class="stars">★ {{ captain.rating }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Users Table -->
        <div class="top-users">
          <h2>Top Users</h2>
          <div class="table-container">
            <table>
              <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>User</th>
                <th>Phone number</th>
                <th>No of complete trips</th>
                <th>No of cancelled trips</th>
                <th>Wallet</th>
                <th>Rate</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="user in topUsers" :key="user.id">
                <td><input type="checkbox" /></td>
                <td>
                  <div class="user-info">
                    <img :src="user.image" alt="User" class="user-image" />
                    <span>{{ user.name }}</span>
                  </div>
                </td>
                <td>{{ user.phone }}</td>
                <td>{{ user.completeTrips }}</td>
                <td>{{ user.cancelledTrips }}</td>
                <td>{{ user.wallet }}</td>
                <td>
                  <span class="stars">★ {{ user.rating }}</span>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="pagination">
            <p>1-10 of {{ topUsers.length }} items</p>
            <div class="pagination-buttons">
              <button><i class="fas fa-chevron-left"></i></button>
              <button class="active">1</button>
              <button>2</button>
              <button><i class="fas fa-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from "./sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: "OverviewComponent",
  data() {
    return {
      isSidebarExpanded: true,
      topCaptains: [],
      topUsers: [],
      totalTrips: 0,
      profit: 0,
      counter: {},
      totalEarnings: 0,
      adminUsername: localStorage.getItem('username'),
    };
  },
  components: {
    WaitingDriversNumber,
    Sidebar
  },
  methods: {

    async fetchLevelData() {
      try {
        const response = await axios.get("https://backend.fego-rides.com/book/levelCounter");
        this.counter = response.data;
      } catch (error) {
        console.error(error);
        alert("Error fetching level data");
      }
    },
    async fetchData() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/book/totalOrders');
        this.totalTrips = response.data.totalTrips;
        this.profit = response.data.profit;
        this.totalEarnings = response.data.totalCommission;
      } catch (error) {
        console.error(error);
        alert("Error fetching total orders");
      }
    },
    async fetchTopCaptains() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/admin/get-drivers');
        const drivers = response.data;
        // Sort drivers by ctr in descending order
        const sortedDrivers = drivers.sort((a, b) => (b.ctr || 0) - (a.ctr || 0));
        // Determine how many captains to show
        const limit = drivers.length < 10 ? 5 : 10;
        // Map to topCaptains format
        this.topCaptains = sortedDrivers.slice(0, limit).map(driver => ({
          id: driver.id || 'N/A',
          name: driver.username || 'Unknown',
          image: driver.profile_image || 'https://via.placeholder.com/40',
          trips: driver.ctr || 0,
          income: driver.income || '0 EGP',
          rating: driver.rating || '0.0',
        }));
      } catch (error) {
        console.error('Error fetching drivers:', error);
        this.topCaptains = [{
          id: 'N/A',
          name: 'No Driver Found',
          image: 'https://via.placeholder.com/40',
          trips: 0,
          income: '0 EGP',
          rating: '0.0',
        }];
      }
    },
    async fetchTopUsers() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/admin/get-users');
        this.topUsers = response.data
            .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
            .slice(0, 10)
            .map(user => ({
              id: user.id || Date.now() + Math.random(),
              name: user.username || 'Unknown',
              image: user.profile_image || 'https://via.placeholder.com/40',
              phone: user.phoneNumber || 'N/A',
              completeTrips: user.completedTrips || 0,
              cancelledTrips: user.cancelledTrips || 0,
              wallet: user.wallet || '0 EGP',
              rating: user.rating || '0.0',
            }));
      } catch (error) {
        console.error('Error fetching users:', error);
        this.topUsers = [{
          id: Date.now(),
          name: 'No User Found',
          image: 'https://via.placeholder.com/40',
          phone: 'N/A',
          completeTrips: 0,
          cancelledTrips: 0,
          wallet: '0 EGP',
          rating: '0.0',
        }];
      }
    },
  },
  created() {
    this.fetchData();
    this.fetchLevelData();
  },
  async mounted() {
    await Promise.all([this.fetchTopCaptains(), this.fetchTopUsers()]);
  },
};
</script>

<style scoped>
/* Dashboard Layout */
.dashboard {
  display: flex;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 250px;
  transition: width 0.3s ease;
  background-color: #1f2a44;
  color: #ffffff;
}

.sidebar-collapsed {
  width: 80px;
}

.main-content {
  flex: 1;
  background-color: #f5f7fa;
  padding: 24px;
  transition: margin-left 0.3s ease;
}

.main-content-expanded {
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

/* Knowledge Base */
.knowledge-base {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-header span {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.card-header i {
  font-size: 14px;
  color: #6b7280;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

/* Level Counters */
.level-counters {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.level-counters h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0 0 16px 0;
}

.counters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.counter-card {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.counter-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
  display: block;
}

.counter-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0;
}

/* Top Captains */
.top-captains {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.top-captains h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0 0 16px 0;
}

.captains-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.captain {
  display: flex;
  align-items: center;
  gap: 12px;
}

.captain-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.captain-info {
  flex: 1;
}

.captain-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2a44;
  margin: 0;
}

.captain-id {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0;
}

.captain-stats {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.captain-rating .stars {
  font-size: 12px;
  color: #f59e0b;
}

/* Top Users Table */
.top-users {
  grid-column: span 2;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.top-users h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0 0 16px 0;
}

.table-container {
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

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.stars {
  font-size: 12px;
  color: #f59e0b;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.pagination p {
  font-size: 14px;
  color: #6b7280;
}

.pagination-buttons {
  display: flex;
  gap: 8px;
}

.pagination-buttons button {
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: #ffffff;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.pagination-buttons button.active {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

/* Responsive Adjustments */
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

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    margin-top: 8px;
  }

  .knowledge-base {
    flex-direction: column;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .top-users {
    grid-column: span 1;
  }
}
</style>
```