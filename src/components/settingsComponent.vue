<template>
  <div class="app-container">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="menu-icon">
          <i class="fas fa-bars"></i>
        </div>
        <div class="greeting">
          <WaitingDriversNumber :waiting-captains="waitingCaptains" />
        </div>
        <div class="header-actions">
          <i class="fas fa-search"></i>
          <i class="fas fa-bell"></i>
          <i class="fas fa-sign-out-alt"></i>
        </div>
      </header>

      <!-- Trips Setting Section -->
      <h1 class="section-title">Trips Setting</h1>
      <div class="settings-grid">
        <!-- Waiting Time Card -->
        <div class="setting-card">
          <label class="card-label">Waiting Time (S)</label>
          <div class="card-value">
            {{ propertyForm.time || currentProperty.time }}
            <button class="edit-btn" @click="editProperty('time')">
              <span><font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('vehicle')" /></span>
            </button>
          </div>
          <form v-if="editing.time" @submit.prevent="updateProperty('time')" class="edit-form">
            <input
                type="number"
                v-model="propertyForm.time"
                class="form-control"
                placeholder="Enter Time"
                required
            />
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="cancelEdit('time')">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Max Distance to Captain See Trip Card -->
        <div class="setting-card">
          <label class="card-label">Max. Distance to captain see trip (M)</label>
          <div class="card-value">
            {{ maxDistance || currentMaxDistance }}
            <button class="edit-btn" @click="editDistance('maxDistance')">
              <span><font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('vehicle')" /></span>
            </button>
          </div>
          <form v-if="editing.maxDistance" @submit.prevent="updateDistance('maxDistance')" class="edit-form">
            <input
                type="number"
                v-model="maxDistance"
                class="form-control"
                placeholder="Enter Max Distance"
                required
            />
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="cancelEdit('maxDistance')">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Distance to Captain Make Arrived Card -->
        <div class="setting-card">
          <label class="card-label">Distance to captain Make arrived (M)</label>
          <div class="card-value">
            {{ distanceInTrip || currentDistanceInTrip }}
            <button class="edit-btn" @click="editDistanceInTrip">
              <span><font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('vehicle')" /></span>
            </button>
          </div>
          <form v-if="editing.distanceInTrip" @submit.prevent="updateDistanceInTrip" class="edit-form">
            <input
                type="number"
                v-model="distanceInTrip"
                class="form-control"
                placeholder="Enter Distance"
                required
            />
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="cancelEdit('distanceInTrip')">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Max Distance to Captain See Another Offer Card -->
        <div class="setting-card">
          <label class="card-label">Max. Distance to captain see another offer (M)</label>
          <div class="card-value">
            {{ currentMaxDistanceOffer }}
            <button class="edit-btn" @click="editDistance('maxDistanceOffer')">
              <span><font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('vehicle')" /></span>
            </button>
          </div>
          <form v-if="editing.maxDistanceOffer" @submit.prevent="updateDistance('maxDistanceOffer')" class="edit-form">
            <input
                type="number"
                v-model="currentMaxDistanceOffer"
                class="form-control"
                placeholder="Enter Max Distance"
                required
            />
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="cancelEdit('maxDistanceOffer')">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Daily Target Card -->
        <div class="setting-card">
          <label class="card-label">Daily Target (Trips)</label>
          <div class="card-value">
            {{ targets.daily || currentTargets.daily }}
            <button class="edit-btn" @click="editTarget('daily')">
              <span><font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('vehicle')" /></span>
            </button>
          </div>
          <form v-if="editing.daily" @submit.prevent="updateTarget('daily')" class="edit-form">
            <input
                type="number"
                v-model.number="targets.daily"
                class="form-control"
                placeholder="Enter Daily Target"
                required
            />
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="cancelEdit('daily')">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Weekly Target Card -->
        <div class="setting-card">
          <label class="card-label">Weekly Target (Trips)</label>
          <div class="card-value">
            {{ targets.weekly || currentTargets.weekly }}
            <button class="edit-btn" @click="editTarget('weekly')">
              <span><font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('vehicle')" /></span>
            </button>
          </div>
          <form v-if="editing.weekly" @submit.prevent="updateTarget('weekly')" class="edit-form">
            <input
                type="number"
                v-model.number="targets.weekly"
                class="form-control"
                placeholder="Enter Weekly Target"
                required
            />
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="cancelEdit('weekly')">Cancel</button>
            </div>
          </form>
        </div>

        <!-- Monthly Target Card -->
        <div class="setting-card">
          <label class="card-label">Monthly Target (Trips)</label>
          <div class="card-value">
            {{ targets.monthly || currentTargets.monthly }}
            <button class="edit-btn" @click="editTarget('monthly')">
              <span><font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('vehicle')" /></span>
            </button>
          </div>
          <form v-if="editing.monthly" @submit.prevent="updateTarget('monthly')" class="edit-form">
            <input
                type="number"
                v-model.number="targets.monthly"
                class="form-control"
                placeholder="Enter Monthly Target"
                required
            />
            <div class="form-actions">
              <button type="submit" class="save-btn">Save</button>
              <button type="button" class="cancel-btn" @click="cancelEdit('monthly')">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from "./sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  data() {
    return {
      propertyForm: {
        time: '',
      },
      currentProperty: {},
      maxDistance: '',
      currentMaxDistance: '',
      maxDistanceOffer: '',
      currentMaxDistanceOffer: '',
      distanceInTrip: '',
      currentDistanceInTrip: '',
      targets: {
        daily: '',
        weekly: '',
        monthly: '',
      },
      currentTargets: {
        daily: '',
        weekly: '',
        monthly: '',
      },
      adminUsername: localStorage.getItem('username'),
      editing: {
        time: false,
        maxDistance: false,
        maxDistanceOffer: false,
        distanceInTrip: false,
        daily: false,
        weekly: false,
        monthly: false,
      },
      waitingCaptains: 0, // Added to avoid prop warning

    };
  },
  components: {
    WaitingDriversNumber,
    Sidebar,
  },
  created() {
    this.fetchProperties();
    this.fetchDistances();
    this.fetchDistanceInTrip();
    this.fetchTargets();
  },
  methods: {
    async fetchProperties() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/admin/get-properties');
        this.currentProperty = response.data;
      } catch (error) {
        console.error('Error fetching properties:', error);
        alert('Error fetching properties');
      }
    },
    async fetchDistances() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/book/get-distance-find-drivers');
        this.currentMaxDistance = response.data.message.maxDistance;
        this.currentMaxDistanceOffer = response.data.message.maxDistance; // Adjust if separate endpoint
      } catch (error) {
        console.error('Error fetching distances:', error);
        alert('Error fetching distances');
      }
    },
    async fetchDistanceInTrip() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/admin/get-des');
        this.currentDistanceInTrip = response.data.distances[0].distance;
      } catch (error) {
        console.error('Error fetching distance in trip:', error);
        alert('Error fetching distance in trip');
      }
    },
    async fetchTargets() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/target');
        this.currentTargets = {
          daily: response.data.target.daily || 0,
          weekly: response.data.target.weekly || 0,
          monthly: response.data.target.monthly || 0,
        };
      } catch (error) {
        console.error('Error fetching targets:', error);
        alert('Error fetching targets');
      }
    },
    async updateProperty(field) {
      try {
        const response = await axios.patch('https://backend.fego-rides.com/admin/patch-time-distance', {
          time: this.propertyForm.time,
        });
        console.log(response.data);
        alert('Waiting Time Updated Successfully');
        this.fetchProperties();
        this.editing[field] = false;
      } catch (error) {
        console.error('Error updating property:', error);
        alert('Error Updating Waiting Time');
      }
    },
    async updateDistance(field) {
      try {
        const distance = field === 'maxDistance' ? this.maxDistance : this.maxDistanceOffer;
        const response = await axios.patch('https://backend.fego-rides.com/book/max-distance', { maxDistance: distance });
        console.log(response.data);
        alert('Distance Updated Successfully');
        this.fetchDistances();
        this.editing[field] = false;
      } catch (error) {
        console.error('Error updating distance:', error);
        alert('Error Updating Distance');
      }
    },
    async updateDistanceInTrip() {
      try {
        const response = await axios.patch('https://backend.fego-rides.com/admin/update-dis', {
          distance: this.distanceInTrip,
        });
        if (response.status === 200) {
          alert('Distance Updated Successfully');
          this.fetchDistanceInTrip();
          this.editing.distanceInTrip = false;
        }
      } catch (error) {
        console.error('Error updating distance in trip:', error);
        alert('Error When Updating Distance');
      }
    },
    async updateTarget(field) {
      try {
        const payload = {
          daily: this.targets.daily || this.currentTargets.daily,
          weekly: this.targets.weekly || this.currentTargets.weekly,
          monthly: this.targets.monthly || this.currentTargets.monthly,
        };
        const response = await axios.post('https://backend.fego-rides.com/target', payload);
        console.log(response.data);
        alert(`${field.charAt(0).toUpperCase() + field.slice(1)} Target Updated Successfully`);
        this.fetchTargets();
        this.editing[field] = false;
      } catch (error) {
        console.error(`Error updating ${field} target:`, error);
        alert(`Error Updating ${field.charAt(0).toUpperCase() + field.slice(1)} Target`);
      }
    },
    editProperty(field) {
      this.editing[field] = true;
    },
    editDistance(field) {
      this.editing[field] = true;
    },
    editDistanceInTrip() {
      this.editing.distanceInTrip = true;
    },
    editTarget(field) {
      this.editing[field] = true;
      this.targets[field] = this.currentTargets[field]; // Pre-fill with current value
    },
    cancelEdit(field) {
      this.editing[field] = false;
      this.propertyForm.time = '';
      this.maxDistance = '';
      this.maxDistanceOffer = '';
      this.distanceInTrip = '';
      this.targets.daily = '';
      this.targets.weekly = '';
      this.targets.monthly = '';
    },
  },
};
</script>

<style scoped>
/* Sidebar */
.sidebar {
  width: 250px;
  transition: width 0.3s ease;
  color: #ffffff;
}

.sidebar-collapsed {
  width: 80px;
}

/* General Layout */
.app-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
  font-family: 'Inter', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 220px;
  background-color: #6b5b95;
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.logo img {
  width: 40px;
  margin-right: 10px;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
}

.sidebar-nav li {
  padding: 12px 0;
  display: flex;
  align-items: center;
  font-size: 16px;
  cursor: pointer;
}

.sidebar-nav li i {
  margin-right: 10px;
}

.sidebar-nav li.active {
  background-color: #8a7db5;
  border-radius: 8px;
  padding-left: 10px;
}

.submenu {
  margin-left: 30px;
  margin-top: 5px;
}

.submenu li {
  padding: 8px 0;
  font-size: 14px;
  color: #d3d3d3;
}

span {
  color: red;
}

.submenu li.active {
  color: white;
  background: none;
  padding-left: 0;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Header */
.header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
}

.menu-icon i {
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.greeting {
  font-size: 16px;
  color: #333;
  flex: 1;
  text-align: center;
}

.greeting .notification {
  color: #007bff;
  cursor: pointer;
}

.header-actions i {
  font-size: 20px;
  margin-left: 15px;
  cursor: pointer;
  color: #333;
}

/* Section Title */
.section-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
}

/* Setting Card */
.setting-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  width: 500px;
  margin: 0 auto;
}

.card-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
  display: block;
  line-height: 1.4;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.edit-btn {
  background: none;
  border: none;
  cursor: pointer;
}

.edit-btn i {
  color: #6b5b95;
  font-size: 16px;
}

.edit-form {
  margin-top: 15px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.save-btn,
.cancel-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn {
  background-color: #6b5b95;
  color: white;
}

.cancel-btn {
  background-color: #e0e0e0;
  color: #333;
}
</style>