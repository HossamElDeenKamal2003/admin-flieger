```vue
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
          <WaitingDriversNumber :waiting-captains="waitingCaptains" />
        </div>
        <div class="header-right">
          <i class="fas fa-plus-circle"></i>
        </div>
      </header>

      <!-- Users List -->
      <div class="users-list">
        <div class="users-header">
          <h2>Users list</h2>
          <div class="search-bar">
            <input type="text" placeholder="Search by Name or Phone" v-model="searchQuery" />
            <i class="fas fa-search"></i>
          </div>
        </div>

        <!-- Loading, Error, and Table States -->
        <div v-if="isLoading" class="loading-state">
          <p>Loading users...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <p class="error-message">{{ error }}</p>
        </div>
        <div v-else>
          <div class="table-container">
            <table>
              <thead>
              <tr>
                <th>User</th>
                <th>Phone Number</th>
                <th>Completed Trips</th>
                <th>Cancelled Trips</th>
                <th>Wallet</th>
                <th>Rate</th>
                <th>Actions</th>
                <th>Details</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="user-info">
                    <img :src="user.image || 'https://via.placeholder.com/40'" alt="User" class="user-image" />
                    <div>
                      <p class="user-name">{{ user.name || 'N/A' }}</p>
                      <p class="user-phone">{{ user.phoneNumber || 'N/A' }}</p>
                    </div>
                  </div>
                </td>
                <td>{{ user.phoneNumber || 'N/A' }}</td>
                <td>{{ user.completedTrips || 0 }}</td>
                <td>{{ user.cancelledTrips || 0 }}</td>
                <td @click.stop>
                  <input type="number" v-model="user.wallet" @change="updateWallet(user._id, $event.target.value)" />
                </td>
                <td>
                  <span class="stars">★ {{ user.rating || '0.0' }}</span>
                </td>
                <td>
                  <i class="fas fa-trash-alt delete-icon" @click="deleteUser(user._id)"></i>
                </td>
                <td>
                  <router-link
                      v-if="user._id"
                      :to="{ path: `/user/${user._id}` }"
                      class="action-open"
                  >
                    View Details
                  </router-link>
                  <span v-else class="action-open disabled">N/A</span>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="8" class="no-data">No users found</td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer with Pagination -->
          <div class="users-footer">
            <p>Total users: {{ filteredUsersCount }}</p>
            <div class="pagination">
              <p>
                {{ (currentPage - 1) * itemsPerPage + 1 }}-{{
                  Math.min(currentPage * itemsPerPage, filteredUsersCount)
                }} of {{ filteredUsersCount }} items
              </p>
              <div class="pagination-buttons">
                <button :disabled="currentPage === 1" @click="currentPage--">
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button
                    v-for="page in totalPages"
                    :key="page"
                    :class="{ active: currentPage === page }"
                    @click="currentPage = page"
                >
                  {{ page }}
                </button>
                <button :disabled="currentPage === totalPages" @click="currentPage++">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>
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
  name: "UsersListComponent",
  data() {
    return {
      isSidebarExpanded: true,
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 10,
      users: [],
      isLoading: false,
      error: null,
      adminUsername: localStorage.getItem('username')
    };
  },
  components: {
    WaitingDriversNumber,
    Sidebar,
  },
  computed: {
    filteredUsers() {
      if (!this.users) return [];
      const filtered = this.users.filter((user) =>
          (user.name || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (user.phoneNumber || '').toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filtered.slice(start, end);
    },
    filteredUsersCount() {
      if (!this.users) return 0;
      return this.users.filter((user) =>
          (user.name || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (user.phoneNumber || '').toLowerCase().includes(this.searchQuery.toLowerCase())
      ).length;
    },
    totalPages() {
      return Math.ceil(this.filteredUsersCount / this.itemsPerPage) || 1;
    }
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get('https://backend.fego-rides.com/admin/get-users');
        console.log('API response:', response.data); // For debugging
        this.users = response.data.map(user => ({
          _id: user._id || null,
          id: user.id || user._id || null,
          name: user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
          phoneNumber: user.phoneNumber || user.mobile || 'N/A',
          image: user.profile_image || 'https://via.placeholder.com/40',
          completedTrips: user.completedTrips || 0,
          cancelledTrips: user.cancelledTrips || 0,
          wallet: user.wallet || 0, // Changed to store as a number for input binding
          rating: user.rate || '0.0'
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        this.error = 'Failed to load users. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },
    async deleteUser(userId) {
      if (!confirm('Are you sure you want to delete this user?')) return;
      try {
        await axios.delete(`https://backend.fego-rides.com/admin/delete-user/${userId}`);
        this.users = this.users.filter(user => user._id !== userId);
        this.$toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        this.$toast.error('Failed to delete user. Please try again.');
      }
    },
    async updateWallet(userId, newWalletValue) {
      try {
        // Make an API call to update the wallet value on the backend
        await axios.patch(`https://backend.fego-rides.com/admin/update-wallet`, {
          userId: userId,
          wallet: parseFloat(newWalletValue) || 0
        });
        // Refresh the users list to reflect the updated wallet
        await this.fetchUsers();
        alert('Wallet updated successfully!');
      } catch (error) {
        console.error('Error updating wallet:', error);
        alert('Failed to update wallet: ' + (error.response?.data?.message || error.message));
        // Revert the wallet value in case of an error
        await this.fetchUsers();
      }
    }
  },
  created() {
    this.fetchUsers();
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

/* Users List */
.users-list {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.users-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2a44;
  margin: 0;
}

.search-bar {
  position: relative;
  width: 200px;
}

.search-bar input {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  color: #374151;
}

.search-bar i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #6b7280;
}

/* Table */
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

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2a44;
  margin: 0;
}

.user-phone {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0 0 0;
}

.stars {
  font-size: 12px;
  color: #f59e0b;
}

.delete-icon {
  font-size: 16px;
  color: #ff4d4f;
  cursor: pointer;
}

.delete-icon:hover {
  color: #e63946;
}

.action-open {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
}

.action-open.disabled {
  color: #6b7280;
  pointer-events: none;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 20px;
}

.error-message {
  color: #ff4d4f;
}

/* Users Footer */
.users-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.users-footer p {
  font-size: 14px;
  color: #6b7280;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
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

.pagination-buttons button:disabled {
  color: #d1d5db;
  cursor: not-allowed;
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

  .users-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .search-bar {
    width: 100%;
  }

  .users-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
```