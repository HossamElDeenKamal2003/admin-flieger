<template>
  <div class="dashboard">
    <!-- Sidebar (unchanged) -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar/>
    </div>

    <!-- Main Content -->
    <div :class="['main-content', { 'main-content-expanded': isSidebarExpanded }]">
      <!-- Header (unchanged) -->
      <header>
        <div class="header-left">
          <i class="fas fa-bars" @click="handleSidebarToggle"></i>
          <waiting-drivers-number />
        </div>
        <div class="header-right">
          <i class="fas fa-plus-circle"></i>
        </div>
      </header>

      <!-- Knowledge Base (unchanged) -->
      <div class="knowledge-base">
        <div class="card">
          <div class="card-header">
            <span>Total Orders</span>
            <i class="fas fa-chevron-right"></i>
          </div>
          <p class="card-value">100</p>
        </div>
        <div class="card">
          <div class="card-header">
            <span>Total Earnings</span>
            <i class="fas fa-chevron-right"></i>
          </div>
          <p class="card-value">500 EGP</p>
        </div>
        <div class="card">
          <div class="card-header">
            <span>Profit</span>
            <i class="fas fa-chevron-right"></i>
          </div>
          <p class="card-value">200 EGP</p>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Trips Progress Chart (unchanged) -->
        <div class="trips-progress">
          <div class="chart-header">
            <h2>Trips Progress</h2>
            <select>
              <option>2025</option>
            </select>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><span class="dot orange"></span>Long Trips</span>
            <span class="legend-item"><span class="dot blue"></span>Intermediate Trips</span>
            <span class="legend-item"><span class="dot green"></span>Short Trips</span>
          </div>
          <div class="chart-placeholder">
            <p>Chart: Long Trips, Intermediate Trips, Short Trips (Jan-Dec)</p>
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
                <th>no of complete trip</th>
                <th>no of cancelled trip</th>
                <th>wallet</th>
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
      adminUsername: localStorage.getItem('username'),
    };
  },
  components: {
    WaitingDriversNumber,
    Sidebar
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    async fetchTopCaptains() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/admin/get-drivers');
        // Assuming response.data is an array of drivers
        this.topCaptains = response.data
            .filter(driver => driver.ctr <= 10) // Filter drivers with exactly 10 trips
            .slice(0, 1) // Take the first one
            .map(driver => ({
              id: driver.id || 'N/A',
              name: driver.username || 'Unknown',
              image: driver.profile_image || 'https://via.placeholder.com/40',
              trips: driver.ctr || 10,
              income: driver.income || '0 EGP',
              rating: driver.rating || '0.0',
            }));
      } catch (error) {
        console.error('Error fetching drivers:', error);
        this.topCaptains = [{
          id: 'N/A',
          name: 'No Driver Found',
          image: 'https://via.placeholder.com/40',
          trips: 10,
          income: '0 EGP',
          rating: '0.0',
        }];
      }
    },
    async fetchTopUsers() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/admin/get-users');
        // Assuming response.data is an array of users
        this.topUsers = response.data
            .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0)) // Sort by rating descending
            .slice(0, 10) // Take top 10
            .map(user => ({
              id: user.id || Date.now() + Math.random(), // Fallback ID
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
  async mounted() {
    await Promise.all([this.fetchTopCaptains(), this.fetchTopUsers()]);
  },
};
</script>

<style scoped>
/* Unchanged styles */
.dashboard {
  display: flex;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 250px;
  transition: width 0.3s ease;
  color: #ffffff;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  padding: 16px;
}

.sidebar-header .logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 8px;
}

.sidebar-header span {
  font-size: 18px;
  font-weight: 600;
}

.sidebar-menu {
  margin-top: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
}

.menu-item i {
  margin-right: 12px;
  font-size: 18px;
}

.menu-item span {
  font-size: 16px;
}

.menu-item.active {
  background-color: #ffffff;
  color: #6b48ff;
  border-left: 4px solid #6b48ff;
}

/* Main Content */
.main-content {
  flex: 1;
  background-color: #f5f7fa;
  padding: 24px;
  transition: margin-left 0.3s ease;
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

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0;
}

.header-left p {
  font-size: 14px;
  color: #2563eb;
  cursor: pointer;
  margin: 4px 0 0 0;
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

/* Trips Progress */
.trips-progress {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0;
}

.chart-header select {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
  color: #374151;
}

.chart-legend {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.dot.orange {
  background-color: #f97316;
}

.dot.blue {
  background-color: #2563eb;
}

.dot.green {
  background-color: #10b981;
}

.chart-placeholder {
  height: 200px;
  background-color: #f9fafb;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 14px;
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
.pagination

{
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