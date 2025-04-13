<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <div class="sidebar-header">
        <img src="../assets/fego%202.png" alt="Fego Logo" class="logo" />
        <span>Fego</span>
      </div>
      <div class="sidebar-menu">
        <div class="menu-item">
          <a href="/home" style="color: white; text-decoration: none;">
            <i class="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </a>
        </div>
        <div class="menu-item">
          <a href="/admin/get-trips" style="color: white; text-decoration: none;">
            <i class="fas fa-road"></i>
            <span>Trips</span>
          </a>
        </div>
        <div class="menu-item active">
          <a href="/admin/users" style="color: white; text-decoration: none;">
            <i class="fas fa-users"></i>
            <span>Users</span>
          </a>
        </div>
        <div class="menu-item">
          <a href="/admin/getdriver" style="color: white; text-decoration: none;">
            <i class="fas fa-user-shield"></i>
            <span>Captains</span>
          </a>
        </div>
        <div class="menu-item">
          <i class="fas fa-users-cog"></i>
          <span>Moderators</span>
        </div>
        <div class="menu-item">
          <i class="fas fa-cog"></i>
          <span>Settings</span>
        </div>
      </div>
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

      <!-- Users List -->
      <div class="users-list">
        <div class="users-header">
          <h2>Users list</h2>
          <div class="search-bar">
            <input type="text" placeholder="Search by Name" v-model="searchQuery" />
            <i class="fas fa-search"></i>
          </div>
        </div>
        <div class="table-container">
          <table>
            <thead>
            <tr>
              <th>User</th>
              <th>Completed Trips</th>
              <th>Cancelled Trips</th>
              <th>Wallet</th>
              <th>Rate</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-info">
                  <img :src="user.image" alt="User" class="user-image" />
                  <div>
                    <p class="user-name">{{ user.name }}</p>
                    <p class="user-phone">{{ user.phone }}</p>
                  </div>
                </div>
              </td>
              <td>{{ user.completedTrips }}</td>
              <td>{{ user.cancelledTrips }}</td>

              <td>{{ user.wallet }}</td>
              <td>
                <span class="stars">★ {{ user.rating }}</span>
              </td>
              <td>
                <i class="fas fa-trash-alt delete-icon"></i>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <div class="users-footer">
          <p>Total users: {{ users.length }}</p>
          <div class="pagination">
            <p>1-2 of {{ users.length }} items</p>
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
</template>

<script>
import axios from 'axios';

export default {
  name: "UsersListComponent",
  data() {
    return {
      isSidebarExpanded: true,
      searchQuery: "",
      currentPage: 1,
      itemsPerPage: 10,
      users: [], // Initialize as empty array
      isLoading: false,
      error: null
    };
  },
  computed: {
    filteredUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.users
          .filter((user) =>
              user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          )
          .slice(start, end);
    },
    totalPages() {
      return Math.ceil(
          this.users.filter((user) =>
              user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
          ).length / this.itemsPerPage
      );
    },
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    async fetchUsers() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await axios.get('https://backend.fego-rides.com/admin/get-users', {
          headers: {
            // Add any required headers like Authorization if needed
            // 'Authorization': 'Bearer your-token-here'
          }
        });

        // Transform API data to match your component's structure
        this.users = response.data.map(user => ({
          id: user.id,
          name: user.username || `${user.firstName} ${user.lastName}`,
          phone: user.phoneNumber || user.mobile || 'N/A',
          image: user.profile_image || 'https://via.placeholder.com/40',
          completedTrips: user.completedTrips || 0,
          cancelledTrips: user.cancelledTrips || 0,
          wallet: `${user.wallet || 0} EGP`,
          rating: user.rate || '0.0',

        }));

      } catch (error) {
        console.error('Error fetching users:', error);
        this.error = 'Failed to load users. Please try again later.';
        // You might want to show an error message to the user
      } finally {
        this.isLoading = false;
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
  background: linear-gradient(180deg, #6b48ff 0%, #4b2ecc 100%);
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

.main-content-expanded {
  margin-left: 250px;
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
  color: #6b7280;
  cursor: pointer;
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
}
</style>