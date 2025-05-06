<template>
  <div class="fego-dashboard">
    <div class="sidebar">
      <Sidebar />
    </div>

    <div class="main-content">
      <WaitingDriversNumber :waiting-captains="waitingCaptains" />

      <div class="levels-prices">
        <h2>Egypt Prices</h2>
        <h3>All Levels</h3>

        <table class="prices-table">
          <thead>
          <tr class="table-header">
            <th>Vehicle</th>
            <th>Level 1</th>
            <th>Level 2</th>
            <th>Level 3</th>
            <th>Level 4</th>
            <th>Fixed Amount</th>
          </tr>
          </thead>
          <tbody>
          <tr class="row-grey">
            <td>Car</td>
            <td><input type="number" v-model="currentPrices.level1.priceCar" @change="handlePriceChange('level1', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level2.priceCar" @change="handlePriceChange('level2', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level3.priceCar" @change="handlePriceChange('level3', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level4.priceCar" @change="handlePriceChange('level4', 'priceCar')"></td>
            <td><input type="number" v-model="fixedAmounts.fixedAmountcar" @change="handleFixedAmountChange('fixedAmountcar')"></td>
          </tr>
          <tr class="row-purple">
            <td>Motorcycle</td>
            <td><input type="number" v-model="currentPrices.level1.motorocycle" @change="handlePriceChange('level1', 'motorocycle')"></td>
            <td><input type="number" v-model="currentPrices.level2.motorocycle" @change="handlePriceChange('level2', 'motorocycle')"></td>
            <td><input type="number" v-model="currentPrices.level3.motorocycle" @change="handlePriceChange('level3', 'motorocycle')"></td>
            <td><input type="number" v-model="currentPrices.level4.motorocycle" @change="handlePriceChange('level4', 'motorocycle')"></td>
            <td><input type="number" v-model="fixedAmounts.fixedAmountMotorocycle" @change="handleFixedAmountChange('fixedAmountMotorocycle')"></td>
          </tr>
          <tr class="row-grey">
            <td>Van</td>
            <td><input type="number" v-model="currentPrices.level1.priceVan" @change="handlePriceChange('level1', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level2.priceVan" @change="handlePriceChange('level2', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level3.priceVan" @change="handlePriceChange('level3', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level4.priceVan" @change="handlePriceChange('level4', 'priceVan')"></td>
            <td><input type="number" v-model="fixedAmounts.fixedAmountvan" @change="handleFixedAmountChange('fixedAmountvan')"></td>
          </tr>
          <tr class="row-purple">
            <td>Commission</td>
            <td><input type="number" v-model="currentPrices.level1.penfits" @change="handlePriceChange('level1', 'penfits')"></td>
            <td><input type="number" v-model="currentPrices.level2.penfits" @change="handlePriceChange('level2', 'penfits')"></td>
            <td><input type="number" v-model="currentPrices.level3.penfits" @change="handlePriceChange('level3', 'penfits')"></td>
            <td><input type="number" v-model="currentPrices.level4.penfits" @change="handlePriceChange('level4', 'penfits')"></td>
            <td></td>
          </tr>
          <tr class="row-grey">
            <td>comfort</td>
            <td><input type="number" v-model="currentPrices.level1.compfort" @change="handlePriceChange('level1', 'compfort')"></td>
            <td><input type="number" v-model="currentPrices.level2.compfort" @change="handlePriceChange('level2', 'compfort')"></td>
            <td><input type="number" v-model="currentPrices.level3.compfort" @change="handlePriceChange('level3', 'compfort')"></td>
            <td><input type="number" v-model="currentPrices.level4.compfort" @change="handlePriceChange('level4', 'compfort')"></td>
            <td></td>
          </tr>
          </tbody>
        </table>
      </div>
      <button class="save-btn" @click="saveAllPrices">Save All</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: 'FegoDashboard',
  components: {
    WaitingDriversNumber,
    Sidebar
  },
  data() {
    return {
      currentPrices: {
        level1: { priceCar: 0, motorocycle: 0, priceVan: 0, penfits: 0, compfort: 0 },
        level2: { priceCar: 0, motorocycle: 0, priceVan: 0, penfits: 0, compfort: 0 },
        level3: { priceCar: 0, motorocycle: 0, priceVan: 0, penfits: 0, compfort: 0 },
        level4: { priceCar: 0, motorocycle: 0, priceVan: 0, penfits: 0, compfort: 0 }
      },
      fixedAmounts: {
        fixedAmountcar: 0,
        fixedAmountvan: 0,
        fixedAmountMotorocycle: 0
      },
      changes: {},
      fixedAmountChanges: {}
    };
  },
  created() {
    this.fetchEgyptPrices();
    this.fetchFixedPrices();
  },
  methods: {
    async fetchEgyptPrices() {
      try {
        const [level1, level2, level3, level4] = await Promise.all([
          axios.get('https://backend.fego-rides.com/prices/level1/getprices?country=Egypt'),
          axios.get('https://backend.fego-rides.com/prices/level2/getprices?country=Egypt'),
          axios.get('https://backend.fego-rides.com/prices/level3/getprices?country=Egypt'),
          axios.get('https://backend.fego-rides.com/prices/level4/getprices?country=Egypt')
        ]);

        this.currentPrices = {
          level1: {
            priceCar: level1.data[0]?.priceCar || 0,
            motorocycle: level1.data[0]?.motorocycle || 0,
            priceVan: level1.data[0]?.priceVan || 0,
            penfits: level1.data[0]?.penfits || 0,
            compfort: level1.data[0]?.compfort || 0
          },
          level2: {
            priceCar: level2.data[0]?.priceCar || 0,
            motorocycle: level2.data[0]?.motorocycle || 0,
            priceVan: level2.data[0]?.priceVan || 0,
            penfits: level2.data[0]?.penfits || 0,
            compfort: level2.data[0]?.compfort || 0
          },
          level3: {
            priceCar: level3.data[0]?.priceCar || 0,
            motorocycle: level3.data[0]?.motorocycle || 0,
            priceVan: level3.data[0]?.priceVan || 0,
            penfits: level3.data[0]?.penfits || 0,
            compfort: level3.data[0]?.compfort || 0
          },
          level4: {
            priceCar: level4.data[0]?.priceCar || 0,
            motorocycle: level4.data[0]?.motorocycle || 0,
            priceVan: level4.data[0]?.priceVan || 0,
            penfits: level4.data[0]?.penfits || 0,
            compfort: level4.data[0]?.compfort || 0
          }
        };
      } catch (error) {
        console.error('Error fetching Egypt prices:', error);
      }
    },
    async fetchFixedPrices() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/prices/getFixedPrices');
        this.fixedAmounts = response.data.fixedAmounts; // Stores all three fixed amounts
        console.log(this.fixedAmounts)
      } catch (error) {
        console.error('Error fetching Fixed Prices:', error);
        alert('Error fetching Fixed Prices');
      }
    },
    handleFixedAmountChange(field) {
      this.fixedAmountChanges[field] = this.fixedAmounts[field];
    },
    handlePriceChange(level, field) {
      if (!this.changes[level]) {
        this.changes[level] = {};
      }
      this.changes[level][field] = this.currentPrices[level][field];
    },
    async saveAllPrices() {
      try {
        const updates = [];

        // Process price changes - send complete level data for each changed level
        for (const level in this.changes) {
          const updateData = {
            country: 'egypt',
            priceCar: this.currentPrices[level].priceCar || 0,
            priceVan: this.currentPrices[level].priceVan || 0,
            motorocycle: this.currentPrices[level].motorocycle || 0,
            penfits: this.currentPrices[level].penfits || 0,
            compfort: this.currentPrices[level].compfort || 0
          };

          updates.push(
              axios.patch(`https://backend.fego-rides.com/prices/${level}/updateprices`, updateData)
          );
        }

        // Process fixed amount changes - always send all three fixed amounts if any change exists
        if (Object.keys(this.fixedAmountChanges).length > 0) {
          const fixedAmountUpdate = {
            fixedAmountcar: this.fixedAmounts.fixedAmountcar || 0,
            fixedAmountvan: this.fixedAmounts.fixedAmountvan || 0,
            fixedAmountMotorocycle: this.fixedAmounts.fixedAmountMotorocycle || 0
          };

          updates.push(
              axios.patch('https://backend.fego-rides.com/prices/updateFixedAmount', fixedAmountUpdate)
          );
        }

        // Only proceed if there are actual updates
        if (updates.length > 0) {
          await Promise.all(updates);
          alert('Prices updated successfully!');
          this.changes = {};
          this.fixedAmountChanges = {};
          this.fetchEgyptPrices(); // Refresh data
          this.fetchFixedPrices(); // Refresh fixed amounts
        } else {
          alert('No changes detected to save.');
        }
      } catch (error) {
        console.error('Error updating prices:', error.response?.data || error.message);
        alert('Error updating prices: ' + (error.response?.data?.message || error.message));
      }
    }
  }
};
</script>

<style scoped>
.fego-dashboard {
  display: flex;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.sidebar {
  width: 250px;
  background-color: #6b5b95;
  color: white;
  padding: 20px;
}

.main-content {
  flex: 1;
  padding: 30px;
  background-color: #f5f7fa;
}

.levels-prices {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

h2 {
  margin-top: 0;
  color: #2c3e50;
}

h3 {
  color: #7f8c8d;
  margin-top: -10px;
  margin-bottom: 20px;
}

.prices-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.prices-table th, .prices-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.prices-table th {
  background-color: #6b5b95;
  color: white;
  font-weight: 600;
}

.prices-table input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
}

.save-btn {
  padding: 10px 20px;
  background-color: #6b5b95;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #5a4a7d;
}

/* Row styling */
.row-grey {
  background-color: #f8f9fa;
}

.row-purple {
  background-color: rgba(107, 91, 149, 0.1);
}

.row-grey:hover, .row-purple:hover {
  background-color: #e9ecef;
}

.table-header {
  background-color: #6b5b95 !important;
  color: white;
}
</style>