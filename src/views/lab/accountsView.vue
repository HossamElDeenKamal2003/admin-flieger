<template>
  <div>
    <LabNavbar />
    <div class="billing-container" style="margin-top: 10vh">
      <h2>Billing Dashboard</h2>

      <!-- Date Filter Controls -->
      <div class="date-filter-controls">
        <div class="date-input-group">
          <label for="startDate">From:</label>
          <input
              type="date"
              id="startDate"
              v-model="startDate"
              @change="applyDateFilter"
          />
        </div>
        <div class="date-input-group">
          <label for="endDate">To:</label>
          <input
              type="date"
              id="endDate"
              v-model="endDate"
              @change="applyDateFilter"
          />
        </div>
        <button
            @click="clearDateFilter"
            class="clear-filter-btn"
            :disabled="!hasDateFilter"
        >
          Clear Dates
        </button>
      </div>

      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading billing data...</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <button @click="fetchBillingData" class="retry-btn">Retry</button>
      </div>

      <div v-else class="billing-content">
        <!-- Date Range Display -->
        <div v-if="hasDateFilter" class="date-range-display">
          <p>
            Showing results for:
            <strong>{{ formatDisplayDate(billingData.dateRange.startDate) }}</strong>
            to
            <strong>{{ formatDisplayDate(billingData.dateRange.endDate) }}</strong>
          </p>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
          <div class="summary-card">
            <h3>Total Orders</h3>
            <p>{{ formatNumber(billingData.totalOrders) }}</p>
          </div>
          <div class="summary-card">
            <h3>Total Revenue</h3>
            <p>{{ formatCurrency(billingData.totalRevenue) }}</p>
          </div>
          <div class="summary-card">
            <h3>Amount Paid</h3>
            <p>{{ formatCurrency(billingData.totalPaid) }}</p>
          </div>
          <div class="summary-card">
            <h3>Amount Due</h3>
            <p>{{ formatCurrency(billingData.totalRest) }}</p>
          </div>
        </div>

        <!-- Doctor Breakdown -->
        <div class="section">
          <h3>By Doctor</h3>
          <div class="table-container">
            <table class="doctor-table">
              <thead>
              <tr>
                <th>Doctor</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Due</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(data, doctorId) in billingData.byDoctor" :key="doctorId">
                <td>{{ data.doctor.username || 'Unknown' }}</td>
                <td>{{ data.doctor.phoneNumber || 'N/A' }}</td>
                <td>{{ data.totalOrders }}</td>
                <td>{{ formatCurrency(data.totalAmount) }}</td>
                <td>{{ formatCurrency(data.totalPaid) }}</td>
                <td>{{ formatCurrency(data.totalRest) }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LabNavbar from "@/components/navbars/labsNavbar.vue";
import axios from "axios";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
  name: "BillingDashboard",
  components: {
    LabNavbar
  },
  data() {
    return {
      billingData: {
        totalOrders: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalRest: 0,
        byDoctor: {},
        dateRange: {
          startDate: null,
          endDate: null
        }
      },
      loading: false,
      error: null,
      startDate: '',
      endDate: '',
      baseUrl: "https://rr-5d46.onrender.com/labdash"
    };
  },
  computed: {
    hasDateFilter() {
      return this.startDate || this.endDate;
    }
  },
  mounted() {
    this.fetchBillingData();
  },
  methods: {
    async fetchBillingData() {
      this.loading = true;
      this.error = null;

      const token = localStorage.getItem("token");
      if (!token) {
        this.error = "Authentication required. Please login again.";
        this.loading = false;
        return;
      }

      try {
        const params = {};
        if (this.startDate) params.startDate = this.startDate;
        if (this.endDate) params.endDate = this.endDate;

        const response = await axios.get(`${this.baseUrl}/get-bill`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        console.log(response.data);
        if (response.data.success === true) {
          this.billingData = response.data.data;
        } else {
          throw new Error(response.data.message || "Failed to fetch billing data");
        }
      } catch (error) {
        console.error("Error fetching billing data:", error);
        this.error = error.response?.data?.message || error.message || "Failed to load billing data";
        toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },
    applyDateFilter() {
      // Validate date range if both dates are set
      if (this.startDate && this.endDate && this.startDate > this.endDate) {
        toast.error("End date cannot be before start date");
        this.endDate = '';
        return;
      }
      this.fetchBillingData();
    },
    clearDateFilter() {
      this.startDate = '';
      this.endDate = '';
      this.fetchBillingData();
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-JO', {
        style: 'currency',
        currency: 'JOD'
      }).format(value || 0);
    },
    formatNumber(value) {
      return new Intl.NumberFormat().format(value || 0);
    },
    formatDisplayDate(dateString) {
      if (!dateString) return 'All time';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
  }
};
</script>

<style scoped>
/* Existing styles... */

.date-filter-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.date-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-input-group label {
  font-weight: 500;
  color: #495057;
}

.date-input-group input {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.clear-filter-btn {
  padding: 8px 16px;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 4px;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filter-btn:hover:not(:disabled) {
  background-color: #dee2e6;
}

.clear-filter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.date-range-display {
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #e3f2fd;
  border-radius: 4px;
  color: #0d47a1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .date-filter-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-input-group {
    width: 100%;
  }

  .date-input-group input {
    flex-grow: 1;
  }

  .clear-filter-btn {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
<style scoped>
/* Your existing styles remain the same */
.billing-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-card h3 {
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 10px;
}

.summary-card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.section {
  margin-bottom: 40px;
}

.section h3 {
  color: #34495e;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ecf0f1;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

th {
  background-color: #3498db;
  color: white;
  font-weight: 600;
}

tr:hover {
  background-color: #f8f9fa;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #fee;
  color: #e74c3c;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
}

.retry-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #2980b9;
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr 1fr;
  }

  th, td {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}
</style>

<style scoped>
/* Your existing styles remain the same */
.billing-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.summary-card h3 {
  color: #7f8c8d;
  font-size: 1rem;
  margin-bottom: 10px;
}

.summary-card p {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.section {
  margin-bottom: 40px;
}

.section h3 {
  color: #34495e;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ecf0f1;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

th {
  background-color: #3498db;
  color: white;
  font-weight: 600;
}

tr:hover {
  background-color: #f8f9fa;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #fee;
  color: #e74c3c;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
}

.retry-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #2980b9;
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr 1fr;
  }

  th, td {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
}
</style>