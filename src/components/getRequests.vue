<template>
  <div class="parent">
    <div class="sidebar-container">
      <Sidebar />
    </div>
    <div class="transactions-container">
      <waiting-drivers-number />
      <h2>Successful Transactions</h2>
      <div class="search-container">
        <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by Driver Name or National ID"
            class="search-input"
        />
      </div>
      <div class="table-responsive">
        <table class="transactions-table">
          <thead>
          <tr>
            <th>Driver Name</th>
            <th>National ID</th>
            <th>Amount</th>
            <th>Wallet</th>
            <th>Sender</th>
            <th>Transferred By</th>
            <th>Status</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="transaction in filteredTransactions" :key="transaction.id">
            <td data-label="Driver Name">{{ transaction.driverName }}</td>
            <td data-label="National ID">{{ transaction.nationalId }}</td>
            <td data-label="Amount">{{ transaction.amount }} EGP</td>
            <td data-label="Wallet">{{ transaction.wallet }} EGP</td>
            <td data-label="Sender">{{ transaction.sender }}</td>
            <td data-label="Transferred By">{{ transaction.transferredBy }}</td>
            <td class="success" data-label="Status">Success</td>
          </tr>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="7" class="no-data">No transactions found</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";
import Sidebar from "@/components/sidebarComponent.vue";
import axios from 'axios';

export default {
  name: "SuccessfulTransactions",
  components: { WaitingDriversNumber, Sidebar },
  data() {
    return {
      transactions: [],
      searchQuery: '',
      loading: false,
    };
  },
  computed: {
    filteredTransactions() {
      if (!this.searchQuery.trim()) {
        return this.transactions;
      }
      const query = this.searchQuery.trim().toLowerCase();
      return this.transactions.filter(
          (transaction) =>
              transaction.driverName.toLowerCase().includes(query) ||
              transaction.nationalId.toLowerCase().includes(query)
      );
    },
  },
  created() {
    this.fetchSuccessTransfer();
  },
  methods: {
    async fetchSuccessTransfer() {
      this.loading = true;
      try {
        const response = await axios.get('https://backend.fego-rides.com/get-success-transfer');
        this.transactions = response.data.map((item) => ({
          id: item._id,
          driverName: item.driverId?.username || 'N/A',
          nationalId: item.driverId?.id || 'N/A',
          amount: item.amount || 0,
          wallet: item.driverId?.wallet || 0,
          sender: item.sender || 'N/A',
          transferredBy: item.transferBy || 'N/A',
        }));
      } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('Failed to fetch transactions. Please try again.');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.parent {
  display: flex;
  min-height: 100vh;
}

.sidebar-container {
  width: 250px;
}

.transactions-container {
  flex: 1;
  padding: 20px;
  overflow-x: auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #6b48ff;
  box-shadow: 0 0 5px rgba(107, 72, 255, 0.3);
}

.table-responsive {
  overflow-x: auto;
  margin-top: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.transactions-table th,
.transactions-table td {
  border: 1px solid #ddd;
  padding: 12px 15px;
  text-align: left;
}

.transactions-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.transactions-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.transactions-table tr:hover {
  background-color: #f1f1f1;
}

.success {
  color: #28a745;
  font-weight: bold;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #888;
}

/* Responsive styles */
@media (max-width: 992px) {
  .sidebar-container {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .parent {
    flex-direction: column;
  }

  .sidebar-container {
    width: 100%;
  }

  .transactions-container {
    padding: 15px;
  }

  .transactions-table {
    min-width: 100%;
  }

  .search-input {
    max-width: 100%;
  }
}

@media (max-width: 576px) {
  .transactions-table {
    display: block;
    width: 100%;
  }

  .transactions-table thead {
    display: none;
  }

  .transactions-table tbody {
    display: block;
    width: 100%;
  }

  .transactions-table tr {
    display: block;
    margin-bottom: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .transactions-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: right;
    padding: 8px 15px;
    border: none;
    border-bottom: 1px solid #eee;
  }

  .transactions-table td:before {
    content: attr(data-label);
    font-weight: bold;
    margin-right: auto;
    padding-right: 20px;
    text-align: left;
  }

  .transactions-table td:last-child {
    border-bottom: 0;
  }

  .success {
    justify-content: flex-end;
  }

  .success:before {
    display: none;
  }
}
</style>