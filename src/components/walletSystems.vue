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
        <!-- Card 1 -->
        <div class="card">
          <h3>Wallet System 2</h3>
          <div class="form-group">
            <label for="wallet-limit">Set Limit Amount</label>
            <input
                type="number"
                id="wallet-limit"
                v-model="walletLimit"
                placeholder="Enter amount"
                class="form-control"
            />
          </div>
          <div class="toggle-group">
            <span :class="{ 'active-label': isWalletActive, 'inactive-label': !isWalletActive }">
              {{ isWalletActive ? 'Active' : 'Inactive' }}
            </span>
            <label class="switch">
              <input type="checkbox" v-model="isWalletActive" />
              <span class="slider round"></span>
            </label>
          </div>
          <button class="btn btn-primary" @click="saveWalletLimit">Save Limit</button>
        </div>

        <!-- Card 2 -->
        <div class="card">
          <h3>Wallet System 3</h3>
          <div class="form-group">
            <label for="transaction-fee">Set Fee Percentage</label>
            <input
                type="number"
                id="transaction-fee"
                v-model="transactionFee"
                placeholder="Enter percentage"
                class="form-control"
            />
          </div>
          <div class="toggle-group">
            <span :class="{ 'active-label': isFeeActive, 'inactive-label': !isFeeActive }">
              {{ isFeeActive ? 'Active' : 'Inactive' }}
            </span>
            <label class="switch">
              <input type="checkbox" v-model="isFeeActive" />
              <span class="slider round"></span>
            </label>
          </div>
          <button class="btn btn-primary" @click="saveTransactionFee">Save Fee</button>
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
      transactionFee: null,
      isWalletActive: false,
      isFeeActive: false,
      adminUsername: localStorage.getItem('username'),
    };
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    saveWalletLimit() {
      if (this.walletLimit) {
        alert(`Wallet Limit set to ${this.walletLimit} and status is ${this.isWalletActive ? 'Active' : 'Inactive'}`);
      } else {
        alert("Please enter a wallet limit.");
      }
    },
    saveTransactionFee() {
      if (this.transactionFee) {
        alert(`Transaction Fee set to ${this.transactionFee}% and status is ${this.isFeeActive ? 'Active' : 'Inactive'}`);
      } else {
        alert("Please enter a transaction fee percentage.");
      }
    }
  }
};
</script>

<style scoped>
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

.header-left h1 {
  display: inline;
  margin: 0 10px;
  color: #2D3748;
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

.form-group {
  margin-bottom: 15px;
  width: 100%;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #DDD;
  border-radius: 5px;
}

.toggle-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
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
}
</style>