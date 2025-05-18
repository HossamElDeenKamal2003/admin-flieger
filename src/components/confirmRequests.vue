```vue
<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div class="sidebar">
      <sidebarComponent />
    </div>
    <!-- Main Content -->
    <div class="main-content">
      <WaitingDriversNumber :waiting-captains="waitingCaptains" />
      <div class="transaction-management">
        <h2 class="section-title">Transaction Management</h2>
        <!-- Display Wallet -->
        <p class="wallet-info">Driver Wallet: {{ wallet || 'N/A' }}</p>
        <!-- Transaction Form -->
        <div class="transaction-form">
          <div class="input-wrapper">
            <input v-model="idDriver" placeholder="Enter ID Driver" class="form-input" />
          </div>
          <div class="input-wrapper">
            <input v-model="transaction.transferBy" placeholder="Transfer by" class="form-input transfer-by" />
          </div>
          <div class="input-wrapper">
            <input v-model="sender" placeholder="Sender Name" class="form-input transfer-by" :disabled="true" />
          </div>
          <div class="input-wrapper">
            <input v-model.number="transaction.amount" placeholder="Enter an Amount" class="form-input transfer-by" type="number" />
          </div>
          <div class="input-wrapper">
            <input v-model="transaction.transactionNumber" placeholder="Enter Transaction Number" class="form-input" />
          </div>
          <button @click="applyTransfer" class="confirm-button">Confirm</button>
          <button @click="copyAllText" class="copy-button">📋</button>
          <p v-if="transaction.updatedAt" class="timestamp">Transfer Time: {{ formatDate(transaction.updatedAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import sidebarComponent from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";
import axios from 'axios';

export default defineComponent({
  components: { WaitingDriversNumber, sidebarComponent },
  data() {
    return {
      waitingCaptains: 0, // Added to avoid prop error
      wallet: this.$route.query.wallet || 'N/A',
      requestId: this.$route.query.requestId || '',
      transaction: {
        idDriver: this.$route.params.id || '',
        transferBy: '',
        sender: '',
        amount: parseFloat(this.$route.query.amount) || 0,
        transactionNumber: '',
        updatedAt: null
      }
    };
  },
  computed: {
    sender: {
      get() {
        return this.transaction.sender;
      },
      set(value) {
        this.transaction.sender = value;
      }
    },
    idDriver: {
      get() {
        return this.transaction.idDriver;
      },
      set(value) {
        this.transaction.idDriver = value;
      }
    }
  },
  created() {
    this.idDriver = this.$route.params.id || '';
    this.sender = localStorage.getItem("username") || 'Unknown';
    // Amount is already set in data initialization
  },
  methods: {
    async applyTransfer() {
      try {
        const response = await axios.post('https://backend.fego-rides.com/applyReq', {
          driverId: this.transaction.idDriver,
          amount: this.transaction.amount,
          transactionId: this.transaction.transactionNumber,
          transferBy: this.transaction.transferBy,
          sender: this.transaction.sender
        });
        if (response.status === 200 || response.status === 201) {
          this.transaction.updatedAt = new Date();
          alert("Successful Transfer");
        }
      } catch (error) {
        console.error("Error applying transfer:", error);
        alert("Failed to apply transfer: " + (error.response?.data?.message || error.message));
      }
    },
    formatDate(date) {
      if (!date) return '';
      return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      }).replace(',', '');
    },
    copyAllText() {
      const allText = `${this.transaction.idDriver}\n${this.transaction.sender}\n${this.transaction.transferBy}\n${this.transaction.amount}\n${this.transaction.transactionNumber}\nWallet: ${this.wallet}`;
      if (allText.trim()) {
        navigator.clipboard.writeText(allText)
            .then(() => {
              alert('All text copied to clipboard!');
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
              alert('Failed to copy text');
            });
      }
    }
  }
});
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2f1c6a;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.transaction-management {
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 900px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #34495e;
}

.wallet-info {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 15px;
  text-align: center;
}

.transaction-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;
}

.form-input {
  width: 100%;
  max-width: 400px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 25px;
  font-size: 16px;
  background-color: #f5f5ff;
}

.form-input:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.transfer-by {
  width: 792px;
  height: 73px;
}

.copy-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  margin-top: 10px;
}

.copy-button:hover {
  opacity: 0.7;
}

.confirm-button {
  background-color: #6b48ff;
  color: white;
  padding: 10px 40px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  cursor: pointer;
}

.confirm-button:hover {
  background-color: #563bd1;
}

.timestamp {
  font-size: 14px;
  color: #666;
  margin-top: 10px;
  text-align: center;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
  }
  .main-content {
    margin-left: 80px;
  }
  .form-input.transfer-by {
    width: 100%;
    height: 50px;
  }
}

.wallet-info{
  font-weight: bold;
  color: #6b5b95;
  font-size: 1.2em;
}
</style>
```