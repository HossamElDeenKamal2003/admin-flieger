```vue
<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <Sidebar @toggle="handleSidebarToggle" />

    <!-- Main Content -->
    <main class="main-content" :class="{ 'main-content-expanded': !isSidebarCollapsed }">
      <!-- Header -->
      <header class="header">
        <div class="greeting">
          <WaitingDriversNumber />
        </div>
        <div class="header-icons">
          <i class="icon notifications"></i>
          <i class="icon menu"></i>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading.driverData || loading.trips || loading.stats" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>

      <!-- Error State -->
      <div v-if="errors.driverData || errors.trips || errors.stats" class="error-message">
        <p v-if="errors.driverData">{{ errors.driverData }}</p>
        <p v-if="errors.trips">{{ errors.trips }}</p>
        <p v-if="errors.stats">{{ errors.stats }}</p>
        <button @click="retryAll">Retry All</button>
      </div>

      <!-- Driver Data Section -->
      <section class="driver-data" v-if="driverData">
        <div class="data-cards">
          <!-- Captain Data -->
          <div class="data-card captain-card">
            <div class="profile-section">
              <div class="profile-image-container">
                <img
                    :src="driverData.profileImage"
                    alt="Captain Profile"
                    class="profile-image"
                    @click="openImage(driverData.profileImage, 'profileImage')"
                >
                <input type="file" @change="uploadImage('profile_image', $event)" class="file-input" />
              </div>
              <div class="profile-info">
                <h2 style="font-weight: bold; color: #6b5b95; font-size: 1.2em">
                  {{ profileInfoTitle }}
                  <font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('captain')" />
                </h2>
                <div class="data-row">
                  <span>Name:</span>
                  <div class="field-container">
                    <span>{{ driverData.username || 'N/A' }}</span>
                  </div>
                </div>
                <div class="data-row">
                  <span>Phone Number:</span>
                  <div class="field-container">
                    <span>{{ driverData.phoneNumber || 'N/A' }}</span>
                  </div>
                </div>
                <div class="data-row">
                  <span>National ID:</span>
                  <div class="field-container">
                    <span>{{ driverData.nationalId || 'N/A' }}</span>
                  </div>
                </div>
                <div class="data-row">
                  <span>Email:</span>
                  <div class="field-container">
                    <span>{{ driverData.email || 'N/A' }}</span>
                  </div>
                </div>
                <div class="data-row">
                  <span>State:</span>
                  <div>
                    <span :class="driverData.status === 'online' ? 'status-online' : 'status-offline'"></span>
                    <span>{{ driverData.status || 'N/A' }}</span>
                  </div>
                </div>
                <div class="target-grid">
                  <div class="target-item">
                    <span class="label">Daily Target</span>
                    <span class="value">{{ driverStats.today?.tripCount || 0 }} / {{ driverStats.today?.dailyTarget || 0 }}</span>
                  </div>
                  <div class="target-item">
                    <span class="label">Week Target</span>
                    <span class="value">{{ driverStats.currentWeek?.tripCount || 0 }} / {{ driverStats.currentWeek?.weekTarget || 0 }}</span>
                  </div>
                  <div class="target-item">
                    <span class="label">Month Target</span>
                    <span class="value">{{ driverStats.lastMonth?.tripCount || 0 }} / {{ driverStats.lastMonth?.monthTarget || 0 }}</span>
                  </div>
                </div>
                <div class="data-row">
                  <span>Block Status:</span>
                  <span :class="driverData.block ? 'status-enabled' : 'status-blocked'">
                    {{ driverData.block ? 'Driver is unblocked' : 'Driver is blocked' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- Vehicle Data -->
          <div class="data-card">
            <h2 style="font-weight: bold; color: #6b5b95; font-size: 1.2em">
              {{ vehicleDataTitle }}
              <font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startSectionEditing('vehicle')" />
            </h2>
            <div class="data-row">
              <span>Vehicle:</span>
              <div class="field-container">
                <span>{{ driverData.vehicle || 'N/A' }}</span>
              </div>
            </div>
            <div class="data-row">
              <span>Brand:</span>
              <span>{{ driverData.brand || 'N/A' }}</span>
            </div>
            <div class="data-row">
              <span>Model:</span>
              <div class="field-container">
                <span>{{ driverData.model || 'N/A' }}</span>
              </div>
            </div>
            <div class="data-row">
              <span>NO Plate:</span>
              <div class="field-container">
                <span>{{ driverData.plate || 'N/A' }}</span>
              </div>
            </div>
            <div class="data-row">
              <span>Color:</span>
              <div class="field-container">
                <span>{{ driverData.color || 'N/A' }}</span>
                <span class="color-dot" :style="{ backgroundColor: driverData.color || '#000' }"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div class="summary-stats">
          <div class="stat-item">
            <button class="icon confirmed" @click="filterTrips(['end'])"></button>
            Completed Trips {{ lengthCompleted }}
          </div>
          <div class="stat-item">
            <button class="icon cancelled" @click="filterTrips('cancelled')"></button>
            Cancelled Trips {{ lengthCanceled }}
          </div>
          <div class="stat-item">
            <span class="icon rating"></span>
            Rate
            <div class="field-container">
              <span v-if="!editingField.rating">{{ driverData.rating || 0 }}</span>
              <font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startEditing('rating')" v-if="!editingField.rating" />
            </div>
          </div>
          <div class="stat-item">
            <span class="icon cash"></span>
            Cash <span>{{ driverData.cash || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="icon wallet"></span>
            Wallet
            <div class="field-container">
              <span v-if="!editingField.wallet">{{ driverData.wallet || 0 }}</span>
              <font-awesome-icon icon="fa-solid fa-pen-to-square" class="edit-icon" @click="startEditing('wallet')" v-if="!editingField.wallet" />
            </div> EGP
          </div>
        </div>

        <!-- Tabs for Additional Images and Block -->
        <div class="tabs">
          <button
              v-for="(label, index) in tabLabels"
              :key="index"
              :class="{ 'tab': true, 'active': activeTab === label.toLowerCase().replace(/\s/g, '') }"
              @click="handleTabClick(label.toLowerCase().replace(/\s/g, ''))"
          >
            {{ label === 'Block' ? (driverData.block ? 'Block' : 'Unblock') : label }}
          </button>
        </div>

        <!-- Image Modal -->
        <div v-if="showImageModal" class="modal-overlay" @click="closeImage">
          <div class="modal-content" @click.stop>
            <img
                :src="currentImageUrl"
                alt="Driver Image"
                @error="handleImageError"
            >
            <input type="file" ref="imageUpload" @change="updateImage" class="file-input-modal" />
            <button class="update-button" @click="triggerImageUpload">Update Image</button>
            <button class="close-button" @click="closeImage">Close</button>
          </div>
        </div>

        <!-- Single Field Edit Modal (for rating and wallet) -->
        <div v-if="showEditFieldModal" class="modal-overlay" @click="cancelEdit">
          <div class="modal-content" @click.stop>
            <h3>Edit {{ editingFieldLabel }}</h3>
            <div class="modal-field">
              <label>{{ editingFieldLabel }}:</label>
              <input
                  v-model="editFieldValue"
                  :type="editingField === 'rating' || editingField === 'wallet' ? 'number' : 'text'"
                  @keyup.enter="saveEdit"
                  @blur="saveEdit"
              />
            </div>
            <div class="modal-buttons">
              <button @click="saveEdit">Save</button>
              <button @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Section Edit Modal (for Captain Data and Vehicle Data) -->
        <div v-if="showSectionEditModal" class="modal-overlay" @click="cancelSectionEdit">
          <div class="modal-content" @click.stop>
            <h3>Edit {{ sectionEditing === 'captain' ? 'Captain Data' : 'Vehicle Data' }}</h3>
            <div v-for="(value, field) in sectionEditValues" :key="field" class="modal-field">
              <label>{{ fieldLabels[field] || field }}:</label>
              <input
                  v-model="sectionEditValues[field]"
                  type="text"
                  @keyup.enter="saveSectionEdit"
              />
            </div>
            <div class="modal-buttons">
              <button @click="saveSectionEdit">Save</button>
              <button @click="cancelSectionEdit">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Trip History Table -->
        <div class="trip-history">
          <table>
            <thead>
            <tr>
              <th>{{ tripHeaders[0] }}</th>
              <th>{{ tripHeaders[1] }}</th>
              <th>{{ tripHeaders[2] }}</th>
              <th>{{ tripHeaders[3] }}</th>
              <th>{{ tripHeaders[4] }}</th>
              <th>{{ tripHeaders[5] }}</th>
              <th>{{ tripHeaders[6] }}</th>
              <th>{{ tripHeaders[7] }}</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trip, index) in paginatedTrips" :key="trip._id">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ trip.date || 'N/A' }}</td>
              <td>{{ trip.uniqueId || 'N/A' }}</td>
              <td>{{ trip.comment || 'N/A' }}</td>
              <td>{{ trip.cost || 0 }}</td>
              <td>{{ trip.driverMoneyFlowId?.flow?.[0]?.payCash || 'N/A' }}</td>
              <td>{{ trip.driverMoneyFlowId?.flow?.[0]?.payWallet || 'N/A' }}</td>
              <td :class="{'status-end': trip.status === 'end', 'status-cancelled': trip.status === 'cancelled'}">{{ trip.status || 'N/A' }}</td>
              <td><button @click="openEditModal(trip)">Edit</button></td>
            </tr>
            <tr v-if="paginatedTrips.length === 0">
              <td colspan="9" class="no-data">No trip history found</td>
            </tr>
            </tbody>
          </table>

          <!-- Table Footer -->
          <div class="table-footer">
            <div>
              <p>Total Trips: {{ totalTrips || 0 }}</p>
            </div>
            <div class="pagination">
              <span>
                {{ paginationStartComputed }}-{{ paginationEndComputed }}
                of {{ totalItemsComputed }} items
              </span>
              <button :disabled="currentPage === 1" @click="currentPage--">prev</button>
              <button>{{ currentPage }}</button>
              <button :disabled="currentPage >= totalPages" @click="currentPage++">next</button>
            </div>
          </div>
        </div>

        <!-- Edit Trip Modal -->
        <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
          <div class="modal-content" @click.stop>
            <h3>Edit Trip - {{ selectedTrip.uniqueId }}</h3>
            <div class="modal-field">
              <label>Date:</label>
              <input v-model="selectedTrip.date" @change="updateTrip(selectedTrip._id, 'date', selectedTrip.date)" />
            </div>
            <div class="modal-field">
              <label>Trip ID:</label>
              <input v-model="selectedTrip.uniqueId" @change="updateTrip(selectedTrip._id, 'uniqueId', selectedTrip.uniqueId)" />
            </div>
            <div class="modal-field">
              <label>Comment:</label>
              <input v-model="selectedTrip.comment" @change="updateTrip(selectedTrip._id, 'comment', selectedTrip.comment)" />
            </div>
            <div class="modal-field">
              <label>Cost:</label>
              <input v-model.number="selectedTrip.cost" @change="updateTrip(selectedTrip._id, 'cost', selectedTrip.cost)" />
            </div>
            <div class="modal-field">
              <label>Pay Cash:</label>
              <input v-model.number="selectedTrip.driverMoneyFlowId.flow[0].payCash" @change="updateTrip(selectedTrip._id, 'payCash', selectedTrip.driverMoneyFlowId.flow[0].payCash)" />
            </div>
            <div class="modal-field">
              <label>Pay Wallet:</label>
              <input v-model.number="selectedTrip.driverMoneyFlowId.flow[0].payWallet" @change="updateTrip(selectedTrip._id, 'payWallet', selectedTrip.driverMoneyFlowId.flow[0].payWallet)" />
            </div>
            <div class="modal-field">
              <label>Status:</label>
              <select v-model="selectedTrip.status" @change="updateTrip(selectedTrip._id, 'status', selectedTrip.status)">
                <option value="end">End</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div class="modal-buttons">
              <button @click="saveTripChanges">Update</button>
              <button @click="closeEditModal">Close</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import Sidebar from './sidebarComponent.vue';
import axios from 'axios';
import WaitingDriversNumber from '@/components/waitingDriversNumber.vue';

export default {
  components: {
    WaitingDriversNumber,
    Sidebar,
  },
  data() {
    return {
      trips: [],
      cancelledTrips: [],
      isSidebarCollapsed: false,
      driverData: null,
      driverStats: {
        today: { tripCount: 0, dailyTarget: 0 },
        currentWeek: { tripCount: 0, weekTarget: 0 },
        lastMonth: { tripCount: 0, monthTarget: 0 },
      },
      adminName: localStorage.getItem('username') || 'Admin',
      newRequestsCount: 0,
      currentPage: 1,
      itemsPerPage: 10,
      loading: {
        driverData: false,
        trips: false,
        stats: false,
        action: false,
      },
      errors: {
        driverData: null,
        trips: null,
        stats: null,
      },
      lengthCanceled: 0,
      lengthCompleted: 0,
      baseUrl: 'https://backend.fego-rides.com',
      showImageModal: false,
      currentImageUrl: '',
      activeTab: null,
      profileInfoTitle: 'Captain Data',
      vehicleDataTitle: 'Vehicle Data',
      tripHeaders: ['Nº', 'Date', 'Trip ID', 'Comment', 'Value', 'Cash', 'Wallet', 'Trip State'],
      tabLabels: ['Profile Image', 'Licence', 'National ID Front', 'National ID Back', 'Selfie With ID', 'Block'],
      totalTrips: 0,
      paginationStart: 0,
      paginationEnd: 0,
      totalItems: 0,
      showEditModal: false,
      selectedTrip: {},
      filterStatus: null,
      imageFieldToUpdate: null,
      editingField: {}, // Tracks single field being edited (rating, wallet)
      showEditFieldModal: false,
      editFieldValue: '',
      editingFieldName: '',
      editingFieldLabel: '',
      showSectionEditModal: false, // Tracks section edit modal visibility
      sectionEditing: null, // Tracks which section is being edited ('captain' or 'vehicle')
      sectionEditValues: {}, // Stores values for all fields in the section being edited
      fieldLabels: {
        username: 'Name',
        phoneNumber: 'Phone Number',
        nationalId: 'National ID',
        email: 'Email',
        vehicle: 'Vehicle',
        model: 'Model',
        plate: 'NO Plate',
        color: 'Color',
        profileInfoTitle: 'Captain Data Title',
        vehicleDataTitle: 'Vehicle Data Title',
        rating: 'Rate',
        wallet: 'Wallet',
      },
    };
  },
  computed: {
    paginatedTrips() {
      let filteredTrips = this.trips;
      if (this.filterStatus) {
        if (Array.isArray(this.filterStatus)) {
          filteredTrips = this.trips.filter(trip => this.filterStatus.includes(trip.status));
        } else {
          filteredTrips = this.trips.filter(trip => trip.status === this.filterStatus);
        }
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return filteredTrips.slice(start, end) || [];
    },
    paginationStartComputed() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    paginationEndComputed() {
      const end = (this.currentPage - 1) * this.itemsPerPage + this.itemsPerPage;
      return Math.min(end, this.totalItemsComputed || 0);
    },
    totalItemsComputed() {
      if (this.filterStatus) {
        if (Array.isArray(this.filterStatus)) {
          return this.trips.filter(trip => this.filterStatus.includes(trip.status)).length;
        }
        return this.trips.filter(trip => trip.status === this.filterStatus).length;
      }
      return this.trips.length || 0;
    },
    totalPages() {
      return Math.ceil((this.totalItemsComputed || 0) / this.itemsPerPage);
    },
  },
  watch: {
    paginationStartComputed(newValue) {
      this.paginationStart = newValue;
    },
    paginationEndComputed(newValue) {
      this.paginationEnd = newValue;
    },
    totalItemsComputed(newValue) {
      this.totalItems = newValue;
      this.totalTrips = newValue;
    },
  },
  methods: {
    handleSidebarToggle(collapsed) {
      this.isSidebarCollapsed = collapsed;
    },
    handleResize() {
      if (window.innerWidth <= 768) {
        this.isSidebarCollapsed = true;
      } else {
        this.isSidebarCollapsed = false;
      }
    },
    async getTarget() {
      const driverId = this.$route.params.driverId;
      if (!driverId) {
        this.errors.stats = 'No driver ID provided.';
        alert('Invalid driver ID');
        return;
      }

      this.loading.stats = true;
      this.errors.stats = null;
      try {
        const response = await axios.get(`${this.baseUrl}/wallet/driverStatistic/${driverId}`, {
          timeout: 10000,
        });

        const stats = response.data;
        if (!stats.today || !stats.currentWeek || !stats.lastMonth) {
          throw new Error('Invalid statistics data structure');
        }

        this.driverStats = {
          today: {
            tripCount: stats.today.tripCount || 0,
            dailyTarget: stats.today.dailyTarget || 0,
          },
          currentWeek: {
            tripCount: stats.currentWeek.tripCount || 0,
            weekTarget: stats.currentWeek.weekTarget || 0,
          },
          lastMonth: {
            tripCount: stats.lastMonth.tripCount || 0,
            monthTarget: stats.lastMonth.monthTarget || 0,
          },
        };
      } catch (error) {
        console.error('Error fetching driver statistics:', error);
        this.errors.stats = this.getErrorMessage(error, 'Failed to load driver statistics.');
        alert(this.errors.stats);
      } finally {
        this.loading.stats = false;
      }
    },
    async fetchDriverData() {
      const driverId = this.$route.params.driverId;
      if (!driverId) {
        this.errors.driverData = 'No driver ID provided.';
        alert('Invalid driver ID');
        return;
      }

      this.loading.driverData = true;
      this.errors.driverData = null;
      try {
        const response = await axios.get(`${this.baseUrl}/authdriver/driver/${driverId}`, {
          timeout: 10000,
        });

        const driver = response.data.driver;
        if (!driver) {
          throw new Error('Driver data not found');
        }

        this.driverData = {
          username: driver.username || 'N/A',
          phoneNumber: driver.phoneNumber || 'N/A',
          nationalId: driver.id || 'N/A',
          email: driver.email || 'N/A',
          status: driver.status || 'offline',
          vehicle: driver.vehicleType || 'N/A',
          brand: 'N/A', // Not in schema
          model: driver.carModel || 'N/A',
          plate: driver.carNumber || 'N/A',
          color: driver.carColor || 'N/A',
          confirmedTrips: driver.ctr || 0, // Not in schema
          cancelledTrips: 0, // Not in schema
          rating: driver.rate || 0,
          cash: driver.dailayEarned || 0, // Not in schema
          wallet: driver.wallet || 0,
          block: driver.block || false,
          profileImage: driver.profile_image || 'https://via.placeholder.com/150',
          trips: driver.trips || [], // Not in schema
          driver_licence_image: driver.driver_licence_image || 'N/A',
          national_front: driver.national_front || 'N/A',
          national_back: driver.national_back || 'N/A',
          national_selfie: driver.national_selfie || 'N/A',
        };
        this.trips = driver.trips || [];
      } catch (error) {
        console.error('Error fetching driver data:', error);
        this.errors.driverData = this.getErrorMessage(error, 'Failed to load driver data.');
        alert(this.errors.driverData);
      } finally {
        this.loading.driverData = false;
      }
    },
    async getTrips() {
      const driverId = this.$route.params.driverId;
      if (!driverId) {
        this.errors.trips = 'No driver ID provided.';
        alert('Invalid driver ID');
        return;
      }

      this.loading.trips = true;
      this.errors.trips = null;
      try {
        const response = await axios.post(
            `${this.baseUrl}/wallet/filterTripsWithMoneyFlow`,
            {
              id: driverId,
              type: 'driver',
              page: 1,
            },
            { timeout: 10000 }
        );

        const { trips, cancelledTrips } = response.data;
        if (!Array.isArray(trips) || !Array.isArray(cancelledTrips)) {
          throw new Error('Invalid trips data structure');
        }

        this.trips = trips;
        this.lengthCompleted = 0;
        this.lengthCanceled = 0;
        for (let trip of this.trips) {
          if (trip.status === 'end') {
            this.lengthCompleted++;
          } else if (trip.status === 'cancelled') {
            this.lengthCanceled++;
          }
        }
        this.cancelledTrips = cancelledTrips;
      } catch (error) {
        console.error('Error fetching trips:', error);
        this.errors.trips = this.getErrorMessage(error, 'Failed to load trip history.');
        alert(this.errors.trips);
      } finally {
        this.loading.trips = false;
      }
    },
    async toggleBlock() {
      try {
        this.loading.action = true;
        const driverId = this.$route.params.driverId;
        if (!driverId) {
          alert('Invalid driver ID');
          return;
        }
        const currentBlockStatus = this.driverData.block;
        const newBlockStatus = !currentBlockStatus;

        const formData = new FormData();
        formData.append('driverId', driverId);
        formData.append('block', newBlockStatus);

        await axios.put(
            `${this.baseUrl}/authdriver/adminUpdateDriver`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 10000 }
        );

        this.driverData.block = newBlockStatus;
        alert(`Driver ${newBlockStatus ? 'unblocked' : 'blocked'} successfully`);
      } catch (error) {
        console.error('Error toggling block status:', error);
        alert(this.getErrorMessage(error, 'Failed to update block status.'));
      } finally {
        this.loading.action = false;
      }
    },
    handleTabClick(tabName) {
      this.activeTab = tabName;
      if (tabName === 'block') {
        this.toggleBlock();
      } else {
        const imageFields = {
          profileimage: 'profile_image',
          licence: 'driver_licence_image',
          nationalidfront: 'national_front',
          nationalidback: 'national_back',
          selfiewithid: 'national_selfie'
        };
        const field = imageFields[tabName];
        if (field && this.driverData[field]) {
          this.imageFieldToUpdate = field;
          this.openImage(this.driverData[field], tabName);
        }
      }
    },
    async updateField(fieldName, value) {
      try {
        this.loading.action = true;
        const driverId = this.$route.params.driverId;
        if (!driverId) {
          throw new Error('Invalid driver ID');
        }

        const formData = new FormData();
        formData.append('driverId', driverId);
        // Ensure numeric fields are sent as numbers
        if (fieldName === 'wallet' || fieldName === 'rate') {
          formData.append(fieldName, Number(value));
        } else {
          formData.append(fieldName, value);
        }

        const response = await axios.put(
            `${this.baseUrl}/authdriver/adminUpdateDriver`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 10000 }
        );

        // Update local state with response data
        if (fieldName === 'wallet' || fieldName === 'rate') {
          this.driverData[fieldName === 'rate' ? 'rating' : fieldName] = Number(response.data.driver[fieldName]);
        }
        alert(`${fieldName} updated successfully`);
      } catch (error) {
        console.error(`Error updating ${fieldName}:`, error);
        alert(this.getErrorMessage(error, `Failed to update ${fieldName}.`));
        await this.fetchDriverData();
      } finally {
        this.loading.action = false;
      }
    },
    async updateTrip(tripId, fieldName, value) {
      try {
        this.loading.action = true;
        const driverId = this.$route.params.driverId;
        const payload = {};
        if (fieldName === 'all') {
          payload.trip = value;
        } else if (fieldName.includes('.')) {
          const [parent, child] = fieldName.split('.');
          payload[parent] = { [child]: value };
        } else {
          payload[fieldName] = value;
        }
        await axios.patch(
            `${this.baseUrl}/authdriver/update-trip/${driverId}`,
            { tripId, ...payload },
            { timeout: 10000 }
        );
        alert(`${fieldName} for trip ${tripId} updated successfully`);
      } catch (error) {
        console.error(`Error updating trip ${tripId} ${fieldName}:`, error);
        alert(this.getErrorMessage(error, `Failed to update trip ${fieldName}.`));
        await this.fetchDriverData();
      } finally {
        this.loading.action = false;
      }
    },
    async uploadImage(fieldName, event) {
      try {
        this.loading.action = true;
        const driverId = this.$route.params.driverId;
        const file = event.target.files[0];
        if (!file) {
          throw new Error('No file selected');
        }

        const formData = new FormData();
        formData.append('driverId', driverId);
        if (fieldName === 'profile_image') {
          formData.append('profile_image', file);
        } else if (fieldName === 'driver_licence_image') {
          formData.append('driver_licence_image', file);
        } else if (fieldName === 'national_front') {
          formData.append('national_front', file);
        } else if (fieldName === 'national_back') {
          formData.append('national_back', file);
        } else if (fieldName === 'national_selfie') {
          formData.append('national_selfie', file);
        } else if (fieldName === 'licenseImage') {
          formData.append('licenseImage', file);
        } else {
          throw new Error('Invalid image field');
        }

        const response = await axios.put(
            `${this.baseUrl}/authdriver/adminUpdateDriver`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 10000 }
        );

        this.driverData[fieldName] = response.data.driver[fieldName] || response.data.imageUrl;
        alert(`${fieldName} updated successfully`);
      } catch (error) {
        console.error(`Error uploading ${fieldName}:`, error);
        alert(this.getErrorMessage(error, `Failed to upload ${fieldName}.`));
        await this.fetchDriverData();
      } finally {
        this.loading.action = false;
        event.target.value = '';
      }
    },
    async updateImage(event) {
      try {
        this.loading.action = true;
        const driverId = this.$route.params.driverId;
        const file = event.target.files[0];
        if (!file) {
          throw new Error('No file selected');
        }

        const formData = new FormData();
        formData.append('driverId', driverId);
        formData.append(this.imageFieldToUpdate, file);

        const response = await axios.put(
            `${this.baseUrl}/authdriver/adminUpdateDriver`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 10000 }
        );

        this.driverData[this.imageFieldToUpdate] = response.data.driver[this.imageFieldToUpdate] || response.data.imageUrl;
        this.currentImageUrl = this.driverData[this.imageFieldToUpdate];
        alert(`${this.imageFieldToUpdate} updated successfully`);
      } catch (error) {
        console.error(`Error uploading ${this.imageFieldToUpdate}:`, error);
        alert(this.getErrorMessage(error, `Failed to upload ${this.imageFieldToUpdate}.`));
        await this.fetchDriverData();
      } finally {
        this.loading.action = false;
        this.$refs.imageUpload.value = '';
      }
    },
    getErrorMessage(error, defaultMessage) {
      if (error.response) {
        return error.response.data.message || `${defaultMessage} (Error ${error.response.status})`;
      } else if (error.request) {
        return 'Network error: Please check your internet connection.';
      } else {
        return error.message || defaultMessage;
      }
    },
    retryAll() {
      this.fetchDriverData();
      this.getTrips();
      this.getTarget();
    },
    validateImageUrl(url) {
      if (!url || url === 'N/A' || typeof url !== 'string') {
        return null;
      }
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
      }
      return url;
    },
    openImage(imageUrl, tabName = null) {
      const validatedUrl = this.validateImageUrl(imageUrl);
      if (!validatedUrl) {
        console.warn('Invalid image URL:', imageUrl);
        this.currentImageUrl = 'https://via.placeholder.com/400';
        alert('Image not available');
      } else {
        this.currentImageUrl = validatedUrl;
      }
      this.showImageModal = true;
      this.activeTab = tabName;
    },
    closeImage() {
      this.showImageModal = false;
      this.currentImageUrl = '';
      this.activeTab = null;
      this.imageFieldToUpdate = null;
    },
    handleImageError() {
      console.error('Failed to load image:', this.currentImageUrl);
      this.currentImageUrl = 'https://via.placeholder.com/400';
      alert('Failed to load image');
    },
    triggerImageUpload() {
      this.$refs.imageUpload.click();
    },
    openEditModal(trip) {
      this.selectedTrip = { ...trip };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.selectedTrip = {};
    },
    saveTripChanges() {
      this.updateTrip(this.selectedTrip._id, 'all', this.selectedTrip);
      this.closeEditModal();
    },
    filterTrips(status) {
      this.filterStatus = status;
      this.currentPage = 1;
    },
    startEditing(field) {
      this.editingFieldName = field;
      this.editingFieldLabel = this.fieldLabels[field] || field;
      this.editFieldValue = this[field] || this.driverData[field];
      this.showEditFieldModal = true;
      this.editingField[field] = true;
    },
    async saveEdit() {
      const fieldMap = {
        username: 'username',
        phoneNumber: 'phoneNumber',
        nationalId: 'id',
        email: 'email',
        vehicle: 'vehicleType',
        model: 'carModel',
        plate: 'carNumber',
        color: 'carColor',
        rating: 'rate',
        wallet: 'wallet',
        profileInfoTitle: 'profileInfoTitle',
        vehicleDataTitle: 'vehicleDataTitle',
      };
      const apiFieldName = fieldMap[this.editingFieldName];
      await this.updateField(apiFieldName, this.editFieldValue);
      if (this.editingFieldName === 'profileInfoTitle' || this.editingFieldName === 'vehicleDataTitle') {
        this[this.editingFieldName] = this.editFieldValue;
      } else {
        this.driverData[this.editingFieldName] = this.editFieldValue;
      }
      this.cancelEdit();
    },
    cancelEdit() {
      this.editingField[this.editingFieldName] = false;
      this.showEditFieldModal = false;
      this.editFieldValue = '';
      this.editingFieldName = '';
      this.editingFieldLabel = '';
    },
    startSectionEditing(section) {
      this.sectionEditing = section;
      const captainFields = ['profileInfoTitle', 'username', 'phoneNumber', 'nationalId', 'email'];
      const vehicleFields = ['vehicleDataTitle', 'vehicle', 'model', 'plate', 'color'];
      const fields = section === 'captain' ? captainFields : vehicleFields;

      this.sectionEditValues = {};
      fields.forEach(field => {
        this.sectionEditValues[field] = this[field] || this.driverData[field] || '';
      });

      this.showSectionEditModal = true;
    },
    async saveSectionEdit() {
      const fieldMap = {
        username: 'username',
        phoneNumber: 'phoneNumber',
        nationalId: 'id',
        email: 'email',
        vehicle: 'vehicleType',
        model: 'carModel',
        plate: 'carNumber',
        color: 'carColor',
        profileInfoTitle: 'profileInfoTitle',
        vehicleDataTitle: 'vehicleDataTitle',
      };

      for (const [field, value] of Object.entries(this.sectionEditValues)) {
        const apiFieldName = fieldMap[field];
        await this.updateField(apiFieldName, value);
        if (field === 'profileInfoTitle' || field === 'vehicleDataTitle') {
          this[field] = value;
        } else {
          this.driverData[field] = value;
        }
      }

      this.cancelSectionEdit();
    },
    cancelSectionEdit() {
      this.showSectionEditModal = false;
      this.sectionEditing = null;
      this.sectionEditValues = {};
    },
  },
  created() {
    this.fetchDriverData();
    this.getTrips();
    this.getTarget();
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
/* Existing styles unchanged, included for completeness */
.dashboard {
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
}

.main-content {
  margin-left: 250px;
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  transition: margin-left 0.3s ease;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.greeting h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #2c3e50;
}

.greeting p {
  color: #7f8c8d;
  margin: 5px 0 0;
}

.wave {
  font-size: 1.2rem;
}

.header-icons i {
  font-size: 1.5rem;
  margin-left: 15px;
  cursor: pointer;
}

.driver-data {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid #8e44ad;
}

.data-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.data-card {
  flex: 1;
  padding: 15px;
  border: 2px solid #8e44ad;
  border-radius: 8px;
}

.captain-card {
  display: flex;
}

.profile-section {
  display: flex;
  gap: 20px;
  width: 100%;
}

.profile-image-container {
  width: 150px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #8e44ad;
  position: relative;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.profile-image:hover {
  transform: scale(1.05);
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.profile-info {
  flex: 1;
}

.data-card h2 {
  color: #2c3e50;
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.data-card h2 input,
.greeting h1 input,
.greeting p input,
.data-row input,
.summary-stats input,
.trip-history td input,
.modal-field input,
.modal-field select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 60%;
  margin: 0 5px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  color: #2c3e50;
}

.data-row span:first-child {
  font-weight: 600;
}

.field-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-icon {
  cursor: pointer;
  color: #6b48ff;
  font-size: 14px;
}

.edit-icon:hover {
  color: #ff4d4f;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  position: relative;
  max-width: 400px;
  max-height: 90%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.modal-content img {
  width: 100%;
  height: auto;
  max-height: 80vh;
}

.close-button,
.update-button {
  margin-top: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-button {
  background-color: #ff4d4f;
  color: white;
}

.update-button {
  background-color: #6b48ff;
  color: white;
  margin-right: 10px;
}

.file-input-modal {
  display: none;
}

.status-online,
.status-offline {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-online {
  background-color: #28c76f;
}

.status-offline {
  background-color: #ff4d4f;
}

.status-enabled {
  color: #28c76f;
  font-weight: 600;
}

.status-blocked {
  color: #ff4d4f;
  font-weight: 600;
}

.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: 5px;
}

.summary-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 600;
  color: white;
}

.stat-item .icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 10px;
}

.stat-item:nth-child(1) { background-color: #3498db; }
.stat-item:nth-child(1) .icon { background-color: white; }
.stat-item:nth-child(2) { background-color: #ff4d4f; }
.stat-item:nth-child(2) .icon { background-color: white; }
.stat-item:nth-child(3) { background-color: #8e44ad; }
.stat-item:nth-child(3) .icon { background-color: white; }
.stat-item:nth-child(4) { background-color: #2ecc71; }
.stat-item:nth-child(4) .icon { background-color: white; }
.stat-item:nth-child(5) { background-color: #7f8c8d; }
.stat-item:nth-child(5) .icon { background-color: white; }

.trip-history table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.trip-history th,
.trip-history td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.trip-history th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #34495e;
}

.status-end {
  color: purple;
}

.status-cancelled {
  color: red;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-footer p {
  color: #2c3e50;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #6b48ff;
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.tab {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.tab.active {
  background-color: #ff4d4f;
  color: white;
}

.tab:not(.active) {
  background-color: #ecf0f1;
  color: #34495e;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 80px;
  }

  .main-content-expanded {
    margin-left: 250px;
  }

  .data-cards {
    flex-direction: column;
  }

  .profile-section {
    flex-direction: column;
  }

  .profile-image-container {
    width: 100%;
    height: auto;
    aspect-ratio: 1/1;
  }

  .summary-stats {
    flex-wrap: wrap;
    gap: 10px;
  }

  .stat-item {
    flex: 1 1 45%;
    justify-content: center;
  }
}

@media (min-width: 769px) {
  .main-content {
    margin-left: 250px !important;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6b48ff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #ffebee;
  color: #ff4d4f;
  padding: 15px;
  margin: 20px 0;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.error-message button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  align-self: flex-start;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-field {
  margin-bottom: 15px;
}

.modal-field label {
  display: block;
  margin-bottom: 5px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.modal-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button:first-child {
  background-color: #6b48ff;
  color: white;
}

.modal-buttons button:last-child {
  background-color: #ff4d4f;
  color: white;
}

.trip-history table td button {
  padding: 5px 10px;
  background-color: #6b48ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.target-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 20px;
}

.target-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.label {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.value {
  color: #6b5b95;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .target-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```