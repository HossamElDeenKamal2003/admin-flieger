<template>
  <div class="parent">
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
          <h1>Good morning, {{adminUsername}} 👋</h1>
          <WaitingDriversNumber :waiting-captains="waitingCaptains" />
        </div>
        <div class="header-right">
          <i class="fas fa-plus-circle"></i>
        </div>
      </header>

      <!-- Cards Section -->
      <div class="cards-container">
        <!-- Wallet System 2 Card -->
        <div class="card">
          <h3>Wallet System 2</h3>
          <div class="form-group">
            <label for="wallet-limit">Set Limit Amount</label>
            <input
                type="number"
                id="wallet-limit"
                v-model.number="walletLimit"
                placeholder="Enter amount"
                class="form-control"
                min="0"
                step="1"
                @input="validateWalletLimit"
            />
            <div v-if="walletLimitError" class="error-message">{{ walletLimitError }}</div>

            <label for="percentage">Set Percentage</label>
            <input
                type="number"
                id="percentage"
                v-model.number="percentage"
                placeholder="Enter percentage"
                class="form-control"
                min="0"
                max="100"
                step="0.1"
                @input="validatePercentage"
            />
            <div v-if="percentageError" class="error-message">{{ percentageError }}</div>

            <div class="toggle-group">
              <span :class="{ 'active-label': isWalletActive, 'inactive-label': !isWalletActive }">
                {{ isWalletActive ? 'Active' : 'Inactive' }}
              </span>
              <label class="switch">
                <input type="checkbox" v-model="isWalletActive" />
                <span class="slider round"></span>
              </label>
            </div>
            <button
                class="btn btn-primary"
                @click="saveWalletLimit"
                :disabled="isSavingWallet || hasWalletErrors"
            >
              <span v-if="isSavingWallet">Saving...</span>
              <span v-else>Save Limit</span>
            </button>
          </div>
        </div>

        <!-- Wallet System 3 Card -->
        <div class="card">
          <h3>Wallet System 3</h3>
          <div class="form-group">
            <label for="transaction-fee">Set Fee Percentage</label>
            <input
                type="number"
                id="transaction-fee"
                v-model.number="transactionFee"
                placeholder="Enter percentage"
                class="form-control"
                min="0"
                max="100"
                step="0.1"
                @input="validateTransactionFee"
            />
            <div v-if="transactionFeeError" class="error-message">{{ transactionFeeError }}</div>

            <div class="toggle-group">
              <span :class="{ 'active-label': isFeeActive, 'inactive-label': !isFeeActive }">
                {{ isFeeActive ? 'Active' : 'Inactive' }}
              </span>
              <label class="switch">
                <input type="checkbox" v-model="isFeeActive" />
                <span class="slider round"></span>
              </label>
            </div>
            <button
                class="btn btn-primary"
                @click="saveTransactionFee"
                :disabled="isSavingFee || hasFeeErrors"
            >
              <span v-if="isSavingFee">Saving...</span>
              <span v-else>Save Fee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from './sidebarComponent.vue';
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: "walletSystems",
  components: {
    WaitingDriversNumber,
    Sidebar
  },
  data() {
    return {
      isSidebarExpanded: true,
      walletLimit: null,
      percentage: null,
      transactionFee: null,
      isWalletActive: false,
      isFeeActive: false,
      adminUsername: localStorage.getItem('username'),
      waitingCaptains: 0,
      walletLimitError: null,
      percentageError: null,
      transactionFeeError: null,
      isSavingWallet: false,
      isSavingFee: false
    };
  },
  computed: {
    hasWalletErrors() {
      return this.walletLimitError || this.percentageError;
    },
    hasFeeErrors() {
      return this.transactionFeeError;
    }
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },

    validateWalletLimit() {
      if (this.walletLimit < 0) {
        this.walletLimitError = "Limit cannot be negative";
      } else {
        this.walletLimitError = null;
      }
    },

    validatePercentage() {
      if (this.percentage < 0 || this.percentage > 100) {
        this.percentageError = "Percentage must be between 0 and 100";
      } else {
        this.percentageError = null;
      }
    },

    validateTransactionFee() {
      if (this.transactionFee < 0 || this.transactionFee > 100) {
        this.transactionFeeError = "Fee must be between 0 and 100";
      } else {
        this.transactionFeeError = null;
      }
    },

    async saveWalletLimit() {
      if (this.hasWalletErrors) return;

      this.isSavingWallet = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Saved wallet settings:', {
          limit: this.walletLimit,
          percentage: this.percentage,
          isActive: this.isWalletActive
        });
        this.$notify({
          title: 'Success',
          message: 'Wallet settings saved successfully',
          type: 'success'
        });
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: 'Failed to save wallet settings',
          type: 'error'
        });
        console.error(error);
      } finally {
        this.isSavingWallet = false;
      }
    },

    async saveTransactionFee() {
      if (this.hasFeeErrors) return;

      this.isSavingFee = true;
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Saved transaction fee:', {
          fee: this.transactionFee,
          isActive: this.isFeeActive
        });
        this.$notify({
          title: 'Success',
          message: 'Transaction fee saved successfully',
          type: 'success'
        });
      } catch (error) {
        this.$notify({
          title: 'Error',
          message: 'Failed to save transaction fee',
          type: 'error'
        });
        console.error(error);
      } finally {
        this.isSavingFee = false;
      }
    }
  }
};
</script>

<style>
.parent {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background: #6B46C1;
  color: white;
  transition: width 0.3s;
}

.sidebar-collapsed {
  width: 80px;
}

.main-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: margin-left 0.3s;
}

.main-content-expanded {
  margin-left: 250px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 20px;
  background: #E9D8FD;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h1 {
  margin: 0;
  color: #2D3748;
  font-size: 1.5rem;
}

.header-right i {
  font-size: 24px;
  color: #4C51BF;
  cursor: pointer;
}

.cards-container {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  flex-wrap: wrap;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card h3 {
  margin-top: 0;
  color: #2D3748;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #DDD;
  border-radius: 5px;
  margin-bottom: 5px;
}

.error-message {
  color: #E53E3E;
  font-size: 0.8rem;
  margin-bottom: 10px;
}

.toggle-group {
  display: flex;
  align-items: center;
  margin: 15px 0;
  justify-content: center;
  width: 100%;
}

.toggle-group span {
  margin-right: 10px;
  font-weight: bold;
}

.active-label {
  color: #38A169;
}

.inactive-label {
  color: #E53E3E;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #4C51BF;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.btn-primary {
  background: #4C51BF;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  font-weight: bold;
}

.btn-primary:disabled {
  background: #A0AEC0;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 100%;
    max-width: 400px;
  }

  .main-content-expanded {
    margin-left: 0;
  }

  .sidebar-collapsed {
    width: 0;
    overflow: hidden;
  }
}
</style>