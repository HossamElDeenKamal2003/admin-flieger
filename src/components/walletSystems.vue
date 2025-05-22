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
          <i class="fas fa-bars" @click="handleSidebarToggle" aria-label="Toggle sidebar"></i>
          <WaitingDriversNumber :waiting-captains="waitingCaptains" />
        </div>
        <div class="header-right">
          <i class="fas fa-plus-circle" aria-label="Add new item"></i>
        </div>
      </header>

      <!-- Loading and Error Messages -->
      <div v-if="isFetching" class="loading-message">Loading wallet settings...</div>
      <div v-else-if="fetchError" class="error-message">{{ fetchError }}</div>

      <!-- Cards Section -->
      <div class="cards-container">
        <!-- Wallet System 1 Card -->
        <div class="card">
          <div class="card-header">
            <h6>Wallet System 1</h6>
            <div class="toggle-group">
              <span :class="{ 'active-label': wallet1.isActive, 'inactive-label': !wallet1.isActive }">
                {{ wallet1.isActive ? 'Active' : 'Inactive' }}
              </span>
              <label class="switch">
                <input
                    type="checkbox"
                    v-model="wallet1.isActive"
                    :aria-label="`Toggle Wallet System 1 ${wallet1.isActive ? 'off' : 'on'}`"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <!-- Car -->
            <div class="vehicle-row">
              <label>Car</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet1.car.title"
                    placeholder="Car title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet1.car.description"
                    placeholder="Car description"
                    class="form-control description-input"
                ></textarea>
              </div>
            </div>

            <!-- Motorcycle -->
            <div class="vehicle-row">
              <label>Motorcycle</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet1.motorcycle.title"
                    placeholder="Motorcycle title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet1.motorcycle.description"
                    placeholder="Motorcycle description"
                    class="form-control description-input"
                ></textarea>
              </div>
            </div>

            <!-- Van -->
            <div class="vehicle-row">
              <label>Van</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet1.van.title"
                    placeholder="Van title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet1.van.description"
                    placeholder="Van description"
                    class="form-control description-input"
                ></textarea>
              </div>
            </div>

            <button
                class="btn btn-primary"
                @click="saveWalletSettings(wallet1)"
                :disabled="isSaving"
            >
              <span v-if="isSaving">Saving...</span>
              <span v-else>Save Settings</span>
            </button>
          </div>
        </div>

        <!-- Wallet System 2 Card -->
        <div class="card">
          <div class="card-header">
            <h6>Wallet System 2</h6>
            <div class="toggle-group">
              <span :class="{ 'active-label': wallet2.isActive, 'inactive-label': !wallet2.isActive }">
                {{ wallet2.isActive ? 'Active' : 'Inactive' }}
              </span>
              <label class="switch">
                <input
                    type="checkbox"
                    v-model="wallet2.isActive"
                    :aria-label="`Toggle Wallet System 2 ${wallet2.isActive ? 'off' : 'on'}`"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <!-- Car -->
            <div class="vehicle-row">
              <label>Car</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet2.car.title"
                    placeholder="Car title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet2.car.description"
                    placeholder="Car description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet2.car.profit"
                    placeholder="Car profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <!-- Motorcycle -->
            <div class="vehicle-row">
              <label>Motorcycle</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet2.motorcycle.title"
                    placeholder="Motorcycle title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet2.motorcycle.description"
                    placeholder="Motorcycle description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet2.motorcycle.profit"
                    placeholder="Motorcycle profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <!-- Van -->
            <div class="vehicle-row">
              <label>Van</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet2.van.title"
                    placeholder="Van title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet2.van.description"
                    placeholder="Van description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet2.van.profit"
                    placeholder="Van profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <!-- Comfort -->
            <div class="vehicle-row">
              <label>Comfort</label>
              <div class="input-group">
                <input
                    type="number"
                    v-model.number="wallet2.comfort.profit"
                    placeholder="Comfort profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <!-- Subscription -->
            <div class="vehicle-row">
              <label>Subscription</label>
              <div class="input-group">
                <input
                    type="number"
                    v-model.number="wallet2.subscription.cost"
                    placeholder="Subscription cost (EGP)"
                    class="form-control profit-input"
                    min="0"
                    step="0.01"
                />
                <input
                    type="number"
                    v-model.number="wallet2.subscription.days"
                    placeholder="Subscription days"
                    class="form-control profit-input"
                    min="0"
                    step="1"
                />
              </div>
            </div>

            <button
                class="btn btn-primary"
                @click="saveWalletSettings(wallet2)"
                :disabled="isSaving"
            >
              <span v-if="isSaving">Saving...</span>
              <span v-else>Save Settings</span>
            </button>
          </div>
        </div>

        <!-- Wallet System 3 Card -->
        <div class="card">
          <div class="card-header">
            <h6>Wallet System 3</h6>
            <div class="toggle-group">
              <span :class="{ 'active-label': wallet3.isActive, 'inactive-label': !wallet3.isActive }">
                {{ wallet3.isActive ? 'Active' : 'Inactive' }}
              </span>
              <label class="switch">
                <input
                    type="checkbox"
                    v-model="wallet3.isActive"
                    :aria-label="`Toggle Wallet System 3 ${wallet3.isActive ? 'off' : 'on'}`"
                />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <!-- Car -->
            <div class="vehicle-row">
              <label>Car</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet3.car.title"
                    placeholder="Car title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet3.car.description"
                    placeholder="Car description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet3.car.profit"
                    placeholder="Car profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <!-- Motorcycle -->
            <div class="vehicle-row">
              <label>Motorcycle</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet3.motorcycle.title"
                    placeholder="Motorcycle title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet3.motorcycle.description"
                    placeholder="Motorcycle description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet3.motorcycle.profit"
                    placeholder="Motorcycle profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <!-- Van -->
            <div class="vehicle-row">
              <label>Van</label>
              <div class="input-group">
                <input
                    type="text"
                    v-model="wallet3.van.title"
                    placeholder="Van title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet3.van.description"
                    placeholder="Van description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet3.van.profit"
                    placeholder="Van profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <!-- Comfort -->
            <div class="vehicle-row">
              <label>Comfort</label>
              <div class="input-group">
                <input
                    type="number"
                    v-model.number="wallet3.comfort.profit"
                    placeholder="Comfort profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <button
                class="btn btn-primary"
                @click="saveWalletSettings(wallet3)"
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

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'https://backend.fego-rides.com';

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
      isFetching: false,
      fetchError: '',
      waitingCaptains: 0,
      wallet1: {
        _id: "",
        isActive: false,
        walletType: "1",
        car: { title: "", description: "" },
        motorcycle: { title: "", description: "" },
        van: { title: "", description: "" }
      },
      wallet2: {
        _id: "",
        isActive: false,
        walletType: "2",
        car: { title: "", description: "", profit: null },
        motorcycle: { title: "", description: "", profit: null },
        van: { title: "", description: "", profit: null },
        comfort: { profit: null },
        subscription: { cost: null, days: null }
      },
      wallet3: {
        _id: "",
        isActive: false,
        walletType: "3",
        car: { title: "", description: "", profit: null },
        motorcycle: { title: "", description: "", profit: null },
        van: { title: "", description: "", profit: null },
        comfort: { profit: null }
      }
    };
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    validateWallet(wallet) {
      const errors = [];
      if (wallet.walletType === "2") {
        if (wallet.subscription.days !== null && (wallet.subscription.days < 0 || !Number.isInteger(wallet.subscription.days))) {
          errors.push("Subscription days must be a non-negative integer.");
        }
        if (wallet.subscription.cost !== null && wallet.subscription.cost < 0) {
          errors.push("Subscription cost must be non-negative.");
        }
      }
      return errors;
    },
    async fetchWalletSettings() {
      this.isFetching = true;
      this.fetchError = '';
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/getWalletSystems?admin=true`);
        console.log('Fetched wallet systems:', response.data);

        const systems = response.data.systems || [];

        const updateWallet = (system, walletType) => {
          const sys = systems.find(s => s.walletType === walletType);
          if (walletType === "1") {
            return {
              _id: sys?._id || "",
              isActive: sys?.isActive ?? false,
              walletType,
              car: {
                title: sys?.carTitle || "",
                description: sys?.carDescription || ""
              },
              motorcycle: {
                title: sys?.motorcycleTitle || "",
                description: sys?.motorcycleDescription || ""
              },
              van: {
                title: sys?.vanTitle || "",
                description: sys?.vanDescription || ""
              }
            };
          } else {
            return {
              _id: sys?._id || "",
              isActive: sys?.isActive ?? false,
              walletType,
              car: {
                title: sys?.carTitle || "",
                description: sys?.carDescription || "",
                profit: sys?.carProfit ?? null
              },
              motorcycle: {
                title: sys?.motorcycleTitle || "",
                description: sys?.motorcycleDescription || "",
                profit: sys?.motorcycleProfit ?? null
              },
              van: {
                title: sys?.vanTitle || "",
                description: sys?.vanDescription || "",
                profit: sys?.vanProfit ?? null
              },
              comfort: {
                profit: sys?.comfortProfit ?? null
              },
              ...(walletType === "2" ? {
                subscription: {
                  cost: sys?.subscriptionCost ?? null,
                  days: sys?.subscriptionDays ?? null
                }
              } : {})
            };
          }
        };

        this.wallet1 = updateWallet(systems, "1");
        this.wallet2 = updateWallet(systems, "2");
        this.wallet3 = updateWallet(systems, "3");

        console.log('Updated wallet1:', this.wallet1);
        console.log('Updated wallet2:', this.wallet2);
        console.log('Updated wallet3:', this.wallet3);
      } catch (error) {
        console.error("Error fetching wallet settings:", error);
        this.fetchError = 'Failed to load wallet settings. Please try again.';
      } finally {
        this.isFetching = false;
      }
    },
    async saveWalletSettings(wallet) {
      const errors = this.validateWallet(wallet);
      if (errors.length > 0) {
        alert(`Validation errors:\n${errors.join('\n')}`);
        return;
      }

      this.isSaving = true;
      try {
        const walletData = {
          isActive: wallet.isActive,
          walletType: wallet.walletType,
          carTitle: wallet.car.title,
          carDescription: wallet.car.description,
          motorcycleTitle: wallet.motorcycle.title,
          motorcycleDescription: wallet.motorcycle.description,
          vanTitle: wallet.van.title,
          vanDescription: wallet.van.description
        };

        if (wallet.walletType !== "1") {
          walletData.carProfit = wallet.car.profit;
          walletData.motorcycleProfit = wallet.motorcycle.profit;
          walletData.vanProfit = wallet.van.profit;
          walletData.comfortProfit = wallet.comfort.profit;
        }

        if (wallet.walletType === "2") {
          walletData.subscriptionCost = wallet.subscription.cost;
          walletData.subscriptionDays = wallet.subscription.days;
        }

        await axios.patch(
            `${API_BASE_URL}/admin/updateSystemwallet`,
            walletData,
            {
              params: {
                _id: wallet._id
              }
            }
        );

        alert(`Wallet System ${wallet.walletType} updated successfully`);
      } catch (error) {
        console.error(`Error saving Wallet System ${wallet.walletType} settings:`, error);
        alert(`Failed to update Wallet System ${wallet.walletType}`);
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 20px;
}

.card h6 {
  margin: 0;
  color: #2D3748;
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 15px;
  width: 100%;
}

.vehicle-row {
  margin-bottom: 15px;
}

.vehicle-row label {
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
  color: #2D3748;
}

.input-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.title-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #DDD;
  border-radius: 5px;
  min-width: 100px;
}

.description-input {
  flex: 2;
  padding: 10px;
  border: 1px solid #DDD;
  border-radius: 5px;
  min-height: 80px;
  resize: vertical;
  min-width: 150px;
}

.profit-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #DDD;
  border-radius: 5px;
  min-width: 100px;
}

.error-message {
  color: #E53E3E;
  font-size: 0.8rem;
  margin-top: 10px;
  text-align: center;
}

.loading-message {
  color: #4C51BF;
  font-size: 1rem;
  margin-top: 10px;
  text-align: center;
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-group span {
  font-weight: bold;
  font-size: 0.9rem;
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
  width: 50px;
  height: 28px;
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
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #4C51BF;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.slider.round {
  border-radius: 28px;
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

  .input-group {
    flex-direction: column;
    gap: 5px;
  }

  .title-input,
  .description-input,
  .profit-input {
    width: 100%;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .toggle-group {
    justify-content: flex-start;
  }
}
</style>