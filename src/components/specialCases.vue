<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <Sidebar @toggle="handleSidebarToggle" />

    <!-- Main Content -->
    <main class="main-content" :class="{ 'main-content-expanded': !isSidebarCollapsed }">
      <!-- Header -->
      <header class="header">
        <div class="greeting">
          <WaitingDriversNumber :waiting-captains="waitingCaptains" />
          <h1>Special Cases</h1>
          <p>Manage special case requests</p>
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
        <p>{{ error }}</p>
        <button @click="retryFetch">Retry</button>
      </div>

      <!-- Pending Cases Table -->
      <section class="special-cases-table" v-if="!loading && !error">
        <h2 class="table-title">Pending Cases</h2>
        <div class="table-responsive">
          <table>
            <thead>
            <tr>
              <th>No.</th>
              <th>User ID</th>
              <th>Username</th>
              <th>Phone Number</th>
              <th>Case Type</th>
              <th>Action</th>
              <th>Current Status</th>
              <th>File</th>
              <th>Percent</th>
              <th>Title</th>
              <th>Body</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(specialCase, index) in paginatedPendingCases" :key="specialCase._id">
              <td>{{ (pendingPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ specialCase.userId._id }}</td>
              <td>{{ specialCase.userId.username }}</td>
              <td>{{ specialCase.userId.phoneNumber }}</td>
              <td>{{ specialCase.caseType || capitalize }}</td>
              <td>
                <div class="status-buttons">
                  <button
                      class="status-button approve"
                      :class="{ active: specialCase.status === 'approved' }"
                      @click="setStatus(specialCase, 'approved')"
                  >
                    Approve
                  </button>
                  <button
                      class="status-button reject"
                      :class="{ active: specialCase.status === 'rejected' }"
                      @click="setStatus(specialCase, 'rejected')"
                  >
                    Reject
                  </button>
                  <button
                      class="status-button pending"
                      :class="{ active: specialCase.status === 'pending' }"
                      @click="setStatus(specialCase, 'pending')"
                  >
                    Pending
                  </button>
                </div>
              </td>
              <td>{{ specialCase.status }}</td>
              <td>
                <img
                    :src="specialCase.file"
                    alt="Case File Preview"
                    class="file-preview"
                    @click="openOverlay(specialCase.file)"
                />
              </td>
              <td>
                <input
                    v-model.number="specialCase.percent"
                    type="number"
                    class="percent-input"
                    min="0"
                    max="100"
                    placeholder="0-100"
                />
              </td>
              <td>
                <input
                    v-model="specialCase.title"
                    type="text"
                    class="text-input"
                    placeholder="Enter title"
                />
              </td>
              <td>
                <input
                    v-model="specialCase.body"
                    type="text"
                    class="text-input"
                    placeholder="Enter body"
                />
              </td>
              <td>{{ formatDate(specialCase.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                      @click="updateCase(specialCase)"
                      class="save-button"
                  >
                    Save
                  </button>
                  <button @click="deleteCase(specialCase._id)" class="delete-button">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedPendingCases.length === 0">
              <td colspan="13" class="no-data">No pending cases found</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Pending Table Footer (Pagination) -->
        <div class="table-footer">
          <div>
            <p>Total Pending Cases: {{ pendingCases.length }}</p>
          </div>
          <div class="pagination">
            <span>
              {{ (pendingPage - 1) * itemsPerPage + 1 }}-{{ Math.min(pendingPage * itemsPerPage, pendingCases.length) }}
              of {{ pendingCases.length }} items
            </span>
            <button :disabled="pendingPage === 1" @click="pendingPage--">Prev</button>
            <button>{{ pendingPage }}</button>
            <button :disabled="pendingPage >= pendingTotalPages" @click="pendingPage++">Next</button>
          </div>
        </div>
      </section>

      <!-- Non-Pending Cases Table -->
      <section class="special-cases-table" v-if="!loading && !error">
        <h2 class="table-title">Approved/Rejected Cases</h2>
        <div class="filter-container">
          <label for="statusFilter">Filter by Status: </label>
          <select v-model="statusFilter" id="statusFilter" @change="applyFilter">
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="table-responsive">
          <table>
            <thead>
            <tr>
              <th>No.</th>
              <th>User ID</th>
              <th>Username</th>
              <th>Phone Number</th>
              <th>Case Type</th>
              <th>Action</th>
              <th>Current Status</th>
              <th>File</th>
              <th>Percent</th>
              <th>Title</th>
              <th>Body</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(specialCase, index) in paginatedNonPendingCases" :key="specialCase._id">
              <td>{{ (nonPendingPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ specialCase.userId._id }}</td>
              <td>{{ specialCase.userId.username }}</td>
              <td>{{ specialCase.userId.phoneNumber }}</td>
              <td>{{ specialCase.caseType || capitalize }}</td>
              <td>
                <div class="status-buttons">
                  <button
                      class="status-button approve"
                      :class="{ active: specialCase.status === 'approved' }"
                      @click="setStatus(specialCase, 'approved')"
                  >
                    Approve
                  </button>
                  <button
                      class="status-button reject"
                      :class="{ active: specialCase.status === 'rejected' }"
                      @click="setStatus(specialCase, 'rejected')"
                  >
                    Reject
                  </button>
                  <button
                      class="status-button pending"
                      :class="{ active: specialCase.status === 'pending' }"
                      @click="setStatus(specialCase, 'pending')"
                  >
                    Pending
                  </button>
                </div>
              </td>
              <td>{{ specialCase.status }}</td>
              <td>
                <img
                    :src="specialCase.file"
                    alt="Case File Preview"
                    class="file-preview"
                    @click="openOverlay(specialCase.file)"
                />
              </td>
              <td>
                <input
                    v-model.number="specialCase.percent"
                    type="number"
                    class="percent-input"
                    min="0"
                    max="100"
                    placeholder="0-100"
                />
              </td>
              <td>
                <input
                    v-model="specialCase.title"
                    type="text"
                    class="text-input"
                    placeholder="Enter title"
                />
              </td>
              <td>
                <input
                    v-model="specialCase.body"
                    type="text"
                    class="text-input"
                    placeholder="Enter body"
                />
              </td>
              <td>{{ formatDate(specialCase.createdAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button
                      @click="updateCase(specialCase)"
                      class="save-button"
                  >
                    Save
                  </button>
                  <button @click="deleteCase(specialCase._id)" class="delete-button">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedNonPendingCases.length === 0">
              <td colspan="13" class="no-data">No approved/rejected cases found</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Non-Pending Table Footer (Pagination) -->
        <div class="table-footer">
          <div>
            <p>Total Approved/Rejected Cases: {{ filteredNonPendingCases.length }}</p>
          </div>
          <div class="pagination">
            <span>
              {{ (nonPendingPage - 1) * itemsPerPage + 1 }}-{{ Math.min(nonPendingPage * itemsPerPage, filteredNonPendingCases.length) }}
              of {{ filteredNonPendingCases.length }} items
            </span>
            <button :disabled="nonPendingPage === 1" @click="nonPendingPage--">Prev</button>
            <button>{{ nonPendingPage }}</button>
            <button :disabled="nonPendingPage >= nonPendingTotalPages" @click="nonPendingPage++">Next</button>
          </div>
        </div>
      </section>

      <!-- Image Overlay -->
      <div v-if="showOverlay" class="modal-overlay" @click="closeOverlay">
        <div class="modal-content" @click.stop>
          <img :src="overlayImage" alt="Case File" class="modal-image" @error="handleImageError" />
          <button class="close-button" @click="closeOverlay">Close</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import Sidebar from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";
import axios from "axios";

export default {
  name: "SpecialCases",
  components: {
    Sidebar,
    WaitingDriversNumber,
  },
  data() {
    return {
      specialCases: [],
      loading: true,
      error: null,
      waitingCaptains: 0,
      pendingPage: 1,
      nonPendingPage: 1,
      itemsPerPage: 5,
      showOverlay: false,
      overlayImage: "",
      isSidebarCollapsed: false,
      statusFilter: "all", // Default filter to show all non-pending cases
    };
  },
  computed: {
    pendingCases() {
      return this.specialCases.filter(caseItem => caseItem.status === 'pending');
    },
    nonPendingCases() {
      return this.specialCases.filter(caseItem => caseItem.status !== 'pending');
    },
    filteredNonPendingCases() {
      if (this.statusFilter === "all") return this.nonPendingCases;
      return this.nonPendingCases.filter(caseItem => caseItem.status === this.statusFilter);
    },
    paginatedPendingCases() {
      const start = (this.pendingPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.pendingCases.slice(start, end);
    },
    paginatedNonPendingCases() {
      const start = (this.nonPendingPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredNonPendingCases.slice(start, end);
    },
    pendingTotalPages() {
      return Math.ceil(this.pendingCases.length / this.itemsPerPage);
    },
    nonPendingTotalPages() {
      return Math.ceil(this.filteredNonPendingCases.length / this.itemsPerPage);
    },
  },
  async created() {
    await this.fetchSpecialCases();
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
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
    async fetchSpecialCases() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get("https://backend.fego-rides.com/specialCase", {
          timeout: 10000,
        });
        if (response.status !== 200) {
          throw new Error("Failed to fetch special cases");
        }
        this.specialCases = response.data.specialCases.map(caseItem => ({
          ...caseItem,
          _id: caseItem._id || caseItem.id,
          title: caseItem.title || "",
          body: caseItem.body || "",
          status: caseItem.status || "pending",
          percent: caseItem.percent || 0,
          userId: caseItem.userId || "N/A",
          caseType: caseItem.caseType || "",
          file: caseItem.file || "https://via.placeholder.com/150",
          createdAt: caseItem.createdAt || null,
        }));
      } catch (error) {
        console.error("Error fetching special cases:", error);
        this.error = error.response?.data?.message || "Failed to fetch special cases.";
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }).replace(/\//g, "/");
    },
    openOverlay(imageUrl) {
      this.overlayImage = imageUrl;
      this.showOverlay = true;
    },
    closeOverlay() {
      this.showOverlay = false;
      this.overlayImage = "";
    },
    handleImageError() {
      console.error("Failed to load image:", this.overlayImage);
      this.overlayImage = "https://via.placeholder.com/150";
      alert("Failed to load image");
    },
    async setStatus(specialCase, status) {
      specialCase.status = status;
      await this.updateCase(specialCase);
    },
    async updateCase(specialCase) {
      if (specialCase.percent === null || specialCase.percent === undefined || isNaN(specialCase.percent)) {
        alert("Please enter a valid percent value");
        return;
      }
      if (specialCase.percent < 0 || specialCase.percent > 100) {
        alert("Percent must be between 0 and 100");
        return;
      }
      if (!specialCase.status || !["pending", "approved", "rejected"].includes(specialCase.status)) {
        alert("Please select a valid status");
        return;
      }
      try {
        const payload = {
          id: specialCase._id,
          status: specialCase.status,
          percent: specialCase.percent,
          title: specialCase.title || "",
          body: specialCase.body || "",
        };
        const response = await axios.patch("https://backend.fego-rides.com/specialCase", payload, {
          headers: {"Content-Type": "application/json"},
          timeout: 10000,
        });
        if (response.status === 200) {
          alert("Case updated successfully");
        }
      } catch (error) {
        console.error("Error updating case:", error);
        alert("Failed to update case: " + (error.response?.data?.message || error.message));
      }
    },
    async deleteCase(caseId) {
      if (!confirm("Are you sure you want to delete this case?")) return;
      try {
        const response = await axios.delete(`https://backend.fego-rides.com/specialCase`, {
          data: { id: caseId }
        });
        if (response.status === 200) {
          await this.fetchSpecialCases();
          alert("Case deleted successfully");
        }
      } catch (error) {
        console.error("Error deleting case:", error);
        alert("Failed to delete case: " + (error.response?.data?.message || error.message));
      }
    },
    retryFetch() {
      this.fetchSpecialCases();
    },
    applyFilter() {
      this.nonPendingPage = 1; // Reset to first page when filter changes
    },
  },
  filters: {
    capitalize(value) {
      if (!value) return "";
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
};
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  font-family: "Arial", sans-serif;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  transition: margin-left 0.3s ease;
}

.main-content-expanded {
  margin-left: 250px !important;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.greeting {
  flex: 1;
  min-width: 250px;
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

.special-cases-table {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #8e44ad;
  overflow: hidden;
  margin-bottom: 30px;
}

.table-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 15px;
}

.filter-container {
  margin-bottom: 15px;
}

.filter-container label {
  margin-right: 10px;
  color: #2c3e50;
  font-weight: 600;
}

.filter-container select {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.special-cases-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  min-width: 600px;
}

.special-cases-table th,
.special-cases-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.special-cases-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #34495e;
  white-space: nowrap;
}

.special-cases-table td {
  white-space: nowrap;
  color: #2c3e50;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.status-button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  font-size: 0.8rem;
  cursor: pointer;
  color: white;
  white-space: nowrap;
}

.status-button.approve {
  background-color: #28a745;
}

.status-button.approve.active {
  background-color: #218838;
  font-weight: bold;
}

.status-button.reject {
  background-color: #dc3545;
}

.status-button.reject.active {
  background-color: #c82333;
  font-weight: bold;
}

.status-button.pending {
  background-color: #ffc107;
  color: #333;
}

.status-button.pending.active {
  background-color: #e0a800;
  color: #333;
  font-weight: bold;
}

.file-preview {
  max-width: 50px;
  height: auto;
  cursor: pointer;
  border-radius: 5px;
  display: block;
}

.percent-input,
.text-input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.percent-input {
  max-width: 60px;
}

.text-input {
  min-width: 100px;
}

.percent-input::placeholder,
.text-input::placeholder {
  color: #aaa;
  font-style: italic;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.save-button,
.delete-button {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
}

.save-button {
  background-color: #6b48ff;
  color: white;
}

.save-button:hover {
  background-color: #563bd1;
}

.delete-button {
  background-color: #6c757d;
  color: white;
}

.delete-button:hover {
  background-color: #5a6268;
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
  padding: 20px;
  border-radius: 8px;
  max-width: 90%;
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-image {
  width: 100%;
  height: auto;
  max-height: 80vh;
}

.close-button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #ff4d4f;
  color: white;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
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
  flex-direction: column;
  gap: 10px;
}

.error-message button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  align-self: flex-start;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 80px;
  }

  .main-content-expanded {
    margin-left: 250px;
  }

  .special-cases-table {
    padding: 10px;
  }

  .table-footer {
    flex-direction: column;
    align-items: center;
  }

  .table-footer div {
    margin-bottom: 10px;
  }

  .pagination {
    justify-content: center;
  }
}

@media (min-width: 769px) {
  .main-content {
    margin-left: 250px !important;
  }
}
</style>