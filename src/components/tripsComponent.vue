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
        <button :class="{ 'active-tab': activeTab === 'pending' }" @click="activeTab = 'pending'">
          PENDING (5)
        </button>
        <button :class="{ 'active-tab': activeTab === 'completed' }" @click="activeTab = 'completed'">
          COMPLETED (70)
        </button>
        <button :class="{ 'active-tab': activeTab === 'cancelledByCaptain' }" @click="activeTab = 'cancelledByCaptain'">
          CANCELLED BY CAPTAIN (26)
        </button>
        <button :class="{ 'active-tab': activeTab === 'cancelledByUser' }" @click="activeTab = 'cancelledByUser'">
          CANCELLED BY USER (1)
        </button>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table>
          <thead>
          <tr>
            <th>Driver</th>
            <th>Vehicle</th>
            <th>Trip ID</th>
            <th>Ordered Time</th>
            <th>Start Location</th>
            <th>Finish Location</th>
            <th>Value</th>
            <th>Payment</th>
            <th>Wallet driver after trip</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="trip in trips" :key="trip._id">
            <!-- Driver (Image + Name) -->
            <td>
              <div style="display: flex; align-items: center;">
                <img
                    v-if="trip.driver?.profileImage"
                    :src="trip.driver.profileImage"
                    alt="Driver Image"
                    style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 8px;"
                >
                <span>{{ trip.driver?.username || 'N/A' }}</span>
              </div>
            </td>

            <!-- Vehicle -->
            <td>
                <span v-if="trip.driver">
                  {{ trip.vehicleType }} ({{ trip.driver.username }})
                </span>
              <span v-else>
                  {{ trip.vehicleType }}
                </span>
            </td>

            <!-- Trip ID -->
            <td>{{ trip.uniqueId }}</td>

            <!-- Ordered Time -->
            <td>{{ formatDate(trip.createdAt) }}</td>

            <!-- Start Location -->
            <td>{{ trip.pickupLocationName }}</td>

            <!-- Finish Location -->
            <td>{{ trip.destination }}</td>

            <!-- Value -->
            <td>{{ trip.cost }} EGP</td>

            <!-- Payment -->
            <td>
              <template v-if="trip.moneyFlow?.flowItem">
                {{ formatCurrency(trip.moneyFlow.flowItem.payWallet) }} Wallet +
                {{ formatCurrency(trip.moneyFlow.flowItem.payCash) }} Cash EGP
                <br>
                <small>Total:
                  {{ formatCurrency(
                      (trip.moneyFlow.flowItem.payWallet || 0) +
                      (trip.moneyFlow.flowItem.payCash || 0)
                  ) }} EGP
                </small>
              </template>
              <span v-else>N/A</span>
            </td>

            <!-- Wallet driver after trip -->
            <td>
                <span :class="{
                  'wallet-non-zero': trip.moneyFlow?.flowItem?.walletAfter !== 0,
                  'wallet-zero': !trip.moneyFlow?.flowItem?.walletAfter
                }">
                  {{ formatCurrency(trip.moneyFlow?.flowItem?.walletAfter || 0) }} EGP
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
  import axios from "axios";
  export default {
    name: "tripsComponent",
    components: {
      Sidebar,
    },
    data() {
      return {
        activeTab: "pending",
        isSidebarExpanded: true,
        baseUrl: "https://backend.fego-rides.com",
        trips: [

        ],
      };
    },
    computed: {
      filteredTrips() {
        return this.trips.filter((trip) => trip.status === this.activeTab);
      },
    },
    created(){
      this.getTrips();
    },
    methods: {
      handleSidebarToggle() {
        this.isSidebarExpanded = !this.isSidebarExpanded;
      },
      async getTrips() {
        try {
          const response = await axios.post(`${this.baseUrl}/wallet/get-data`);
          this.trips = response.data.data.map(trip => {
            if (trip.moneyFlow?.document?.flow?.[0] && !trip.moneyFlow.flowItem) {
              trip.moneyFlow.flowItem = trip.moneyFlow.document.flow[0];
            }
            console.log(this.trips);
            return trip;
          });
        } catch (error) {
          console.error("Error fetching trips:", error);
          alert(error.response?.data?.message || error.message);
        }
      },
      formatCurrency(value) {
        return Number(value || 0).toFixed(2);
      },
      formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString(); // Adjust format as needed
      }
    }
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