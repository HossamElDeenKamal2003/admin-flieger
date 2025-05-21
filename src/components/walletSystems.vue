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

      <!-- Error Message -->
      <div v-if="fetchError" class="error-message">
        {{ fetchError }}
      </div>

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
                <input type="checkbox" v-model="wallet1.isActive" />
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
                <input
                    type="number"
                    v-model.number="wallet1.car.profit"
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
                    v-model="wallet1.motorcycle.title"
                    placeholder="Motorcycle title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet1.motorcycle.description"
                    placeholder="Motorcycle description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet1.motorcycle.profit"
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
                    v-model="wallet1.van.title"
                    placeholder="Van title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet1.van.description"
                    placeholder="Van description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet1.van.profit"
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
                    type="text"
                    v-model="wallet1.comfort.title"
                    placeholder="Comfort title"
                    class="form-control title-input"
                />
                <textarea
                    v-model="wallet1.comfort.description"
                    placeholder="Comfort description"
                    class="form-control description-input"
                ></textarea>
                <input
                    type="number"
                    v-model.number="wallet1.comfort.profit"
                    placeholder="Comfort profit (%)"
                    class="form-control profit-input"
                    min="0"
                    step="0.1"
                />
              </div>
            </div>

            <button
                class="btn btn-primary"
                @click="saveWalletSettings(1)"
                :disabled="isSaving || !isWallet1Valid"
            >
              <span v-if="isSaving">Saving...</span>
              <span v-else>Save Settings</span>
            </button>
            <div v-if="!isWallet1Valid && saveAttempted" class="error-message">
              All fields must be filled
            </div>
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
                <input type="checkbox" v-model="wallet2.isActive" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
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
                step="1"
            />
            <button
                class="btn btn-primary"
                @click="saveWalletSettings(2)"
                :disabled="isSaving || !isWallet2Valid"
            >
              <span v-if="isSaving">Saving...</span>
              <span v-else>Save Settings</span>
            </button>
            <div v-if="!isWallet2Valid && saveAttempted" class="error-message">
              All fields must be filled
            </div>
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
                <input type="checkbox" v-model="wallet3.isActive" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
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
            <label>Fixed Profit</label>
            <input
                type="number"
                v-model.number="wallet3.profit"
                placeholder="Enter fixed profit"
                class="form-control"
                min="0"
                step="0.1"
            />
            <button
                class="btn btn-primary"
                @click="saveWalletSettings(3)"
                :disabled="isSaving || !isWallet3Valid"
            >
              <span v-if="isSaving">Saving...</span>
              <span v-else>Save Settings</span>
            </button>
            <div v-if="!isWallet3Valid && saveAttempted" class="error-message">
              All fields must be filled
            </div>
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
      saveAttempted: false,
      fetchError: '',
      waitingCaptains: 0,
      wallet1: {
        _id: "",
        isActive: false,
        walletType: "1",
        car: { title: "", description: "", profit: null },
        motorcycle: { title: "", description: "", profit: null },
        van: { title: "", description: "", profit: null },
        comfort: { title: "", description: "", profit: null }
      },
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
  computed: {
    isWallet1Valid() {
      return (
          this.wallet1.car.title.trim() &&
          this.wallet1.car.description.trim() &&
          this.wallet1.car.profit != null &&
          this.wallet1.motorcycle.title.trim() &&
          this.wallet1.motorcycle.description.trim() &&
          this.wallet1.motorcycle.profit != null &&
          this.wallet1.van.title.trim() &&
          this.wallet1.van.description.trim() &&
          this.wallet1.van.profit != null &&
          this.wallet1.comfort.title.trim() &&
          this.wallet1.comfort.description.trim() &&
          this.wallet1.comfort.profit != null
      );
    },
    isWallet2Valid() {
      return (
          this.wallet2.title.trim() &&
          this.wallet2.description.trim() &&
          this.wallet2.subScription != null &&
          this.wallet2.profit != null &&
          this.wallet2.days != null
      );
    },
    isWallet3Valid() {
      return (
          this.wallet3.title.trim() &&
          this.wallet3.description.trim() &&
          this.wallet3.profit != null
      );
    }
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
    async fetchWalletSettings() {
      try {
        this.fetchError = '';
        const response = await axios.get(
            "https://backend.fego-rides.com/admin/getWalletSystems?admin=true"
        );

        console.log('Fetched wallet systems:', response.data);

        const systems = response.data.systems || [];

        // Normalize and set Wallet System 1
        const system1 = systems.find(s => s.walletType === "1");
        this.wallet1 = {
          _id: system1?._id || "",
          isActive: system1?.isActive ?? false,
          walletType: "1",
          car: {
            title: system1?.carTitle || "",
            description: system1?.carDescription || "",
            profit: system1?.carProfit ?? null
          },
          motorcycle: {
            title: system1?.motorcycleTitle || "",
            description: system1?.motorcycleDescription || "",
            profit: system1?.motorcycleProfit ?? null
          },
          van: {
            title: system1?.vanTitle || "",
            description: system1?.vanDescription || "",
            profit: system1?.vanProfit ?? null
          },
          comfort: {
            title: system1?.comfortTitle || "", // Note: Missing in response
            description: system1?.comfortDescription || "", // Note: Missing in response
            profit: system1?.comfortProfit ?? null
          }
        };

        // Normalize and set Wallet System 2
        const system2 = systems.find(s => s.walletType === "2");
        this.wallet2 = {
          _id: system2?._id || "",
          subScription: system2?.subScription ?? null, // Note: Missing in response
          profit: system2?.carProfit ?? null, // Using carProfit as fallback
          isActive: system2?.isActive ?? false,
          walletType: "2",
          title: [system2?.carTitle, system2?.vanTitle, system2?.motorcycleTitle]
              .filter(Boolean)
              .join(", ") || "",
          description: [system2?.carDescription, system2?.vanDescription, system2?.motorcycleDescription]
              .filter(Boolean)
              .join("; ") || "",
          days: system2?.days ?? null // Note: Missing in response
        };

        // Normalize and set Wallet System 3
        const system3 = systems.find(s => s.walletType === "3");
        this.wallet3 = {
          _id: system3?._id || "",
          profit: system3?.carProfit ?? null, // Using carProfit as fallback
          isActive: system3?.isActive ?? false,
          walletType: "3",
          title: [system3?.carTitle, system3?.vanTitle, system3?.motorcycleTitle]
              .filter(Boolean)
              .join(", ") || "",
          description: [system3?.carDescription, system3?.vanDescription, system3?.motorcycleDescription]
              .filter(Boolean)
              .join("; ") || ""
        };

        console.log('Updated wallet1:', this.wallet1);
        console.log('Updated wallet2:', this.wallet2);
        console.log('Updated wallet3:', this.wallet3);

      } catch (error) {
        console.error("Error fetching wallet settings:", error);
        this.fetchError = 'Failed to load wallet settings. Please try again.';
      }
    },
    async saveWalletSettings(type) {
      this.saveAttempted = true;

      // Validate based on wallet type
      if (type === 1 && !this.isWallet1Valid) {
        alert("All fields in Wallet System 1 must be filled");
        return;
      }
      if (type === 2 && !this.isWallet2Valid) {
        alert("All fields in Wallet System 2 must be filled");
        return;
      }
      if (type === 3 && !this.isWallet3Valid) {
        alert("All fields in Wallet System 3 must be filled");
        return;
      }

      this.isSaving = true;
      try {
        let walletData;
        let walletId;

        if (type === 1) {
          walletData = {
            isActive: this.wallet1.isActive,
            walletType: this.wallet1.walletType,
            carTitle: this.wallet1.car.title,
            carDescription: this.wallet1.car.description,
            carProfit: this.wallet1.car.profit,
            motorcycleTitle: this.wallet1.motorcycle.title,
            motorcycleDescription: this.wallet1.motorcycle.description,
            motorcycleProfit: this.wallet1.motorcycle.profit,
            vanTitle: this.wallet1.van.title,
            vanDescription: this.wallet1.van.description,
            vanProfit: this.wallet1.van.profit,
            comfortTitle: this.wallet1.comfort.title,
            comfortDescription: this.wallet1.comfort.description,
            comfortProfit: this.wallet1.comfort.profit
          };
          walletId = this.wallet1._id;
        } else if (type === 2) {
          walletData = {
            isActive: this.wallet2.isActive,
            walletType: this.wallet2.walletType,
            title: this.wallet2.title,
            description: this.wallet2.description,
            subScription: this.wallet2.subScription,
            profit: this.wallet2.profit,
            days: this.wallet2.days
          };
          walletId = this.wallet2._id;
        } else {
          walletData = {
            isActive: this.wallet3.isActive,
            walletType: this.wallet3.walletType,
            title: this.wallet3.title,
            description: this.wallet3.description,
            profit: this.wallet3.profit
          };
          walletId = this.wallet3._id;
        }

        await axios.patch(
            `https://backend.fego-rides.com/admin/updateSystemwallet`,
            walletData,
            {
              params: {
                _id: walletId
              }
            }
        );

        alert('Success update');
      } catch (error) {
        console.error("Error saving wallet settings:", error);
        alert("Failed to update");
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