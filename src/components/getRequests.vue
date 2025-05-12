<template>
  <div class="parent">
    <div class="sidebar-container">
      <Sidebar />
    </div>
    <div class="transactions-container">
      <waiting-drivers-number />
      <h2>Successful Transactions</h2>
      <div class="table-responsive">
        <table class="transactions-table">
          <thead>
          <tr>
            <th>Driver Name</th>
            <th>Amount</th>
            <th>Transferred By</th>
            <th>Status</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td data-label="Driver Name">{{ transaction.driverName }}</td>
            <td data-label="Amount">{{ transaction.amount }}</td>
            <td data-label="Transferred By">{{ transaction.transferredBy }}</td>
            <td class="success" data-label="Status">Success</td>
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
export default {
  name: "SuccessfulTransactions",
  components: {WaitingDriversNumber, Sidebar},
  data() {
    return {
      transactions: [
        // Mock data; replace with API call or dynamic data
        {
          id: 1,
          driverName: "John Doe",
          amount: "$150.00",
          transferredBy: "Jane Smith",
        },
        {
          id: 2,
          driverName: "Alice Johnson",
          amount: "$200.00",
          transferredBy: "Bob Wilson",
        },
        {
          id: 3,
          driverName: "Mike Brown",
          amount: "$175.00",
          transferredBy: "Sarah Davis",
        },
      ],
    };
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