<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div :class="['main-content', { 'main-content-expanded': isSidebarExpanded }]">
      <!-- Header -->
      <header>
        <div class="header-left">
          <i class="fas fa-bars" @click="handleSidebarToggle"></i>
          <h1>Good morning, MR.FADY 👋</h1>
          <p>you have 1 new captain's request</p>
        </div>
        <div class="header-right">
          <i class="fas fa-plus-circle"></i>
        </div>
      </header>

      <!-- User Details -->
      <div class="user-details">
        <div v-if="isLoading">
          <p>Loading user data...</p>
        </div>
        <div v-else-if="error">
          <p class="error-message">{{ error }}</p>
        </div>
        <div v-else>
          <!-- User Data -->
          <div class="user-data">
            <h2>Users Data</h2>
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
              <span class="stars">★ {{ userData.rating || '0.0' }}</span>
            </div>
            <div class="data-row">
              <span>Wallet:</span>
              <span>{{ userData.wallet || '0 EGP' }}</span>
            </div>
          </div>

          <!-- Trip Stats -->
          <div class="trip-stats">
            <div class="stat-item completed">
              <i class="fas fa-check-circle"></i>
              Completed Trips {{ userData.completedTrips || 0 }}
            </div>
            <div class="stat-item cancelled">
              <i class="fas fa-times-circle"></i>
              Cancelled Trips {{ userData.cancelledTrips || 0 }}
            </div>
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
                <th>Wallet</th>
                <th>Trip State</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="trip in paginatedData" :key="trip.tripId">
                <td>{{ trip.tripId || 'N/A' }}</td>
                <td>{{ trip.vehicle || 'N/A' }}</td>
                <td>{{ trip.orderedTime || 'N/A' }}</td>
                <td>{{ trip.startLocation || 'N/A' }}</td>
                <td>{{ trip.finishLocation || 'N/A' }}</td>
                <td>{{ trip.value || 0 }}</td>
                <td>{{ trip.payment || 'N/A' }}</td>
                <td>{{ trip.wallet || '0 EGP' }}</td>
                <td :class="trip.status === 'Cancelled' ? 'status-cancelled' : 'status-completed'">
                  {{ trip.status || 'N/A' }}
                </td>
              </tr>
              <tr v-if="paginatedData.length === 0">
                <td colspan="9" class="no-data">No trip history found</td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Controls -->
          <div class="pagination" v-if="totalPages > 1">
            <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1">
              Previous
            </button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages">
              Next
            </button>
          </div>

          <!-- Comments Section -->
          <div class="comments-section">
            <h2>Commits</h2>
            <div class="comment" v-for="comment in userData.comments" :key="comment.id">
              <div class="comment-header">
                <img :src="comment.userImage" alt="User" class="comment-user-image" />
                <div>
                  <p class="comment-user-name">{{ comment.userName }}</p>
                  <p class="comment-rating">★ {{ comment.rating }}</p>
                </div>
              </div>
              <p class="comment-text">{{ comment.text }}</p>
            </div>
            <div v-if="!userData.comments || userData.comments.length === 0" class="no-comments">
              No comments found
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

export default {
  name: "UserDetails",
  data() {
    return {
      isSidebarExpanded: true,
      userData: {
        name: '',
        phoneNumber: '',
        rating: '0.0',
        wallet: '0 EGP',
        completedTrips: 0,
        cancelledTrips: 0,
        trips: [],
        comments: []
      },
      data: [], // Store the raw fetched trips
      currentPage: 1,
      itemsPerPage: 3,
      isLoading: false,
      error: null,
      baseUrl: 'https://backend.fego-rides.com'
    };
  },
  components: {
    Sidebar,
  },
  computed: {
    paginatedData() {
      if (!this.data || this.data.length === 0) {
        return [];
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.data.slice(start, end);
    },
    totalPages() {
      return Math.ceil((this.data?.length || 0) / this.itemsPerPage);
    }
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    async fetchUserData() {
      this.isLoading = true;
      this.error = null;
      try {
        const userId = this.$route.params.userId;
        const response = await axios.get(`${this.baseUrl}/user-profile/getUser/${userId}`);
        const user = response.data.user || response.data;
        this.userData = {
          name: user.username || `${user.firstName} ${user.lastName}` || 'N/A',
          phoneNumber: user.phoneNumber || user.mobile || 'N/A',
          rating: user.rate || '0.0',
          wallet: `${user.wallet || 0} EGP`,
          completedTrips: user.completedTrips || 23,
          cancelledTrips: user.cancelledTrips || 10,
          trips: [],
          comments: [],
        };
      } catch (error) {
        console.error('Error fetching user data:', error);
        this.error = 'Failed to load user data. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    async fetchTrips() {
      try {
        const userId = this.$route.params.userId;
        const response = await axios.post(`https://backend.fego-rides.com/wallet/filterWalletDetails`, {
         userId: userId,
        });

        const { moneyFlow, trips } = response.data;

        // Map the API response to the table's structure
        this.data = trips.map(trip => {
          const moneyFlowData = moneyFlow.find(flow => flow.flow.some(f => f.tripId === trip._id));
          const flow = moneyFlowData?.flow.find(f => f.tripId === trip._id) || {};

          return {
            tripId: trip.uniqueId || 'N/A', // e.g., "L8"
            vehicle: 'Car', // Hardcoded as per the image; ideally, fetch from API
            orderedTime: trip.date || 'N/A', // e.g., "1-5-2025 00:03:27"
            startLocation: 'N/A', // Not provided in API response
            finishLocation: 'N/A', // Not provided in API response
            value: flow.tripCost || 0, // e.g., 80
            payment: flow.payCash > 0 ? 'Cash' : 'Wallet', // e.g., "Cash" if payCash exists
            wallet: `${flow.payWallet || 0} EGP`, // e.g., "0 EGP"
            status: flow.payWallet > 0 ? 'COMPLETED' : 'CANCELLED' // Placeholder logic; adjust based on actual API data
          };
        });
      } catch (error) {
        console.error('Error fetching trips:', error);
        this.error = 'Failed to load trips. Please try again later.';
      }
    }
  },
  created() {
    this.fetchUserData();
    this.fetchTrips();
  }
};
</script>

<style scoped>
/* Base Styles */
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

/* User Details */
.user-details {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* User Data */
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

.data-row {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
}

.data-row span:first-child {
  font-weight: 500;
  color: #6b7280;
}

.data-row span:last-child {
  color: #374151;
}

.stars {
  color: #f59e0b;
}

/* Trip Stats */
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

.stat-item i {
  margin-right: 8px;
  font-size: 16px;
}

.stat-item.completed {
  background-color: #2563eb;
}

.stat-item.cancelled {
  background-color: #ff4d4f;
}

/* Trip History Table */
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

.trip-history td {
  font-size: 14px;
  color: #374151;
}

.status-completed {
  color: #28c76f;
}

.status-cancelled {
  color: #ff4d4f;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
}

.pagination button {
  padding: 8px 16px;
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
  color: #374151;
}

/* Comments Section */
.comments-section {
  margin-top: 16px;
}

.comments-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0 0 16px 0;
}

.comment {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.comment-user-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2a44;
  margin: 0;
}

.comment-rating {
  font-size: 12px;
  color: #f59e0b;
  margin: 2px 0 0 0;
}

.comment-text {
  font-size: 14px;
  color: #374151;
  margin: 0;
}

.no-comments {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* Error Message */
.error-message {
  color: #ff4d4f;
  text-align: center;
  padding: 20px;
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
}
</style>