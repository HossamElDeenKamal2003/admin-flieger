<template>
  <div class="dashboard">
    <!-- Sidebar -->
      <Sidebar />

    <!-- Main Content -->
    <main class="main-content">
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

      <!-- Requests Table -->
      <section class="requests-table">
        <table>
          <thead>
          <tr>
            <th>Nº</th>
            <th>Captain</th>
            <th>Phone Number</th>
            <th>National ID</th>
            <th>Wallet</th>
            <th>View Details</th>
            <th>Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(request, index) in paginatedRequests" :key="request._id">
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>{{ request.driverId?.username || 'N/A' }}</td>
            <td>{{ request.driverId?.phoneNumber || 'N/A' }}</td>
            <td>{{ request.driverId?.nationalId || 'N/A' }}</td>
            <td>{{ request.amount || 0 }} EGP</td>
            <td>
              <router-link
                  :to="{ name: 'DriverDetails', params: { driverId: request.driverId?._id } }"
                  class="view-details"
              >
                View Details
              </router-link>
            </td>
            <td>
              <button class="btn-confirm" @click="confirmRequest(request._id)">
                Confirm
              </button>
            </td>
          </tr>
          <tr v-if="paginatedRequests.length === 0">
            <td colspan="7" class="no-data">No requests found</td>
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
            <button :disabled="currentPage === 1" @click="currentPage--">Click</button>
            <button>{{ currentPage }}</button>
            <button :disabled="currentPage >= totalPages" @click="currentPage++">></button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import Sidebar from '../components/sidebarComponent.vue';

export default {
  name: "GetReqComponent",
  components: {
    Sidebar
  },
  data() {
    return {
      requests: [],
      loading: true,
      adminName: localStorage.getItem('username') || 'Admin',
      newRequestsCount: 0,
      currentPage: 1,
      itemsPerPage: 3
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
    }
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
        console.log(data);

        this.requests = data.requests.map((request) => ({
          _id: request._id,
          amount: request.amount,
          driverId: {
            _id: request.driverId?._id || '',
            username: request.driverId?.username || 'N/A',
            phoneNumber: request.driverId?.phoneNumber || 'N/A',
            nationalId: request.driverId?.id || 'N/A',
            createdAt: request.driverId?.createdAt || '',
            ctr: request.driverId?.ctr || 0
          }
        }));
      } catch (error) {
        console.error("Error fetching requests:", error);
        alert("Failed to fetch requests. Please try again.");
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
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  }
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
  position: relative;
  justify-content: center;
}

/* Sidebar Styles (Assuming Sidebar.vue uses these) */
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
  margin-left: var(--sidebar-width); /* Match sidebar width */
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  box-sizing: border-box;
  overflow-x: auto; /* Allow horizontal scrolling if content overflows */
}
.dashboard {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr;
  height: 100vh;
}

.main-content {
  /* No need for margins with grid */
}

.sidebar-container {
  width: var(--sidebar-width);
  flex-shrink: 0; /* Prevent sidebar from shrinking */
}

.main-content {
  flex-grow: 1; /* Take remaining space */
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  box-sizing: border-box;
  overflow-x: auto;
  /* Remove margin-left */
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

.view-details {
  color: #6b48ff;
  text-decoration: none;
  font-weight: 500;
}

.view-details:hover {
  text-decoration: underline;
}

.btn-confirm {
  padding: 5px 10px;
  border: none;
  border-radius: 50px;
  background-color: #ff4d4f;
  color: white;
  cursor: pointer;
  font-weight: 500;
}

.btn-confirm:hover {
  background-color: #e04345;
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
    margin-left: var(--sidebar-width) !important;
  }
}
</style>