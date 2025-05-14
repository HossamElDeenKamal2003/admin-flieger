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

      <!-- Driver Requests Table -->
      <div class="requests">
        <h2>Driver Requests</h2>
        <div class="table-container">
          <table>
            <thead>
            <tr>
              <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>Status</th>
              <th>Driver ID</th>
              <th>Text</th>
              <th>File</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="request in paginatedRequests" :key="request._id">
              <td><input type="checkbox" v-model="selectedRequests" :value="request._id" /></td>
              <td>{{ request.status }}</td>
              <td>{{ request.driverId }}</td>
              <td>{{ request.text }}</td>
              <td>
                <span v-if="request.file" class="file-link" @click="openFileOverlay(request.file)">View File</span>
                <span v-else>N/A</span>
              </td>
              <td>{{ formatDate(request.createdAt) }}</td>
              <td>
                <button class="delete-button" @click="deleteRequest(request._id)">
                  Delete
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination">
          <p>{{ paginationRange }} of {{ requests.length }} items</p>
          <div class="pagination-buttons">
            <button @click="prevPage" :disabled="currentPage === 1">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
                v-for="page in totalPages"
                :key="page"
                :class="{ active: currentPage === page }"
                @click="goToPage(page)"
            >
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- File Overlay -->
      <div v-if="isOverlayVisible" class="file-overlay">
        <div class="overlay-content">
          <button class="close-button" @click="closeFileOverlay">
            X
          </button>
          <img v-if="isImageFile" :src="selectedFile" alt="File Preview" class="overlay-image" />
          <iframe v-else :src="selectedFile" class="overlay-iframe"></iframe>
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
  name: "DriverRequestsComponent",
  data() {
    return {
      isSidebarExpanded: true,
      requests: [],
      selectedRequests: [],
      selectAll: false,
      currentPage: 1,
      itemsPerPage: 10,
      selectedFile: null,
      isOverlayVisible: false,
    };
  },
  components: {
    WaitingDriversNumber,
    Sidebar,
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
    paginationRange() {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(this.currentPage * this.itemsPerPage, this.requests.length);
      return `${start}-${end}`;
    },
    isImageFile() {
      if (!this.selectedFile) return false;
      const extension = this.selectedFile.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
    },
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    async fetchRequests() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/authdriver/getAllDataReqs');
        this.requests = response.data.reqs;
      } catch (error) {
        console.error('Error fetching requests:', error);
        alert('Error fetching driver requests');
        this.requests = [];
      }
    },
    async deleteRequest(id) {
      if (!confirm('Are you sure you want to delete this request?')) return;
      try {
        await axios.delete(`https://backend.fego-rides.com/authdriver/delete-request/${id}`);
        this.requests = this.requests.filter(request => request._id !== id);
        this.selectedRequests = this.selectedRequests.filter(requestId => requestId !== id);
        alert('Request deleted successfully');
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Error deleting request');
      }
    },
    toggleSelectAll() {
      if (this.selectAll) {
        this.selectedRequests = this.paginatedRequests.map(request => request._id);
      } else {
        this.selectedRequests = [];
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
    openFileOverlay(fileUrl) {
      this.selectedFile = fileUrl;
      this.isOverlayVisible = true;
    },
    closeFileOverlay() {
      this.selectedFile = null;
      this.isOverlayVisible = false;
    },
  },
  watch: {
    selectedRequests() {
      this.selectAll = this.selectedRequests.length === this.paginatedRequests.length;
    },
  },
  created() {
    this.fetchRequests();
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

/* Requests Table */
.requests {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.requests h2 {
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

.file-link {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}

.file-link:hover {
  color: #1e40af;
}

.delete-button {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 14px;
}

.delete-button:hover {
  color: #b91c1c;
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

.pagination-buttons button.active,
.pagination-buttons button:hover:not(:disabled) {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.pagination-buttons button:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

/* File Overlay */
.file-overlay {
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

.overlay-content {
  position: relative;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: red;
  font-size: 20px;
  cursor: pointer;
  font-weight: bold;
}

.close-button:hover {
  color: #1f2a44;
}

.overlay-image {
  max-width: 100%;
  max-height: 80vh;
  display: block;
}

.overlay-iframe {
  width: 100%;
  height: 80vh;
  border: none;
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

  .table-container {
    font-size: 12px;
  }

  th,
  td {
    padding: 8px;
  }

  .overlay-content {
    max-width: 95%;
    max-height: 95%;
  }

  .overlay-iframe {
    height: 60vh;
  }
}
</style>