<template>
  <div>
    <LabNavbar />
    <div class="content">
      <h2>Orders</h2>
      <audio
          ref="notificationSound"
          :src="require('../../assets/سناب-شات.mp3')"
          preload="auto"
          :loop="isSoundLooping"
      ></audio>
      <div class="new-order-alert" v-if="showStopButton">
        <p>New order received!</p>
        <button @click="stopNotificationSound" class="stop-btn">Stop Alert</button>
      </div>
      <div class="controls">
        <div class="search-box">
          <input
              type="text"
              v-model="searchTerm"
              @input="handleSearch"
              placeholder="Search orders..."
          />
          <select v-model="searchField">
            <option value="all">All Fields</option>
            <option value="UID">Order ID</option>
            <option value="patientName">Patient Name</option>
            <option value="status">Status</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>
        <div class="date-filter">
          <input type="date" v-model="startDate" @change="applyFilters" />
          <span>to</span>
          <input type="date" v-model="endDate" @change="applyFilters" />
          <button @click="clearDateFilter">Clear Dates</button>
        </div>
        <div class="status-filters">
          <button
              v-for="filter in filters"
              :key="filter.value"
              :class="{ active: activeFilter === filter.value }"
              @click="applyStatusFilter(filter.value)"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
      <div v-if="loading" class="loading">Loading orders...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="order-cards">
        <div
            v-for="order in paginatedOrders"
            :key="order._id"
            class="card"
            :class="statusClass(order.status)"
        >
          <h3>Order #{{ order.UID }}</h3>
          <p><strong>Patient Name:</strong> {{ order.patientName }}</p>
          <p><strong>Status:</strong> {{ order.status }}</p>
          <p><strong>Doctor:</strong> {{ order.doctorId.username }}</p>
          <p><strong>Price:</strong> {{ formatCurrency(order.price) }}</p>
          <div class="price-inputs">
            <div class="input-group">
              <label>Paid:</label>
              <input
                  type="number"
                  v-model.number="order.paid"
                  placeholder="Enter paid amount"
                  :disabled="processingOrder === order._id"
                  @keyup.enter="updatePrice(order)"
                  min="0"
                  :max="order.price"
                  step="0.01"
              />
              <button
                  class="update-btn"
                  @click="updatePrice(order)"
                  :disabled="processingOrder === order._id || !isValidPayment(order)"
              >
                <span v-if="processingOrder === order._id" class="btn-spinner"></span>
                <span v-else>✓</span>
              </button>
            </div>
            <div class="rest-display">
              <label>Rest:</label>
              <span class="rest-value">{{ formatCurrency(calculateRest(order)) }}</span>
            </div>
          </div>
          <p><strong>Last Updated:</strong> {{ formatDate(order.updatedAt) }}</p>
          <div class="card-actions">
            <router-link
                :to="{ name: 'showOrderlab', params: { id: order._id } }"
                class="view-order-btn"
            >
              View Order Details
            </router-link>
            <button
                @click="markOrderAsReady(order._id)"
                class="mark-ready-btn">
              <span v-if="processingOrder === order._id" class="btn-spinner"></span>
              {{ processingOrder === order._id ? 'Processing...' : 'Mark as Lab Ready' }}
            </button>
          </div>
        </div>
      </div>
      <div v-if="totalPages > 1" class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">
          Next
        </button>
      </div>
    </div>
    <div class="chat-icon">
      <a href="#chat">🗨️</a>
    </div>
  </div>
</template>

<script>
import LabNavbar from "@/components/navbars/labsNavbar.vue";
import axios from "axios";
import { format } from "date-fns";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import io from 'socket.io-client';

export default {
  name: "LabOrders",
  components: {
    LabNavbar
  },
  data() {
    return {
      baseUrl: "https://rr-5d46.onrender.com/labdash",
      orders: [],
      socket: null,
      labId: null,
      filteredOrders: [],
      loading: false,
      error: null,
      searchTerm: "",
      searchField: "all",
      activeFilter: "all",
      startDate: "",
      endDate: "",
      currentPage: 1,
      itemsPerPage: 10,
      cancelToken: null,
      isMounted: false,
      processingOrder: null,
      isSoundLooping: false,
      showStopButton: false,
      filters: [
        { label: "All", value: "all" },
        { label: "Underway", value: "lab received" },
        { label: "Ready", value: "lab ready" },
        { label: "Completed", value: "end" },
      ],
    };
  },
  computed: {
    isAuthenticated() {
      return !!localStorage.getItem("token");
    },
    totalPages() {
      return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    },
    paginatedOrders() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredOrders.slice(start, start + this.itemsPerPage);
    },
  },
  watch: {
    searchTerm() {
      this.debouncedSearch();
    },
  },
  created() {
    this.debouncedSearch = this.debounce(this.applyFilters, 300);
  },
  mounted() {
    this.isMounted = true;
    if (!this.isAuthenticated) {
      this.$router.push("/login");
      return;
    }
    this.fetchOrders();
  },
  beforeUnmount() {
    this.isMounted = false;
    if (this.cancelToken) {
      this.cancelToken.cancel("Component unmounted");
    }
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  methods: {
    initSocket() {
      if (!this.labId) return;

      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io('https://rr-5d46.onrender.com/', {
        query: {
          labId: this.labId
        }
      });

      this.socket.on(`get-orders/${this.labId}`, (data) => {
        this.handleNewOrder(data.orders);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Connection to live updates failed. Please refresh the page.');
      });

      this.socket.on('reconnect', (attempt) => {
        console.log(`Reconnected after ${attempt} attempts`);
        toast.info('Reconnected to live updates');
      });
    },
    handleNewOrder(newOrder) {
      this.isSoundLooping = true;
      this.showStopButton = true;
      this.playNotificationSound();

      toast.info(`New order received: #${newOrder.UID}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.log("New order received from socket:", newOrder);
      console.dir(newOrder, { depth: null });
      this.orders.unshift({
        ...newOrder,
        paid: newOrder.paid || newOrder.paied || 0,
        price: newOrder.price || 0
      });

      this.filteredOrders = [...this.orders];

      if (this.currentPage === 1) {
        this.applyFilters();
      }
    },
    playNotificationSound() {
      try {
        const sound = this.$refs.notificationSound;
        if (sound) {
          sound.currentTime = 0;
          sound.play().catch(e => console.error('Audio play failed:', e));
        }
      } catch (e) {
        console.error('Error playing notification sound:', e);
      }
    },
    stopNotificationSound() {
      try {
        const sound = this.$refs.notificationSound;
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
          this.isSoundLooping = false;
          this.showStopButton = false;
        }
      } catch (e) {
        console.error('Error stopping notification sound:', e);
      }
    },
    debounce(fn, delay) {
      let timeoutId;
      return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
      };
    },
    formatDate(date) {
      return date ? format(new Date(date), "MMM dd, yyyy HH:mm") : "";
    },
    formatCurrency(amount) {
      if (typeof amount !== 'number') return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    },
    statusClass(status) {
      return `status-${status.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, '-')}`;
    },
    calculateRest(order) {
      if (typeof order.price !== 'number' || typeof order.paid !== 'number') {
        return 0;
      }
      return Math.max(0, order.price - order.paid);
    },
    isValidPayment(order) {
      return typeof order.paid === 'number' &&
          order.paid >= 0 &&
          order.paid <= order.price;
    },
    canMarkAsReady(status) {
      return status.includes('DocReady') || status.includes('Underway');
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    async fetchOrders() {
      if (!this.isMounted) return;

      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${this.baseUrl}/get-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (this.isMounted) {
          this.orders = Array.isArray(data.orders) ? data.orders : Array.isArray(data) ? data : [];
          this.orders = this.orders.map(order => ({
            ...order,
            paid: order.paid || order.paied || 0,
            price: order.price || 0
          }));
          this.filteredOrders = [...this.orders];

          if (this.orders.length > 0 && this.orders[0].labId) {
            this.labId = this.orders[0].labId;
            this.initSocket();
          }
        }
      } catch (error) {
        this.handleError(error);
      } finally {
        if (this.isMounted) {
          this.loading = false;
        }
      }
    },
    async updatePrice(order) {
      if (!this.isValidPayment(order) || this.processingOrder) return;

      this.processingOrder = order._id;

      try {
        const token = localStorage.getItem("token");

        const response = await axios.patch(
            `${this.baseUrl}/update-prices`,
            {
              orderId: order._id,
              paied: Number(order.paid),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
        );

        // ✅ Check real HTTP status instead of custom data field
        if (response.status === 200) {
          toast.success(response.data.message || 'Price updated successfully');

          const updatedOrder = {
            ...order,
            paid: Number(order.paid),
            updatedAt: new Date().toISOString(),
          };

          const orderIndex = this.orders.findIndex(o => o._id === order._id);
          if (orderIndex !== -1) {
            this.orders.splice(orderIndex, 1, updatedOrder);
            this.filteredOrders = [...this.orders];
          }
        } else {
          // Fallback in case status is not 200 (just in case)
          throw new Error(response.data.message || 'Failed to update price');
        }

      } catch (error) {
        console.error('Error updating price:', error);
        toast.error(error.response?.data?.message || error.message || 'Failed to update price');
        await this.fetchOrders();
      } finally {
        this.processingOrder = null;
      }
    },

    async markOrderAsReady(orderId) {
      this.processingOrder = orderId;
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
            `${this.baseUrl}/mark-orders/${orderId}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` }
            }
        );

        if (response.data.status === 200) {
          toast.success('Order marked as Lab Ready');
          await this.fetchOrders();
        } else {
          throw new Error(response.data.message || 'Failed to update order');
        }
      } catch (error) {
        console.error('Error marking order as ready:', error);
        toast.error(error.response?.data?.message || error.message || 'Failed to update order');
      } finally {
        this.processingOrder = null;
      }
    },
    applyFilters() {
      let filtered = [...this.orders];

      if (this.activeFilter !== "all") {
        filtered = filtered.filter(order => order.status.includes(this.activeFilter));
      }

      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        end.setHours(23, 59, 59, 999);

        filtered = filtered.filter(order => {
          const orderDate = new Date(order.updatedAt);
          return orderDate >= start && orderDate <= end;
        });
      }

      if (this.searchTerm.trim()) {
        const term = this.searchTerm.toLowerCase().trim();
        filtered = filtered.filter((order) => {
          if (this.searchField === 'all') {
            return (
                order.UID?.toLowerCase().includes(term) ||
                order.patientName?.toLowerCase().includes(term) ||
                order.status?.toLowerCase().includes(term) ||
                order.doctorId?.username?.toLowerCase().includes(term)
            );
          }
          const fieldValue = order[this.searchField]?.toLowerCase();
          return fieldValue?.includes(term);
        });
      }

      this.filteredOrders = filtered;
      this.currentPage = 1;
    },
    clearDateFilter() {
      this.startDate = "";
      this.endDate = "";
      this.applyFilters();
    },
    applyStatusFilter(filter) {
      this.activeFilter = filter;
      this.applyFilters();
    },
    handleSearch() {
      this.applyFilters();
    },
    handleError(error) {
      let message = "An error occurred";
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            message = data.message || "Invalid request";
            break;
          case 401:
            message = "Session expired, please login again";
            this.$router.push("/login");
            return;
          case 403:
            message = "You don't have permission for this action";
            break;
          case 500:
            message = "Server error, please try again later";
            break;
        }
      } else {
        message = "Network error, check your internet connection";
      }

      this.error = message;
      toast.error(message);
    },
  },
};
</script>

<style scoped>
.content {
  padding: 80px 20px 20px;
  max-width: 1200px;
  margin: 0 auto;
}
h2 {
  color: #333;
  margin-bottom: 20px;
}
.new-order-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  border-radius: 4px;
  margin-bottom: 20px;
}
.new-order-alert p {
  margin: 0;
  color: #856404;
}
.stop-btn {
  padding: 8px 12px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.stop-btn:hover {
  background-color: #c82333;
}
.controls {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
}
.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}
.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 250px;
}
.search-box select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}
.date-filter input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.date-filter button {
  padding: 8px 12px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
.status-filters {
  display: flex;
  gap: 10px;
}
.status-filters button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.status-filters button.active {
  background: #00c3ff;
  color: white;
  border-color: #00c3ff;
}
.order-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
}
.card:hover {
  transform: translateY(-5px);
}
.card h3 {
  margin-top: 0;
  color: #00c3ff;
}
.card p {
  margin: 8px 0;
}
.price-inputs {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 15px 0;
}
.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-group label {
  min-width: 50px;
}
.input-group input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  max-width: 120px;
}
.update-btn {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}
.update-btn:hover:not(:disabled) {
  background-color: #218838;
}
.update-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #cccccc;
}
.rest-display {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rest-display label {
  min-width: 50px;
}
.rest-value {
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  min-width: 100px;
  display: inline-block;
}
.card-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.view-order-btn {
  padding: 8px 16px;
  background-color: #00c3ff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  text-align: center;
  transition: background-color 0.3s;
}
.view-order-btn:hover {
  background-color: #0099cc;
}
.mark-ready-btn {
  padding: 8px 16px;
  background-color: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.mark-ready-btn:hover:not(:disabled) {
  background-color: #138496;
}
.mark-ready-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.btn-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.status-docready {
  border-left: 4px solid #ffc107;
}
.status-labready {
  border-left: 4px solid #17a2b8;
}
.status-end {
  border-left: 4px solid #28a745;
}
.status-underway {
  border-left: 4px solid #6c757d;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}
.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}
.pagination button:hover:not(:disabled) {
  background-color: #f0f0f0;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}
.error {
  padding: 20px;
  text-align: center;
  color: #ff4444;
  background-color: #ffeeee;
  border-radius: 4px;
  margin: 20px 0;
}
.chat-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #00c3ff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s;
}
.chat-icon:hover {
  transform: scale(1.1);
}
.chat-icon a {
  color: white;
  text-decoration: none;
  font-size: 20px;
}
</style>