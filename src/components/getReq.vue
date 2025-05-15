<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="greeting">
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

      <!-- Requests Table -->
      <section class="requests-table">
        <table>
          <thead>
          <tr>
            <th>Nº</th>
            <th>Captain</th>
            <th>Phone Number</th>
            <th>National ID</th>
            <th>Amount</th>
            <th>Wallet</th>
            <th>View Details</th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="(request, index) in paginatedRequests"
              :key="request._id"
              @click="navigateToConfirmRequest(request.driverId._id)"
              class="clickable-row"
          >
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ request.driverId?.username || 'N/A' }}</td>
            <td>{{ request.driverId?.phoneNumber || 'N/A' }}</td>
            <td>{{ request.driverId?.nationalId || 'N/A' }}</td>
            <td>{{ request.amount || 0 }} EGP</td>
            <td>{{ request.driverId?.wallet }}</td>
            <td>View Details</td>
          </tr>
          <tr v-if="paginatedRequests.length === 0">
            <td colspan="6" class="no-data">No requests found</td>
          </tr>
          </tbody>
        </table>

        <!-- Table Footer (Pagination) -->
        <div class="table-footer">
          <div>
            <p>Total Requests: {{ requests.length }}</p>
          </div>
          <div class="pagination">
            <span>
              {{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, requests.length) }}
              of {{ requests.length }} items
            </span>
            <button :disabled="currentPage === 1" @click="currentPage--">prev</button>
            <button disabled>{{ currentPage }}</button>
            <button :disabled="currentPage >= totalPages" @click="currentPage++">next</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/sidebarComponent.vue';
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: "GetReqComponent",
  components: {
    WaitingDriversNumber,
    Sidebar,
  },
  data() {
    return {
      requests: [],
      loading: true,
      adminName: localStorage.getItem('username') || 'Admin',
      newRequestsCount: 0,
      currentPage: 1,
      itemsPerPage: 3,
      waitingCaptains: 0, // Added to avoid prop error, adjust based on your needs
    };
  },
  computed: {
    paginatedRequests() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.requests.slice(start, end);
    },

    totalPages() {
      return Math.ceil(this.requests.length / this.itemsPerPage);
    },
  },
  async created() {
    await this.fetchRequests();
    this.newRequestsCount = this.requests.length;
  },
  methods: {
    async fetchRequests() {
      try {
        const response = await fetch("https://backend.fego-rides.com/getReq");
        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }
        const data = await response.json();
        this.requests = data.requests.map((request) => ({
          _id: request._id,
          amount: request.amount,
          driverId: {
            _id: request.driverId?._id || '',
            username: request.driverId?.username || 'N/A',
            phoneNumber: request.driverId?.phoneNumber || 'N/A',
            nationalId: request.driverId?.id || 'N/A',
            wallet: request.driverId?.wallet || 'N/A',
            createdAt: request.driverId?.createdAt || '',
            ctr: request.driverId?.ctr || 0,
          },
        }));
      } catch (error) {
        console.error("Error fetching requests:", error);
        alert(error.message);
      } finally {
        this.loading = false;
      }
    },
    async confirmRequest(requestId) {
      try {
        const response = await fetch("https://backend.fego-rides.com/confirm-req", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: requestId }),
        });

        if (!response.ok) {
          throw new Error("Failed to confirm request");
        }

        this.requests = this.requests.filter((request) => request._id !== requestId);
        this.newRequestsCount = this.requests.length;
        alert("Request confirmed successfully!");
      } catch (error) {
        console.error("Error confirming request:", error);
        alert("Failed to confirm request. Please try again.");
      }
    },
    navigateToConfirmRequest(driverId) {
      if (!driverId) {
        console.error('Driver ID is missing');
        alert('Cannot navigate: Driver ID is missing');
        return;
      }
      this.$router.push({
        name: 'confirmRequest',
        params: { id: driverId },
      });
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
/* Define CSS variables for consistent sizing */
:root {
  --sidebar-width: 250px;
  --sidebar-width-collapsed: 80px;
}

/* Dashboard Layout */
.dashboard {
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
  justify-content: center;
}

/* Sidebar Styles */
.sidebar {
  width: var(--sidebar-width);
  background-color: #2f1c6a;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  z-index: 100;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  padding: 20px;
  box-sizing: border-box;
}

/* Main Content */
.main-content {
  margin-left: var(--sidebar-width);
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  box-sizing: border-box;
  overflow-x: auto;
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

.header-icons i {
  font-size: 1.5rem;
  margin-left: 15px;
  cursor: pointer;
}

/* Requests Table */
.requests-table {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #8e44ad;
}

.requests-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.requests-table th,
.requests-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.requests-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #34495e;
}

.requests-table td {
  color: #2c3e50;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f0f0f0;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* Table Footer */
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

.pagination span {
  color: #2c3e50;
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

/* Loading Overlay */
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

/* Responsive Adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: var(--sidebar-width-collapsed);
  }

  .main-content {
    margin-left: var(--sidebar-width-collapsed);
  }

  .requests-table table {
    font-size: 0.9rem;
  }

  .pagination button {
    padding: 3px 8px;
  }
}

@media (min-width: 769px) {
  .main-content {
    margin-left: var(--sidebar-width);
  }
}
</style>