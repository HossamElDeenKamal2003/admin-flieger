<template>
  <LabsNavbar />
  <div class="contract-container">


    <div class="contract-content">
      <!-- Header Section -->
      <div class="header-section">
        <h1 class="page-title">Doctor Contract Management</h1>
        <p class="doctor-id">Doctor ID: {{ doctorId || 'Not specified' }}</p>
      </div>

      <!-- Contract Details Card -->
      <div class="contract-card">
        <div class="card-header">
          <h2>Pricing Contract</h2>
          <span class="status-badge" :class="contractStatusClass">
            {{ contractStatus }}
          </span>
        </div>

        <!-- Existing Contract Items -->
        <div class="contract-items">
          <div v-if="Object.keys(contract.teethTypes || {}).length" class="items-list">
            <div v-for="(price, type) in contract.teethTypes" :key="type" class="item-row">
              <div class="item-type">{{ type }}</div>
              <div class="item-price">
                <span class="currency">JOD</span>
                <input
                    v-model.number="contract.teethTypes[type]"
                    type="number"
                    min="0"
                    class="price-input"
                    @change="validatePrice(price, type)"
                />
              </div>
              <button @click="removeType(type)" class="remove-btn">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div v-else class="empty-state">
            <i class="fas fa-file-contract empty-icon"></i>
            <p>No contract terms defined yet</p>
          </div>
        </div>

        <!-- Add New Type Section -->
        <div class="add-item-section">
          <h3>Add New Term</h3>
          <div class="add-item-form">
            <div class="form-group">
              <label>Tooth Type</label>
              <input
                  v-model="newType"
                  placeholder="e.g., Molar, Crown"
                  class="type-input"
              />
            </div>
            <div class="form-group">
              <label>Price (EGP)</label>
              <input
                  v-model.number="newPrice"
                  type="number"
                  min="0"
                  placeholder="0.00"
                  class="price-input"
              />
            </div>
            <button @click="addNewType" class="add-btn">
              <i class="fas fa-plus"></i> Add Term
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="submitContract" class="save-btn" :disabled="isSaving">
            <span v-if="isSaving">
              <i class="fas fa-spinner fa-spin"></i> Saving...
            </span>
            <span v-else>
              <i class="fas fa-save"></i> Save Contract
            </span>
          </button>
          <router-link to="/my-doctors" class="cancel-btn">
            <i class="fas fa-arrow-left"></i> Back to Doctors
          </router-link>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <div v-if="showNotification" class="notification-toast" :class="notificationType">
      <i :class="notificationIcon"></i>
      <span>{{ notificationMessage }}</span>
      <button @click="showNotification = false" class="close-toast">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
import LabsNavbar from "@/components/navbars/labsNavbar.vue";
import axios from "axios";

export default {
  name: "DoctorContractView",
  components: { LabsNavbar },
  data() {
    return {
      baseUrl: 'https://rr-5d46.onrender.com/labdash',
      contract: { teethTypes: {} },
      doctorId: null,
      newType: '',
      newPrice: null,
      isSaving: false,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      notificationIcon: 'fas fa-check-circle'
    };
  },
  computed: {
    contractStatus() {
      return Object.keys(this.contract.teethTypes || {}).length
          ? 'Active'
          : 'Draft';
    },
    contractStatusClass() {
      return this.contractStatus.toLowerCase();
    }
  },
  methods: {
    async fetchContract() {
      if (!this.doctorId) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
            `${this.baseUrl}/get-doctor-contract/${this.doctorId}`,
            {
              headers: {  // The 'headers' object was missing
                "Authorization": `Bearer ${token}`
              }
            }
        );

        if (response.data.contract) {
          this.contract = response.data.contract;
          this.showNotificationMessage('Contract loaded successfully', 'success');
        }
      } catch (error) {
        console.error("Error fetching contract:", error);
        this.showNotificationMessage(
            error.response?.data?.message || 'Failed to load contract',
            'error'
        );
      }
    },
    addNewType() {
      if (!this.validateNewType()) return;

      const typeKey = this.newType.trim().toLowerCase();

      // Vue 3 way - just assign directly
      this.contract.teethTypes = {
        ...this.contract.teethTypes,
        [typeKey]: this.newPrice
      };

      this.newType = '';
      this.newPrice = null;
      this.showNotificationMessage('Term added', 'success');
    },

    removeType(type) {
      const newTeethTypes = { ...this.contract.teethTypes };
      delete newTeethTypes[type];
      this.contract.teethTypes = newTeethTypes;
      this.showNotificationMessage('Term removed', 'warning');
    },

    validateNewType() {
      if (!this.newType.trim()) {
        this.showNotificationMessage('Please enter a tooth type', 'error');
        return false;
      }
      if (this.newPrice === null || isNaN(this.newPrice) || this.newPrice < 0) {
        this.showNotificationMessage('Please enter a valid price', 'error');
        return false;
      }
      if (this.newType.trim().toLowerCase() in this.contract.teethTypes) {
        this.showNotificationMessage('This type already exists', 'error');
        return false;
      }
      return true;
    },
    validatePrice(price, type) {
      if (price === null || isNaN(price) || price < 0) {
        this.showNotificationMessage('Price must be a positive number', 'error');
        this.contract.teethTypes[type] = 0;
      }
    },
    async submitContract() {

      if (Object.keys(this.contract.teethTypes).length === 0) {
        this.showNotificationMessage('Please add at least one term', 'error');
        return;
      }

      this.isSaving = true;

      try {
        console.log(this.doctorId);
        const token = localStorage.getItem("token");
        const payload = {
          uid: this.doctorId,
          teethTypes: this.contract.teethTypes,
        };

        const response = await axios.put(
            `${this.baseUrl}/add-contract`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
        );

        if (response.data.status === 200) {
          this.showNotificationMessage('Contract saved successfully', 'success');
          this.fetchContract(); // Refresh data
        } else {
          this.showNotificationMessage(response.data.message || 'Failed to save contract', 'error');
        }
      } catch (error) {
        console.error("Error submitting contract:", error);
        this.showNotificationMessage(
            error.response?.data?.message || 'Something went wrong',
            'error'
        );
      } finally {
        this.isSaving = false;
      }
    },
    showNotificationMessage(message, type) {
      this.notificationMessage = message;
      this.notificationType = type;
      this.notificationIcon = type === 'success'
          ? 'fas fa-check-circle'
          : type === 'error'
              ? 'fas fa-exclamation-circle'
              : 'fas fa-info-circle';
      this.showNotification = true;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    }
  },
  created() {
    this.doctorId = this.$route.params.id;
    this.fetchContract();
  },
  watch: {
    '$route.params.doctorId'(newId) {
      this.doctorId = newId;
      this.fetchContract();
    }
  }
};
</script>

<style scoped>

/* In your navbar component styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  height: 60px; /* Example height */
}

/* Then adjust main content */
.contract-container {
  padding-top: 60px; /* Same as navbar height */
}
.contract-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.contract-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 5px;
}

.doctor-id {
  color: #7f8c8d;
  font-size: 1rem;
}

.contract-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.card-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #27ae60;
  color: white;
}

.status-badge.draft {
  background-color: #f39c12;
  color: white;
}

.contract-items {
  margin-bottom: 30px;
}

.items-list {
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #ecf0f1;
  transition: background-color 0.2s;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background-color: #f8f9fa;
}

.item-type {
  flex: 1;
  font-weight: 500;
  text-transform: capitalize;
}

.item-price {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.currency {
  margin-right: 5px;
  color: #7f8c8d;
}

.price-input {
  width: 100px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: right;
}

.price-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.remove-btn {
  background: none;
  border: none;
  color: #e74c3c;
  cursor: pointer;
  font-size: 1rem;
  padding: 5px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #c0392b;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #bdc3c7;
}

.add-item-section {
  margin-bottom: 30px;
}

.add-item-section h3 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.add-item-form {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.type-input, .price-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-btn {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #2980b9;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.save-btn, .cancel-btn {
  padding: 12px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn {
  background-color: #27ae60;
  color: white;
  border: none;
}

.save-btn:hover:not(:disabled) {
  background-color: #219653;
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: white;
  color: #7f8c8d;
  border: 1px solid #bdc3c7;
  text-decoration: none;
}

.cancel-btn:hover {
  background-color: #f8f9fa;
}

.notification-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px 20px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-toast.success {
  background-color: #27ae60;
}

.notification-toast.error {
  background-color: #e74c3c;
}

.notification-toast.warning {
  background-color: #f39c12;
}

.close-toast {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 15px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .contract-content {
    padding: 15px;
  }

  .add-item-form {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column-reverse;
  }

  .notification-toast {
    bottom: 15px;
    right: 15px;
    left: 15px;
    max-width: calc(100% - 30px);
  }
}
</style>