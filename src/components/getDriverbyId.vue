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
        <button @click="fetchDriverData">Retry</button>
      </div>

      <!-- Driver Data Section -->
      <section class="driver-data" v-if="driverData">
        <div class="data-cards">
          <!-- Captain Data -->
          <div class="data-card">
            <h2>Captain Data</h2>
            <div class="data-row">
              <span>Name:</span>
              <span>{{ driverData.name || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>Phone Number:</span>
              <span>{{ driverData.phoneNumber || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>National ID:</span>
              <span>{{ driverData.nationalId || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>Email:</span>
              <span>{{ driverData.email || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>State:</span>
              <span>
                <span :class="driverData.status === 'online' ? 'status-online' : 'status-offline'"></span>
                {{ driverData.status || 'Offline' }}
              </span>
            </div>
          </div>

          <!-- Vehicle Data -->
          <div class="data-card">
            <h2>Vehicle Data</h2>
            <div class="data-row">
              <span>Vehicle:</span>
              <span>{{ driverData.vehicle || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>Brand:</span>
              <span>{{ driverData.brand || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>Model:</span>
              <span>{{ driverData.model || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>NO Plate:</span>
              <span>{{ driverData.plate || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>Color:</span>
              <span>
                <span class="color-dot" :style="{ backgroundColor: driverData.color || '#000' }"></span>
                {{ driverData.color || 'N/A' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="summary-stats">
          <div class="stat-item">
            <span class="icon confirmed"></span>
            Confirmed Trips {{ driverData.confirmedTrips || 0 }}
          </div>
          <div class="stat-item">
            <span class="icon cancelled"></span>
            Cancelled Trips {{ driverData.cancelledTrips || 0 }}
          </div>
          <div class="stat-item">
            <span class="icon rating"></span>
            Rate {{ driverData.rating || 0 }}
          </div>
          <div class="stat-item">
            <span class="icon cash"></span>
            Cash {{ driverData.cash || 0 }}
          </div>
          <div class="stat-item">
            <span class="icon wallet"></span>
            Wallet {{ driverData.wallet || 0 }} EGP
          </div>
        </div>

        <!-- Trip History Table -->
        <div class="trip-history">
          <table>
            <thead>
            <tr>
              <th>Nº</th>
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
            <tr v-for="(trip, index) in paginatedTrips" :key="trip.id">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ trip.date || 'N/A' }}</td>
              <td>{{ trip.tripId || 'N/A' }}</td>
              <td>{{ trip.comment || 'N/A' }}</td>
              <td>{{ trip.value || 0 }}</td>
              <td>{{ trip.cash || 0 }}</td>
              <td>{{ trip.wallet || 0 }}</td>
              <td :class="trip.status === 'CANCELLED' ? 'status-cancelled' : ''">
                {{ trip.status || 'N/A' }}
              </td>
            </tr>
            <tr v-if="paginatedTrips.length === 0">
              <td colspan="8" class="no-data">No trip history found</td>
            </tr>
            </tbody>
          </table>

          <!-- Table Footer -->
          <div class="table-footer">
            <div>
              <p>Total Trips: {{ driverData.trips?.length || 0 }}</p>
            </div>
            <div class="pagination">
              <span>
                {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, driverData.trips?.length || 0) }}
                of {{ driverData.trips?.length || 0 }} items
              </span>
              <button :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
              <button>{{ currentPage }}</button>
              <button :disabled="currentPage >= totalPages" @click="currentPage++">&gt;</button>
            </div>
          </div>
        </div>

        <!-- Image Modal -->
        <div v-if="showImageModal" class="modal-overlay" @click="closeImage">
          <div class="modal-content" @click.stop style="max-width: 25%">
            <img
                :src="currentImageUrl || 'https://via.placeholder.com/400'"
                alt="Document Image"
                @error="handleImageError"
                style="max-width: 100%; height: auto;"
            />
            <button class="close-button" @click="closeImage">Close</button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs" v-if="driverData">
          <button
              class="tab"
              :class="{ active: activeTab === 'license' }"
              @click="openImage(driverData.driver_licence_image, 'license')"
          >
            Licence
          </button>
          <button
              class="tab"
              :class="{ active: activeTab === 'national_front' }"
              @click="openImage(driverData.national_front, 'national_front')"
          >
            National ID Front
          </button>
          <button
              class="tab"
              :class="{ active: activeTab === 'national_back' }"
              @click="openImage(driverData.national_back, 'national_back')"
          >
            National ID Back
          </button>
          <button
              class="tab"
              :class="{ active: activeTab === 'national_selfie' }"
              @click="openImage(driverData.national_selfie, 'national_selfie')"
          >
            Selfie With ID
          </button>
          <button
              class="tab"
              :class="{ active: activeTab === 'block' }"
              @click="toggleBlock"
          >
            {{ driverData.block ? 'Block' : 'Unblock' }}
          </button>
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
      driverData: null,
      adminName: localStorage.getItem('username') || 'Admin',
      newRequestsCount: 0,
      currentPage: 1,
      itemsPerPage: 3,
      loading: false,
      error: null,
      baseUrl: 'https://backend.fego-rides.com',
      showImageModal: false,
      currentImageUrl: '',
      activeTab: null // Track the active tab
    };
  },
  computed: {
    paginatedTrips() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.driverData?.trips?.slice(start, end) || [];
    },
    totalPages() {
      return Math.ceil((this.driverData?.trips?.length || 0) / this.itemsPerPage);
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
    async toggleBlock() {
      try {
        this.loading = true;
        this.activeTab = 'block';
        const driverId = this.$route.params.driverId;
        const currentBlockStatus = this.driverData.block;
        const newBlockStatus = !currentBlockStatus;

        await axios.patch(`${this.baseUrl}/authdriver/patch-block/${driverId}`, {
          block: newBlockStatus
        });

        this.driverData.block = newBlockStatus;
        alert(`Driver ${newBlockStatus ? 'unblocked' : 'blocked'} successfully`);
      } catch (error) {
        console.error('Error toggling block status:', error);
        this.$toast?.error('Failed to update block status');
      } finally {
        this.loading = false;
      }
    },
    async fetchDriverData() {
      this.loading = true;
      this.error = null;
      try {
        const driverId = this.$route.params.driverId;
        const response = await axios.get(`${this.baseUrl}/authdriver/driver/${driverId}`);

        const driver = response.data.driver;
        this.driverData = {
          name: driver.username || 'N/A',
          phoneNumber: driver.phoneNumber || 'N/A',
          nationalId: driver.id || 'N/A',
          email: driver.email || 'N/A',
          status: driver.status || 'offline',
          vehicle: driver.vehicleType || 'N/A',
          brand: 'N/A',
          model: driver.carModel || 'N/A',
          plate: driver.carNumber || 'N/A',
          color: 'N/A',
          confirmedTrips: driver.ctr || 0,
          cancelledTrips: 0,
          rating: driver.rate || 0,
          cash: driver.dailayEarned || 0,
          wallet: driver.wallet || 0,
          block: driver.block,
          trips: [],
          // Cloudinary image URLs (assumed to be full URLs from the backend)
          driver_licence_image: driver.driver_licence_image || 'N/A',
          national_front: driver.national_front || 'N/A',
          national_back: driver.national_back || 'N/A',
          national_selfie: driver.national_selfie || 'N/A'
        };
        console.log('Driver Data Images:', {
          driver_licence_image: this.driverData.driver_licence_image,
          national_front: this.driverData.national_front,
          national_back: this.driverData.national_back,
          national_selfie: this.driverData.national_selfie
        });
      } catch (err) {
        this.error = 'Failed to load driver data. Please try again later.';
        console.error('Error fetching driver data:', err);
      } finally {
        this.loading = false;
      }
    },
    validateImageUrl(url) {
      if (!url || url === 'N/A' || typeof url !== 'string') {
        return null;
      }
      // Ensure the URL starts with https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    },
    openImage(imageUrl, tabName) {
      const validatedUrl = this.validateImageUrl(imageUrl);
      if (!validatedUrl) {
        console.warn('Invalid image URL for', tabName, ':', imageUrl);
        this.currentImageUrl = 'https://via.placeholder.com/400';
        this.$toast?.error('Image not available');
      } else {
        this.currentImageUrl = validatedUrl;
      }
      this.showImageModal = true;
      this.activeTab = tabName;
      console.log('Opening image:', validatedUrl, 'Tab:', tabName);
    },
    closeImage() {
      this.showImageModal = false;
      this.currentImageUrl = '';
      this.activeTab = null;
    },
    handleImageError() {
      console.error('Failed to load image:', this.currentImageUrl);
      this.currentImageUrl = 'https://via.placeholder.com/400';
      this.$toast?.error('Failed to load image');
    }
  },
  created() {
    this.fetchDriverData();
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
/* Same styles as provided in the original code, no changes needed */
.dashboard {
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
}

/* Main Content */
.main-content {
  margin-left: 250px;
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
  color: #2c3e50;
}

.greeting p {
  color: #7f8c8d;
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

/* Driver Data Section */
.driver-data {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #8e44ad;
}

.data-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.data-card {
  flex: 1;
  padding: 15px;
  border: 2px solid #8e44ad;
  border-radius: 8px;
}

.data-card h2 {
  color: #2c3e50;
  font-size: 18px;
  margin-top: 0;
}

.data-row {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  color: #2c3e50;
}

.data-row span:first-child {
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  position: relative;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.modal-content img {
  width: 100%;
  height: auto;
  max-height: 80vh;
}

.close-button {
  margin-top: 10px;
  background-color: #ff4d4d;
  border: none;
  padding: 8px 16px;
  color: white;
  border-radius: 4px;
  cursor: pointer;
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

.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

/* Summary Stats */
.summary-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 600;
  color: white;
}

.stat-item .icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
}

.stat-item:nth-child(1) { background-color: #3498db; }
.stat-item:nth-child(1) .icon { background-color: white; }
.stat-item:nth-child(2) { background-color: #ff4d4f; }
.stat-item:nth-child(2) .icon { background-color: white; }
.stat-item:nth-child(3) { background-color: #8e44ad; }
.stat-item:nth-child(3) .icon { background-color: white; }
.stat-item:nth-child(4) { background-color: #2ecc71; }
.stat-item:nth-child(4) .icon { background-color: white; }
.stat-item:nth-child(5) { background-color: #7f8c8d; }
.stat-item:nth-child(5) .icon { background-color: white; }

/* Trip History Table */
.trip-history table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.trip-history th,
.trip-history td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.trip-history th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #34495e;
}

.status-cancelled {
  color: #ff4d4f;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* Tabs */
.tabs {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.tab {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.tab.active {
  background-color: #ff4d4f;
  color: white;
}

.tab:not(.active) {
  background-color: #ecf0f1;
  color: #34495e;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 80px;
  }

  .main-content-expanded {
    margin-left: 250px;
  }

  .data-cards {
    flex-direction: column;
  }

  .summary-stats {
    flex-wrap: wrap;
    gap: 10px;
  }

  .stat-item {
    flex: 1 1 45%;
    justify-content: center;
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
</style>