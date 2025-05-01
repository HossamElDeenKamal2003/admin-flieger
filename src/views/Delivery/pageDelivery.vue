<template>
  <DeliveryNavbar />
  <div class="content">
    <div class="header-section">
      <div class="tabs">
        <button
            @click="switchTab('available')"
            :class="{ active: activeTab === 'available' }"
            class="tab-button"
        >
          Available Orders
        </button>
        <button
            @click="switchTab('my')"
            :class="{ active: activeTab === 'my' }"
            class="tab-button"
        >
          My Orders ({{ myOrdersCount }})
        </button>
      </div>
      <button @click="fetchOrders" class="refresh-btn">
        <span class="refresh-icon">↻</span> Refresh
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading orders...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>⚠️ {{ error }}</p>
      <button @click="fetchOrders" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="orders" class="order-cards">
      <div
          v-for="order in orders"
          :key="order._id"
          class="card"
          @click="handleOrderClick(order)"
      >
        <div class="card-header">
          <h3>Order #{{ order.UID || order._id.slice(-4) }}</h3>
          <span class="status-badge" :class="getStatusClass(order.status)">
            {{ formatStatus(order.status) }}
          </span>
        </div>

        <div class="card-body">
          <p><strong>Order direction:</strong> {{ getOrderType(order.status) }}</p>

          <!-- Doctor Information -->
          <div v-if="order.doctorId" class="info-section">
            <h4>Doctor Information:</h4>
            <p><strong>Name:</strong> {{ order.doctorId.username }}</p>
            <p><strong>Phone:</strong> {{ order.doctorId.phoneNumber }}</p>
            <p><strong>Address:</strong> {{ order.doctorId.address }}</p>
            <p><strong>Building:</strong> {{ order.doctorId.buildNo }}, Floor: {{ order.doctorId.floorNo }}</p>
          </div>

          <!-- Lab Information -->
          <div v-if="order.labId" class="info-section">
            <h4>Lab Information:</h4>
            <p><strong>Name:</strong> {{ order.labId.username }}</p>
            <p><strong>Phone:</strong> {{ order.labId.phoneNumber }}</p>
            <p><strong>Address:</strong> {{ order.labId.address }}</p>
            <p><strong>Building:</strong> {{ order.labId.buildNo }}, Floor: {{ order.labId.floorNo }}</p>
          </div>

          <p><strong>Created:</strong> {{ formatDate(order.createdAt) }}</p>
        </div>

        <div class="card-actions">
          <button
              v-if="!order.taked && activeTab === 'available'"
              @click.stop="takeOrder(order._id)"
              class="action-btn take-btn"
              :disabled="processingOrder === order._id"
          >
            <span v-if="processingOrder === order._id" class="btn-spinner"></span>
            {{ processingOrder === order._id ? 'Processing...' : 'Take Order' }}
          </button>
          <button
              v-if="order.taked && activeTab === 'my'"
              @click.stop="completeTask(order._id)"
              class="action-btn complete-btn"
              :disabled="processingOrder === order._id"
          >
            <span v-if="processingOrder === order._id" class="btn-spinner"></span>
            {{ processingOrder === order._id ? 'Processing...' : 'Complete Task' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="no-orders">
      <p>{{ activeTab === 'available' ? 'No available orders at the moment' : 'You have no active orders' }}</p>
    </div>

    <!-- Chat Icon -->
    <div class="chat-icon" @click="openChat">
      <span>🗨️</span>
    </div>
  </div>
</template>

<script>
import DeliveryNavbar from "@/components/navbars/deliveryNavbar.vue";
import axios from 'axios';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
  name: "DeliveryDashboard",
  components: {
    DeliveryNavbar
  },
  data() {
    return {
      orders: [],
      loading: false,
      error: null,
      refreshInterval: null,
      activeTab: 'available',
      myOrdersCount: 0,
      processingOrder: null
    };
  },
  created() {
    this.fetchOrders();
    this.refreshInterval = setInterval(this.fetchOrders, 30000);
  },
  beforeUnmount() {
    clearInterval(this.refreshInterval);
  },
  methods: {
    async fetchOrders() {
      this.loading = true;
      this.error = null;
      try {
        const endpoint = this.activeTab === 'available'
            ? 'https://rr-5d46.onrender.com/del/orders'
            : 'https://rr-5d46.onrender.com/del/myOrders';

        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.status === 200) {
          this.orders = response.data.data.reverse();
          if (this.activeTab === 'my') {
            this.myOrdersCount = response.data.orders;
          }
        } else {
          throw new Error(response.data.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        this.error = err.response?.data?.message || err.message || 'Failed to load orders';
        toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async takeOrder(orderId) {
      this.processingOrder = orderId;
      try {
        const response = await axios.patch(
            `https://rr-5d46.onrender.com/del/orders/${orderId}/take`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
        );

        if (response.data.status === 200) {
          toast.success('Order taken successfully');
          this.switchTab('my'); // Switch to "My Orders" after taking
        } else {
          throw new Error(response.data.message || 'Failed to take order');
        }
      } catch (err) {
        console.error('Error taking order:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to take order');
      } finally {
        this.processingOrder = null;
        this.fetchOrders();
      }
    },

    async completeTask(orderId) {
      this.processingOrder = orderId;
      try {
        const response = await axios.post(
            `https://rr-5d46.onrender.com/del/orders/end-task/${orderId}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
        );

        if (response.data.status === 200) {
          toast.success('Task completed successfully');
          this.fetchOrders();
        } else {
          throw new Error(response.data.message || 'Failed to complete task');
        }
      } catch (err) {
        console.error('Error completing task:', err);
        toast.error(err.response?.data?.message || err.message || 'Failed to complete task');
      } finally {
        this.processingOrder = null;
      }
    },

    switchTab(tab) {
      this.activeTab = tab;
      this.fetchOrders();
    },

    handleOrderClick(order) {
      // Try to use doctor's address first, then lab's address
      const location = order.doctorId || order.labId;
      if (location && location.address) {
        this.openMap(location.address);
      } else {
        toast.warning('Location address not available for this order');
      }
    },

    openMap(address) {
      const encodedAddress = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    },

    openChat() {
      toast.info('Chat feature coming soon!');
    },

    formatStatus(status) {
      return status.replace(/\([fp]\)$/, '').trim();
    },

    getStatusClass(status) {
      const baseStatus = this.formatStatus(status);
      const statusClasses = {
        'DoctorReady': 'DocReady',
        'LabReady': 'lab ready',
        'going to lab': 'going to lab',
        'lab received': 'lab received',
        'going to doctor': 'going to doctor',
        'end': 'end'
      };
      return statusClasses[baseStatus] || 'status-default';
    },

    getOrderType(status) {
      const baseStatus = this.formatStatus(status);
      return baseStatus.includes('DoctorReady') ? 'From Doctor to Lab' :
          baseStatus.includes('lab ready') ? 'From Lab to Doctor' :
              'Delivery';
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  }
};
</script>

<style scoped>
/* Previous styles remain the same, add these new ones: */

.info-section {
  margin: 10px 0;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.info-section h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 14px;
}

.info-section p {
  margin: 4px 0;
  font-size: 13px;
}

/* Keep all other existing styles */
.content {
  margin-top: 70px;
  padding: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.refresh-btn {
  background-color: #f0f0f0;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #e0e0e0;
}

.refresh-icon {
  font-size: 18px;
}

.loading-state, .error-state, .no-orders {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #007bff;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state p {
  color: #e74c3c;
  margin-bottom: 15px;
}

.retry-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.order-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.card-header h3 {
  font-size: 18px;
  margin: 0;
  color: #2c3e50;
}

.status-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-in-progress {
  background-color: #cce5ff;
  color: #004085;
}

.status-completed {
  background-color: #d4edda;
  color: #155724;
}

.status-default {
  background-color: #f8f9fa;
  color: #343a40;
}

.card-body {
  flex-grow: 1;
  margin-bottom: 15px;
}

.card-body p {
  font-size: 14px;
  margin: 8px 0;
  color: #34495e;
}

.card-body p strong {
  color: #2c3e50;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.take-btn {
  background-color: #28a745;
  color: white;
}

.take-btn:hover {
  background-color: #218838;
}

.complete-btn {
  background-color: #17a2b8;
  color: white;
}

.complete-btn:hover {
  background-color: #138496;
}

.chat-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  border-radius: 50%;
  padding: 15px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-icon:hover {
  background-color: #0069d9;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .order-cards {
    grid-template-columns: 1fr;
  }

  .content {
    padding: 15px;
  }
}

.tabs {
  display: flex;
  gap: 10px;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background-color: #f0f0f0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button.active {
  background-color: #007bff;
  color: white;
}

.tab-button:hover:not(.active) {
  background-color: #e0e0e0;
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

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>