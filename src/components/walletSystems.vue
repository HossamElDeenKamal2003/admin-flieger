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
            <label>Title</label>
            <input
                type="text"
                v-model="wallet2.title"
                placeholder="Enter title"
                class="form-control"
            />

            <label>Description</label>
            <textarea
                v-model="wallet2.description"
                placeholder="Enter description"
                class="form-control"
            ></textarea>

            <label>Subscription Amount</label>
            <input
                type="number"
                v-model.number="wallet2.subScription"
                placeholder="Enter subscription amount"
                class="form-control"
                min="0"
                step="1"
            />

            <label>Profit Percentage</label>
            <input
                type="number"
                v-model.number="wallet2.profit"
                placeholder="Enter profit percentage"
                class="form-control"
                min="0"
                max="100"
                step="0.1"
            />
            <label>Days</label>
            <input
                type="number"
                v-model.number="wallet2.days"
                placeholder="Enter Days"
                class="form-control"
                min="0"
                max="100"
                step="0.1"
            />

            <div class="toggle-group">
              <span :class="{ 'active-label': wallet2.isActive, 'inactive-label': !wallet2.isActive }">
                {{ wallet2.isActive ? 'Active' : 'Inactive' }}
              </span>
              <label class="switch">
                <input type="checkbox" v-model="wallet2.isActive" />
                <span class="slider round"></span>
              </label>
            </div>
            <button
                class="btn btn-primary"
                @click="saveWalletSettings(2)"
                :disabled="isSaving"
            >
              <span v-if="isSaving">Saving...</span>
              <span v-else>Save Settings</span>
            </button>
          </div>
        </div>

        <!-- Wallet System 3 Card -->
        <div class="card">
          <h3>Wallet System 3</h3>
          <div class="form-group">
            <label>Title</label>
            <input
                type="text"
                v-model="wallet3.title"
                placeholder="Enter title"
                class="form-control"
            />

            <label>Description</label>
            <textarea
                v-model="wallet3.description"
                placeholder="Enter description"
                class="form-control"
            ></textarea>

            <label>Profit Percentage</label>
            <input
                type="number"
                v-model.number="wallet3.profit"
                placeholder="Enter profit percentage"
                class="form-control"
                min="0"
                max="100"
                step="0.1"
            />

            <div class="toggle-group">
              <span :class="{ 'active-label': wallet3.isActive, 'inactive-label': !wallet3.isActive }">
                {{ wallet3.isActive ? 'Active' : 'Inactive' }}
              </span>
              <label class="switch">
                <input type="checkbox" v-model="wallet3.isActive" />
                <span class="slider round"></span>
              </label>
            </div>
            <button
                class="btn btn-primary"
                @click="saveWalletSettings(3)"
                :disabled="isSaving"
            >
              <span v-if="isSaving">Saving...</span>
              <span v-else>Save Settings</span>
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
import axios from "axios";

export default {
  name: "WalletSystems",
  components: {
    WaitingDriversNumber,
    Sidebar
  },
  data() {
    return {
      isSidebarExpanded: true,
      isSaving: false,
      waitingCaptains: 0,
      wallet2: {
        _id: "",
        subScription: null,
        profit: null,
        isActive: false,
        walletType: "2",
        title: "",
        description: "",
        days: null
      },
      wallet3: {
        _id: "",
        profit: null,
        isActive: false,
        walletType: "3",
        title: "",
        description: ""
      }
    };
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },

    async fetchWalletSettings() {
      try {
        const response = await axios.get(
            "https://backend.fego-rides.com/admin/getWalletSystems?admin=true",
            {
            }
        );

        const systems = response.data.systems || [];

        // Find and set Wallet System 2
        const system2 = systems.find(s => s.walletType === "2");
        if (system2) {
          this.wallet2 = {
            _id: system2._id,
            subScription: system2.subScription || null,
            profit: system2.profit || null,
            isActive: system2.isActive || false,
            walletType: "2",
            title: system2.title || "",
            days: system2.days,
            description: system2.description || ""
          };
        }

        // Find and set Wallet System 3
        const system3 = systems.find(s => s.walletType === "3");
        if (system3) {
          this.wallet3 = {
            _id: system3._id,
            profit: system3.profit || null,
            isActive: system3.isActive || false,
            walletType: "3",
            title: system3.title || "",
            description: system3.description || ""
          };
        }

      } catch (error) {
        console.error("Error fetching wallet settings:", error);
      }
    },

    async saveWalletSettings(type) {
      this.isSaving = true;
      try {
        const walletData = type === 2 ? this.wallet2 : this.wallet3;

        // Prepare the exact request body structure
        const requestBody = {
          subScription: walletData.subScription,
          profit: walletData.profit,
          isActive: walletData.isActive,
          walletType: walletData.walletType,
          title: walletData.title,
          description: walletData.description
        };

        await axios.patch(
            `https://backend.fego-rides.com/admin/updateSystemwallet`,
            requestBody,
            {
              params: {
                _id: walletData._id
              }
            }
        );

        alert('success update');

      } catch (error) {
        console.error("Error saving wallet settings:", error);
        alert("failed");
      } finally {
        this.isSaving = false;
      }
    }
  },
  created() {
    this.fetchWalletSettings();
  }
};
</script>

<style scoped>
/* Your existing styles remain unchanged */
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

textarea.form-control {
  min-height: 80px;
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