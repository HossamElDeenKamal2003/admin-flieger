<!-- Dashboard.vue -->
<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <Sidebar @toggle="handleSidebarToggle" />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="greeting">
          <h1>Good morning, MR. Fady <span class="wave">👋</span></h1>
          <p>you have 1 new Captain's Request</p>
        </div>
        <div class="header-icons">
          <i class="icon notifications"></i>
          <i class="icon menu"></i>
        </div>
      </header>

      <!-- Captain Profile Section -->
      <section class="captain-profile">
        <div class="row">
          <!-- Captain Data -->
          <div class="col-md-6">
            <div class="card captain-data">
              <h3>Captain Data</h3>
              <div class="row">
                <div class="col-md-4 text-center">
                  <img :src="captain.profile_image" alt="Captain Photo" class="captain-photo" />
                  <p class="state" :class="captain.state === 'Online' ? 'status-online' : 'status-offline'">
                    {{ captain.state }}
                  </p>
                </div>
                <div class="col-md-8">
                  <p><span>Name:</span> {{ captain.username }}</p>
                  <p><span>Phone Number:</span> {{ captain.phoneNumber }}</p>
                  <p><span>National ID:</span> {{ captain.id }}</p>
                  <p><span>Email:</span> {{ captain.email }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Vehicle Data -->
          <div class="col-md-6">
            <div class="card vehicle-data">
              <h3>Vehicle Data</h3>
              <p><span>Vehicle:</span> {{ captain.vehicleType }}</p>
              <p><span>Brand:</span> {{ captain.carModel }}</p>
              <p><span>Model:</span> {{ captain.carModelYear }}</p>
              <p><span>NO Plate:</span> {{ captain.carNumber }}</p>
              <p><span>Color:</span> {{ captain.carColor }}</p>
            </div>
          </div>
        </div>

        <!-- Trip Statistics -->
        <div class="row stats">
          <div class="col-md-2">
            <div class="stat confirmed">
              <i class="icon confirmed"></i>
              <p>Confirmed Trips {{ captain.confirmedTrips }}</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat cancelled">
              <i class="icon cancelled"></i>
              <p>Cancelled Trips {{ captain.cancelledTrips }}</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat rate">
              <i class="icon rate"></i>
              <p>Rate {{ captain.rate }}</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat cash">
              <i class="icon cash"></i>
              <p>Cash {{ captain.cash }}</p>
            </div>
          </div>
          <div class="col-md-2">
            <div class="stat wallet">
              <i class="icon wallet"></i>
              <p>Wallet {{ captain.wallet }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Trips Table -->
        <div class="card trips-table">
          <table>
            <thead>
            <tr>
              <th>N°</th>
              <th>Date</th>
              <th>Trip ID</th>
              <th>Comment</th>
              <th>Value</th>
              <th>Cash</th>
              <th>Wallet</th>
              <th>Trip State</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trip, index) in captain.recentTrips" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ trip.date }}</td>
              <td>{{ trip.tripId }}</td>
              <td>{{ trip.comment }}</td>
              <td>{{ trip.value }}</td>
              <td>{{ trip.cash }}</td>
              <td>{{ trip.wallet }}</td>
              <td :class="trip.state === 'CANCELLED' ? 'status-cancelled' : 'status-completed'">
                {{ trip.state }}
              </td>
            </tr>
            </tbody>
          </table>
          <div class="table-footer">
            <p>Total Trips: {{ captain.totalTrips }}</p>
            <div class="pagination">
              <span>1-2 of 2 items</span>
              <button :disabled="currentPage === 1" @click="currentPage--">&lt;</button>
              <button>{{ currentPage }}</button>
              <button :disabled="currentPage === totalPages" @click="currentPage++">&gt;</button>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn btn-danger" @click="deleteUser(captain._id)">License</button>
          <button class="btn btn-light" @click="redirectToImage(captain.profile_image)">Review</button>
          <button class="btn btn-light">Rides</button>
          <button class="btn btn-light">Transaction history</button>
          <button class="btn btn-light">Car details</button>
          <button
              class="btn btn-sm"
              :class="{ 'btn-primary': captain.block, 'btn-danger': !captain.block }"
              @click="toggleBlock(captain._id, captain.block)"
          >
            {{ captain.block ? 'Block' : 'UnBlock' }}
          </button>
          <button class="btn btn-danger btn-sm" @click="deleteUser(captain._id)">Delete</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Sidebar from './sidebarComponent.vue';

// Sidebar collapse state
const isSidebarCollapsed = ref(false);

const handleSidebarToggle = (collapsed) => {
  isSidebarCollapsed.value = collapsed;
};

// Adjust main content based on initial screen size and sidebar state
onMounted(() => {
  const handleResize = () => {
    if (window.innerWidth <= 768) {
      isSidebarCollapsed.value = true; // Collapse by default on mobile
    } else {
      isSidebarCollapsed.value = false; // Expand by default on desktop
    }
  };

  handleResize();
  window.addEventListener('resize', handleResize);
});

// Captain Data (mocked for now, will be fetched)
const captain = ref({
  _id: '1',
  profile_image: 'https://via.placeholder.com/100',
  username: 'Husen Seid',
  phoneNumber: '01254397845',
  id: '15236478951289',
  email: 'husen@gmail.com',
  state: 'Online',
  vehicleType: 'Car',
  carModel: 'KIA',
  carModelYear: 'CERATO - 2020',
  carNumber: '549_ش_ب',
  carColor: 'Online',
  confirmedTrips: 23,
  cancelledTrips: 10,
  rate: 5,
  cash: '125,000',
  wallet: '50 EGP',
  totalTrips: 98,
  block: false,
  recentTrips: [
    { date: '21/12/2021 - 10:00 PM', tripId: '1', comment: 'very nice', value: '50,000', cash: '50,000', wallet: '0', state: 'COMPLETED' },
    { date: '21/12/2021 - 11:00 PM', tripId: '2', comment: 'bad', value: '100,000', cash: '100,000', wallet: '0', state: 'CANCELLED' },
    { date: '20/12/2021 - 10:00 AM', tripId: '3', comment: 'good', value: '24,000', cash: '10', wallet: '14', state: 'COMPLETED' },
  ],
});

// Pagination states
const currentPage = ref(1);
const totalPages = ref(2);

// Methods
const redirectToImage = (imageUrl) => {
  window.location.href = imageUrl;
};

const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`https://backend.fego-rides.com/authdriver/delete-user/${id}`);
    if (response.status === 200) {
      alert(response.data.message);
      // Since we're showing a single captain, redirect or handle deletion accordingly
      window.location.href = '/captains'; // Redirect to a list page or handle as needed
    }
  } catch (error) {
    console.error(error);
    alert('Error occurred while deleting user.');
  }
};

const toggleBlock = async (userId, currentBlockStatus) => {
  try {
    const newBlockStatus = !currentBlockStatus;
    const response = await axios.patch(`https://backend.fego-rides.com/authdriver/patch-block/${userId}`, {
      block: newBlockStatus,
    });

    const updatedUser = response.data;
    captain.value = updatedUser;

    alert(`User ${newBlockStatus ? 'unblocked' : 'blocked'} successfully.`);
  } catch (error) {
    console.error(error);
    alert('Error occurred while updating block status.');
  }
};

const getCaptain = async () => {
  try {
    const response = await axios.get('https://backend.fego-rides.com/admin/get-drivers');
    // Assuming we're showing the first captain; adjust based on your routing logic
    if (response.data && response.data.length > 0) {
      captain.value = response.data[0];
    }
  } catch (error) {
    console.error(error);
    alert('Error occurred while fetching captain data.');
  }
};

// Fetch captain data on mount
onMounted(() => {
  getCaptain();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  height: 100vh;
  font-family: 'Arial', sans-serif;
}

/* Main Content */
.main-content {
  margin-left: 250px;
  flex: 1;
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 20px 0 0 20px;
  transition: margin-left 0.3s ease;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.greeting h1 {
  font-size: 1.5rem;
  margin: 0;
}

.greeting p {
  color: #888;
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

/* Captain Profile */
.captain-profile {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card {
  border: none;
  margin-bottom: 20px;
}

.captain-data,
.vehicle-data {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.captain-data h3,
.vehicle-data h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
}

.captain-photo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.state {
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-online::before,
.status-offline::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-online::before {
  background-color: #28c76f;
}

.status-offline::before {
  background-color: #ff4d4f;
}

.captain-data p,
.vehicle-data p {
  margin: 5px 0;
}

.captain-data span,
.vehicle-data span {
  font-weight: bold;
  color: #333;
  margin-right: 5px;
}

/* Stats */
.stats {
  margin: 20px 0;
}

.stat {
  text-align: center;
  padding: 10px;
  border-radius: 10px;
  color: white;
}

.stat.confirmed {
  background-color: #00cfe8;
}

.stat.cancelled {
  background-color: #ff4d4f;
}

.stat.rate {
  background-color: #6b48ff;
}

.stat.cash {
  background-color: #28c76f;
}

.stat.wallet {
  background-color: #1e1e1e;
}

.stat p {
  margin: 5px 0 0;
  font-size: 0.9rem;
}

.stat i {
  font-size: 1.5rem;
}

/* Trips Table */
.trips-table {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  font-weight: bold;
  color: #333;
}

.status-cancelled {
  color: #ff4d4f;
}

.status-completed {
  color: #28c76f;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
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

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 5px;
  font-size: 0.9rem;
}

.btn-danger {
  background-color: #ff4d4f;
  color: white;
  border: none;
}

.btn-light {
  background-color: #f5f7fa;
  color: #333;
  border: 1px solid #ddd;
}

.btn-primary {
  background-color: #00cfe8;
  color: white;
  border: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 80px;
  }

  .main-content-expanded {
    margin-left: 250px;
  }
}

@media (min-width: 769px) {
  .main-content {
    margin-left: 250px !important;
  }
}
</style>