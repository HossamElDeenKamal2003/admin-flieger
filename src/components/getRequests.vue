<template>
  <div class="parent">
  <div>
    <Sidebar />
  </div>
  <div class="transactions-container">
    <waiting-drivers-number />
    <h2>Successful Transactions</h2>
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
        <td>{{ transaction.driverName }}</td>
        <td>{{ transaction.amount }}</td>
        <td>{{ transaction.transferredBy }}</td>
        <td class="success">Success</td>
      </tr>
      </tbody>
    </table>
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
  // Optional: Fetch data from an API
  async created() {
    // Example API call (uncomment and modify as needed)
    /*
    try {
      const response = await fetch('/api/successful-transactions');
      this.transactions = await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    */
  },
};
</script>

<style scoped>
.transactions-container {
  padding: 20px;
  flex: .9;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.transactions-table th,
.transactions-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.transactions-table th {
  background-color: #f2f2f2;
}

.success {
  color: green;
  font-weight: bold;
}
.parent{
  display: flex;
  justify-content: space-between;
}
@media (max-width: 2000px){
  .transactions-container{
    flex: .7;
  }
}
</style>