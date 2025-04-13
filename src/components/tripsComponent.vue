<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar @toggle="handleSidebarToggle" />
    </div>

    <!-- Main Content -->
    <div :class="['main-content', { 'main-content-expanded': isSidebarExpanded }]">
      <!-- Header -->
      <header>
        <div>
          <h1>Good morning, MR.FADY 👋</h1>
          <p>you have 1 new captain's request</p>
        </div>
        <div class="header-icons">
          <i class="fas fa-plus-circle"></i>
        </div>
      </header>

      <!-- Tabs -->
      <div class="tabs">
        <button
            :class="{ 'active-tab': activeTab === 'pending' }"
            @click="activeTab = 'pending'"
        >
          PENDING (5)
        </button>
        <button
            :class="{ 'active-tab': activeTab === 'completed' }"
            @click="activeTab = 'completed'"
        >
          COMPLETED (70)
        </button>
        <button
            :class="{ 'active-tab': activeTab === 'cancelledByCaptain' }"
            @click="activeTab = 'cancelledByCaptain'"
        >
          CANCELLED BY CAPTAIN (26)
        </button>
        <button
            :class="{ 'active-tab': activeTab === 'cancelledByUser' }"
            @click="activeTab = 'cancelledByUser'"
        >
          CANCELLED BY USER (1)
        </button>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table>
          <thead>
          <tr>
            <th>Vehicle</th>
            <th>Trip ID</th>
            <th>Ordered Time</th>
            <th>Start Location</th>
            <th>Finish Location</th>
            <th>Value</th>
            <th>Payment</th>
            <th>Wallet user after trip</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="trip in filteredTrips" :key="trip.tripId">
            <td>{{ trip.vehicle }}</td>
            <td>{{ trip.tripId }}</td>
            <td>{{ trip.orderedTime }}</td>
            <td>{{ trip.startLocation }}</td>
            <td>{{ trip.finishLocation }}</td>
            <td>{{ trip.value }}</td>
            <td>{{ trip.payment }}</td>
            <td>
                <span
                    :class="{
                    'wallet-non-zero': trip.walletAfterTrip !== '0 EGP',
                    'wallet-zero': trip.walletAfterTrip === '0 EGP',
                  }"
                >
                  {{ trip.walletAfterTrip }}
                </span>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from "./sidebarComponent.vue";

export default {
  name: "tripsComponent",
  components: {
    Sidebar,
  },
  data() {
    return {
      activeTab: "pending",
      isSidebarExpanded: true, // Sidebar is expanded by default
      trips: [
        {
          userName: "Sohir Emad",
          userId: "0123466794",
          userBalance: "15 EGP",
          userImage: "https://via.placeholder.com/40",
          vehicle: "Car",
          tripId: "S0120",
          orderedTime: "04.12.2021 20:30",
          startLocation: "nn. Beu Aray, Furkat Street, Tashkent, c/zbekiston",
          finishLocation: "nn. Beu Aray, Furkat Street, Tashkent, c/zbekiston",
          value: "150",
          payment: "15 wallet + 135 Cash",
          walletAfterTrip: "0 EGP",
          status: "pending",
        },
        {
          userName: "Sohir zakaria",
          userId: "0123466794",
          userBalance: "10 EGP",
          userImage: "https://via.placeholder.com/40",
          vehicle: "Motorcycle",
          tripId: "",
          orderedTime: "04.12.2021 20:24",
          startLocation: "21 Hamidulla Oripov ko'chasi, Toukent, c/zbekiston",
          finishLocation: "21 Hamidulla Oripov ko'chasi, Toukent, c/zbekiston",
          value: "80",
          payment: "10 wallet + 70 Cash",
          walletAfterTrip: "0 EGP",
          status: "pending",
        },
        {
          userName: "shereen gall",
          userId: "0123466794",
          userBalance: "80 EGP",
          userImage: "https://via.placeholder.com/40",
          vehicle: "Microbus",
          tripId: "",
          orderedTime: "04.12.2023 20:23",
          startLocation: "76 Боронча Ўғли, Toukent, c/zbekiston",
          finishLocation: "76 Боронча Ўғли, Toukent, c/zbekiston",
          value: "60",
          payment: "60 wallet",
          walletAfterTrip: "20 EGP",
          status: "pending",
        },
        {
          userName: "sara ahmed",
          userId: "0123466794",
          userBalance: "30 EGP",
          userImage: "https://via.placeholder.com/40",
          vehicle: "Car",
          tripId: "",
          orderedTime: "17.11.2021 12:19",
          startLocation: "13 Kumari ko'chasi, Tashkent 100167, c/zbekiston",
          finishLocation: "13 Kumari ko'chasi, Tashkent 100167, c/zbekiston",
          value: "30",
          payment: "0 cash",
          walletAfterTrip: "0 EGP",
          status: "completed",
        },
        {
          userName: "lila ahmed",
          userId: "0123466794",
          userBalance: "33 EGP",
          userImage: "https://via.placeholder.com/40",
          vehicle: "Car",
          tripId: "",
          orderedTime: "04.12.2021 20:30",
          startLocation: "1 Kuyi Talarik ko'chasi, Toukent 100091, c/zbekiston",
          finishLocation: "1 Kuyi Talarik ko'chasi, Toukent 100091, c/zbekiston",
          value: "70",
          payment: "33 wallet + 37 Cash",
          walletAfterTrip: "0 EGP",
          status: "completed",
        },
      ],
    };
  },
  computed: {
    filteredTrips() {
      return this.trips.filter((trip) => trip.status === this.activeTab);
    },
  },
  methods: {
    handleSidebarToggle() {
      this.isSidebarExpanded = !this.isSidebarExpanded;
    },
  },
};
</script>

<style scoped>
/* Base Styles */
.dashboard {
  display: flex;
  min-height: 100vh;
  font-family: 'Arial', sans-serif;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #6b48ff 0%, #4b2ecc 100%);
  transition: width 0.3s ease;
}


/* Main Content */
.main-content {
  flex: 1;
  background-color: #ffffff;
  padding: 24px;
  transition: margin-left 0.3s ease;
}

.main-content-expanded {
  margin-left: 250px;
}

.main-content-expanded.sidebar-collapsed {
  margin-left: 80px;
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2a44;
}

header p {
  font-size: 14px;
  color: #2563eb;
  cursor: pointer;
  margin-top: 4px;
}

.header-icons i {
  font-size: 20px;
  color: #6b7280;
}

/* Tabs */
.tabs {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  margin-top: 24px;
}

.tabs button {
  flex: 1;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #000000;
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tabs button.active-tab {
  color: #000000;
  border-bottom: 2px solid #2563eb;
}

/* Table */
.table-container {
  margin-top: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
}

th {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  background-color: #f9fafb;
  text-transform: uppercase;
}

td {
  font-size: 14px;
  color: #374151;
  border-top: 1px solid #e5e7eb;
}

.wallet-non-zero {
  display: inline-block;
  padding: 4px 8px;
  background-color: #d1fae5;
  color: #059669;
  border-radius: 9999px;
  font-size: 14px;
}

.wallet-zero {
  display: inline-block;
  padding: 4px 8px;
  background-color: #f3f4f6;
  color: #4b5563;
  border-radius: 9999px;
  font-size: 14px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
  }
  .sidebar-collapsed {
    width: 80px;
  }

  .sidebar {
    width: 80px;
  }

  .main-content-expanded {
    margin-left: 80px;
  }

  header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-icons {
    margin-top: 8px;
  }

  .tabs {
    flex-wrap: wrap;
  }

  .tabs button {
    flex: 1 1 50%;
    margin-bottom: 8px;
  }
}
</style>