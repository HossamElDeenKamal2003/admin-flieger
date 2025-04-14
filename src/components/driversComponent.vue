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
          <i class="icon menu" @click="toggleMobileMenu"></i>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-message">
        {{ error }}
        <button @click="getCaptain">Retry</button>
      </div>

      <!-- Captain Profile Section -->
      <section class="captain-profile" v-if="!loading && !error">
        <div class="row">
          <!-- Captain Data -->
          <div class="col-md-6 col-12">
            <div class="card captain-data">
              <h3>Captain Data</h3>
              <div class="row">
                <div class="col-md-4 col-12 text-center">
                  <img
                      :src="captain.profile_image || 'https://via.placeholder.com/100'"
                      alt="Captain Photo"
                      class="captain-photo"
                  />
                  <p class="state" :class="captain.state === 'Online' ? 'status-online' : 'status-offline'">
                    {{ captain.state || 'Offline' }}
                  </p>
                </div>
                <div class="col-md-8 col-12">
                  <p><span>Name:</span> {{ captain.username || 'N/A' }}</p>
                  <p><span>Phone Number:</span> {{ captain.phoneNumber || 'N/A' }}</p>
                  <p><span>National ID:</span> {{ captain.id || 'N/A' }}</p>
                  <p><span>Email:</span> {{ captain.email || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Vehicle Data -->
          <div class="col-md-6 col-12">
            <div class="card vehicle-data">
              <h3>Vehicle Data</h3>
              <p><span>Vehicle:</span> {{ captain.vehicleType || 'N/A' }}</p>
              <p><span>Brand:</span> {{ captain.carModel || 'N/A' }}</p>
              <p><span>Model:</span> {{ captain.carModelYear || 'N/A' }}</p>
              <p><span>NO Plate:</span> {{ captain.carNumber || 'N/A' }}</p>
              <p><span>Color:</span> {{ captain.carColor || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Trip Statistics -->
        <div class="row stats">
          <div class="col-md-2 col-4">
            <div class="stat confirmed">
              <i class="icon confirmed"></i>
              <p>Confirmed {{ captain.confirmedTrips || 0 }}</p>
            </div>
          </div>
          <div class="col-md-2 col-4">
            <div class="stat cancelled">
              <i class="icon cancelled"></i>
              <p>Cancelled {{ captain.cancelledTrips || 0 }}</p>
            </div>
          </div>
          <div class="col-md-2 col-4">
            <div class="stat rate">
              <i class="icon rate"></i>
              <p>Rate {{ captain.rate || 0 }}</p>
            </div>
          </div>
          <div class="col-md-2 col-4">
            <div class="stat cash">
              <i class="icon cash"></i>
              <p>Cash {{ captain.cash || '0 EGP' }}</p>
            </div>
          </div>
          <div class="col-md-2 col-4">
            <div class="stat wallet">
              <i class="icon wallet"></i>
              <p>Wallet {{ captain.wallet || '0 EGP' }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Trips Table -->
        <div class="card trips-table">
          <div class="table-responsive">
            <table>
              <thead>
              <tr>
                <th>N°</th>
                <th>Date</th>
                <th>Trip ID</th>
                <th>Comment</th>
                <th>Value</th>
                <th>Cash</th>
                <th>Wallet</th>
                <th>Trip State</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(trip, index) in paginatedTrips" :key="index">
                <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                <td>{{ trip.date || 'N/A' }}</td>
                <td>{{ trip.tripId || 'N/A' }}</td>
                <td>{{ trip.comment || 'N/A' }}</td>
                <td>{{ trip.value || '0 EGP' }}</td>
                <td>{{ trip.cash || '0 EGP' }}</td>
                <td>{{ trip.wallet || '0 EGP' }}</td>
                <td :class="trip.state === 'CANCELLED' ? 'status-cancelled' : 'status-completed'">
                  {{ trip.state || 'N/A' }}
                </td>
              </tr>
              <tr v-if="paginatedTrips.length === 0">
                <td colspan="8" class="no-data">No trips found</td>
              </tr>
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <p>Total Trips: {{ captain.totalTrips || 0 }}</p>
            <div class="pagination">
              <span>
                {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, captain.recentTrips?.length || 0) }}
                of {{ captain.recentTrips?.length || 0 }} items
              </span>
              <button :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
              <button>{{ currentPage }}</button>
              <button :disabled="currentPage >= totalPages" @click="currentPage++">&gt;</button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-danger" @click="redirectToLicense">License</button>
          <button class="btn btn-light" @click="redirectToImage(captain.profile_image)">Review</button>
          <button class="btn btn-light" @click="viewRides">Rides</button>
          <button class="btn btn-light" @click="viewTransactionHistory">Transaction history</button>
          <button class="btn btn-light" @click="viewCarDetails">Car details</button>
          <button
              class="btn btn-sm"
              :class="{ 'btn-primary': !captain.block, 'btn-danger': captain.block }"
              @click="toggleBlock(captain._id, captain.block)"
          >
            {{ captain.block ? 'Unblock' : 'Block' }}
          </button>
          <button class="btn btn-danger btn-sm" @click="deleteUser(captain._id)">Delete</button>
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
      captain: {
        recentTrips: []
      },
      adminName: localStorage.getItem('username'),
      currentPage: 1,
      itemsPerPage: 5,
      newRequestsCount: 0,
      loading: false,
      error: null,
      showMobileMenu: false,
      baseUrl: 'https://backend.fego-rides.com/admin'
    }
  },
  computed: {
    paginatedTrips() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.captain.recentTrips?.slice(start, end) || [];
    },
    totalPages() {
      return Math.ceil((this.captain.recentTrips?.length || 0) / this.itemsPerPage);
    }
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.isSidebarCollapsed = collapsed;
    },
    toggleMobileMenu() {
      if (window.innerWidth <= 768) {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      }
    },
    handleResize() {
      if (window.innerWidth <= 768) {
        this.isSidebarCollapsed = true;
      } else {
        this.isSidebarCollapsed = false;
      }
    },
    async getCaptain() {
      this.loading = true;
      this.error = null;
      try {
        // In a real app, you'd get the captain ID from route params
        const response = await axios.get(`${this.baseUrl}/get-driver/${this.$route.params.id}`);
        this.captain = response.data;
      } catch (err) {
        this.error = 'Failed to load captain data. Please try again later.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    redirectToLicense() {
      // Implement license viewing logic
      alert('License viewing functionality would be implemented here');
    },
    viewRides() {
      // Implement rides viewing logic
      alert('Rides viewing functionality would be implemented here');
    },
    viewTransactionHistory() {
      // Implement transaction history viewing logic
      alert('Transaction history functionality would be implemented here');
    },
    viewCarDetails() {
      // Implement car details viewing logic
      alert('Car details functionality would be implemented here');
    },
    redirectToImage(imageUrl) {
      window.open(imageUrl, '_blank');
    },
    async deleteUser(id) {
      if (confirm('Are you sure you want to delete this captain?')) {
        try {
          await axios.delete(`https://backend.fego-rides.com/authdriver/delete-user/${id}`);
          this.$router.push('/captains');
        } catch (error) {
          console.error(error);
          alert('Error occurred while deleting captain.');
        }
      }
    },
    async toggleBlock(userId, currentBlockStatus) {
      try {
        const newBlockStatus = !currentBlockStatus;
        const response = await axios.patch(`https://backend.fego-rides.com/authdriver/patch-block/${userId}`, {
          block: newBlockStatus,
        });
        this.captain = response.data;
        alert(`Captain ${newBlockStatus ? 'blocked' : 'unblocked'} successfully.`);
      } catch (error) {
        console.error(error);
        alert('Error occurred while updating block status.');
      }
    }
  },
  watch: {
    currentPage() {
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },
  created() {
    this.getCaptain();
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<style scoped>
/* Base Styles */
.dashboard {
  display: flex;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  background-color: #6b5b95;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
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

.header-icons {
  display: flex;
  align-items: center;
}

.header-icons i {
  font-size: 1.5rem;
  margin-left: 15px;
  cursor: pointer;
}

/* Captain Profile */
.captain-profile {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card {
  border: none;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.captain-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}

.state {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-online::before,
.status-offline::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-online::before {
  background-color: #28c76f;
}

.status-offline::before {
  background-color: #ff4d4f;
}

/* Stats */
.stats {
  margin: 20px -10px;
}

.stat {
  text-align: center;
  padding: 15px 5px;
  border-radius: 8px;
  color: white;
  margin-bottom: 10px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat p {
  margin: 5px 0 0;
  font-size: 0.9rem;
}

.stat.confirmed {
  background-color: #00cfe8;
}

.stat.cancelled {
  background-color: #ff4d4f;
}

.stat.rate {
  background-color: #6b48ff;
}

.stat.cash {
  background-color: #28c76f;
}

.stat.wallet {
  background-color: #1e1e1e;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

th, td {
  padding: 12px 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  font-weight: bold;
  color: #333;
  background-color: #f9f9f9;
}

.status-cancelled {
  color: #ff4d4f;
  font-weight: bold;
}

.status-completed {
  color: #28c76f;
  font-weight: bold;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
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

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn:hover {
  opacity: 0.9;
}

.btn-danger {
  background-color: #ff4d4f;
  color: white;
}

.btn-light {
  background-color: #f5f7fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-primary {
  background-color: #00cfe8;
  color: white;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
}

/* Loading and Error States */
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .stat p {
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }

  .main-content-expanded {
    margin-left: 250px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-icons {
    margin-top: 10px;
  }

  .captain-photo {
    width: 80px;
    height: 80px;
  }

  .action-buttons {
    gap: 8px;
  }

  .btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .stats .col-4 {
    padding: 0 5px;
  }

  .stat {
    padding: 10px 5px;
    min-height: 70px;
  }

  .stat p {
    font-size: 0.7rem;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .card {
    padding: 10px;
  }
}
</style>