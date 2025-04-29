<template>
  <div class="fego-dashboard">
    <div class="sidebar">
     <Sidebar />
    </div>

    <div class="main-content">
      <div class="levels-prices">
        <h2>Egypt Prices</h2>
        <h3>All Levels</h3>

        <table class="prices-table">
          <thead>
          <tr>
            <th>Vehicle</th>
            <th>Level 1</th>
            <th>Level 2</th>
            <th>Level 3</th>
            <th>Level 4</th>
            <th>Penfits</th>
            <th>Compfort</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>Car</td>
            <td><input type="number" v-model="currentPrices.level1.priceCar" @change="handlePriceChange('level1', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level2.priceCar" @change="handlePriceChange('level2', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level3.priceCar" @change="handlePriceChange('level3', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level4.priceCar" @change="handlePriceChange('level4', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level1.penfits" @change="handlePriceChange('all', 'penfits')"></td>
            <td><input type="number" v-model="currentPrices.level1.compfort" @change="handlePriceChange('all', 'compfort')"></td>
<!--            <td>-->
<!--            </td>-->
          </tr>
          <tr>
            <td>Motorcycle</td>
            <td><input type="number" v-model="currentPrices.level1.motorocycle" @change="handlePriceChange('level1', 'motorocycle')"></td>
            <td><input type="number" v-model="currentPrices.level2.motorocycle" @change="handlePriceChange('level2', 'motorocycle')"></td>
            <td><input type="number" v-model="currentPrices.level3.motorocycle" @change="handlePriceChange('level3', 'motorocycle')"></td>
            <td><input type="number" v-model="currentPrices.level4.motorocycle" @change="handlePriceChange('level4', 'motorocycle')"></td>
            <td colspan="3"></td>
          </tr>
          <tr>
            <td>Van</td>
            <td><input type="number" v-model="currentPrices.level1.priceVan" @change="handlePriceChange('level1', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level2.priceVan" @change="handlePriceChange('level2', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level3.priceVan" @change="handlePriceChange('level3', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level4.priceVan" @change="handlePriceChange('level4', 'priceVan')"></td>
            <td colspan="3"></td>
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
export default {
  name: 'FegoDashboard',
  data() {
    return {
      activeMenu: 'Dashboard',
      menuItems: [
        'Dashboard',
        'Orders',
        'Trips',
        'Users',
        'Captains',
        'Moderators',
        'Settings'
      ],
      currentPrices: {
        level1: { priceCar: 0, motorocycle: 0, priceVan: 0, penfits: 0, compfort: 0 },
        level2: { priceCar: 0, motorocycle: 0, priceVan: 0, penfits: 0, compfort: 0 },
        level3: { priceCar: 0, motorocycle: 0, priceVan: 0, penfits: 0, compfort: 0 },
        level4: { priceCar: 0, motorocycle: 0, priceVan: 0, penfits: 0, compfort: 0 }
      },
      changes: {}
    };
  },
  components: {
    Sidebar
  },
  created() {
    this.fetchEgyptPrices();
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

        // Map API response to frontend structure
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
    handlePriceChange(level, field) {
      if (!this.changes[level]) {
        this.changes[level] = {};
      }
      // Store the changed value
      if (level === 'all') {
        // For penfits and compfort, apply to all levels
        this.changes['level1'][field] = this.currentPrices.level1[field];
        this.changes['level2'][field] = this.currentPrices.level1[field];
        this.changes['level3'][field] = this.currentPrices.level1[field];
        this.changes['level4'][field] = this.currentPrices.level1[field];
      } else {
        this.changes[level][field] = this.currentPrices[level][field];
      }
    },
    async saveAllPrices() {
      try {
        const updates = [];

        // For each level with changes, prepare a PATCH request
        for (const level in this.changes) {
          if (level === 'all') continue; // Handled via level-specific updates

          // Ensure all required fields are included
          const updateData = {
            country: 'egypt',
            priceCar: this.currentPrices[level].priceCar || 0,
            motorocycle: this.currentPrices[level].motorocycle || 0,
            priceVan: this.currentPrices[level].priceVan || 0,
            penfits: this.currentPrices[level].penfits || 0,
            compfort: this.currentPrices[level].compfort || 0
          };

          updates.push(
              axios.patch(`https://backend.fego-rides.com/prices/${level}/updateprices`, updateData)
          );
        }

        await Promise.all(updates);
        alert('Prices updated successfully!');
        this.changes = {};
        this.fetchEgyptPrices(); // Refresh data
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

.logo {
  font-size: 24px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #34495e;
}

.main-menu ul {
  list-style: none;
  padding: 0;
}

.main-menu li {
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
}

.main-menu li:hover {
  background-color: #34495e;
}

.main-menu li.active {
  background-color: #3498db;
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
  background-color: #f8f9fa;
  font-weight: 600;
  color: #34495e;
}

.prices-table input {
  width: 80px;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.save-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  background-color: #2ecc71;
  color: white;
}

button:hover {
  opacity: 0.9;
}
</style>