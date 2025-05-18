```vue
<template>
  <div class="fego-dashboard">
    <div class="sidebar">
      <Sidebar />
    </div>

    <div class="main-content">
      <WaitingDriversNumber :waiting-captains="waitingCaptains" />

      <div class="levels-prices">
        <h2>Pricing Management</h2>
        <div class="country-selector">
          <label>Select Country</label>
          <select v-model="selectedCountry" @change="fetchCountryPrices">
            <option v-for="country in countries" :key="country.code" :value="country.code">{{ country.name }}</option>
          </select>
        </div>
        <h3>{{ selectedCountry.toUpperCase() }} Prices - All Levels</h3>

        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>

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
          <tr>
            <td>Car</td>
            <td><input type="number" v-model="currentPrices.level1.priceCar" @change="handlePriceChange('level1', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level2.priceCar" @change="handlePriceChange('level2', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level3.priceCar" @change="handlePriceChange('level3', 'priceCar')"></td>
            <td><input type="number" v-model="currentPrices.level4.priceCar" @change="handlePriceChange('level4', 'priceCar')"></td>
            <td><input type="number" v-model="fixedAmounts.fixedAmountCar" @change="handleFixedAmountChange('fixedAmountCar')"></td>
          </tr>
          <tr>
            <td>Motorcycle</td>
            <td><input type="number" v-model="currentPrices.level1.motorcycle" @change="handlePriceChange('level1', 'motorcycle')"></td>
            <td><input type="number" v-model="currentPrices.level2.motorcycle" @change="handlePriceChange('level2', 'motorcycle')"></td>
            <td><input type="number" v-model="currentPrices.level3.motorcycle" @change="handlePriceChange('level3', 'motorcycle')"></td>
            <td><input type="number" v-model="currentPrices.level4.motorcycle" @change="handlePriceChange('level4', 'motorcycle')"></td>
            <td><input type="number" v-model="fixedAmounts.fixedAmountMotorcycle" @change="handleFixedAmountChange('fixedAmountMotorcycle')"></td>
          </tr>
          <tr>
            <td>Van</td>
            <td><input type="number" v-model="currentPrices.level1.priceVan" @change="handlePriceChange('level1', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level2.priceVan" @change="handlePriceChange('level2', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level3.priceVan" @change="handlePriceChange('level3', 'priceVan')"></td>
            <td><input type="number" v-model="currentPrices.level4.priceVan" @change="handlePriceChange('level4', 'priceVan')"></td>
            <td><input type="number" v-model="fixedAmounts.fixedAmountVan" @change="handleFixedAmountChange('fixedAmountVan')"></td>
          </tr>
          <tr>
            <td>Comfort</td>
            <td><input type="number" v-model="currentPrices.level1.comfort" @change="handlePriceChange('level1', 'comfort')"></td>
            <td><input type="number" v-model="currentPrices.level2.comfort" @change="handlePriceChange('level2', 'comfort')"></td>
            <td><input type="number" v-model="currentPrices.level3.comfort" @change="handlePriceChange('level3', 'comfort')"></td>
            <td><input type="number" v-model="currentPrices.level4.comfort" @change="handlePriceChange('level4', 'comfort')"></td>
            <td><input type="number" v-model="fixedAmounts.fixedAmountComfort" @change="handleFixedAmountChange('fixedAmountComfort')"></td>
          </tr>
          <tr>
            <td>Commission Car</td>
            <td><input type="number" v-model="currentPrices.level1.carComission" @change="handlePriceChange('level1', 'carComission')"></td>
            <td><input type="number" v-model="currentPrices.level2.carComission" @change="handlePriceChange('level2', 'carComission')"></td>
            <td><input type="number" v-model="currentPrices.level3.carComission" @change="handlePriceChange('level3', 'carComission')"></td>
            <td><input type="number" v-model="currentPrices.level4.carComission" @change="handlePriceChange('level4', 'carComission')"></td>
            <td></td>
          </tr>
          <tr>
            <td>Commission Motorcycle</td>
            <td><input type="number" v-model="currentPrices.level1.motorcycleComission" @change="handlePriceChange('level1', 'motorcycleComission')"></td>
            <td><input type="number" v-model="currentPrices.level2.motorcycleComission" @change="handlePriceChange('level2', 'motorcycleComission')"></td>
            <td><input type="number" v-model="currentPrices.level3.motorcycleComission" @change="handlePriceChange('level3', 'motorcycleComission')"></td>
            <td><input type="number" v-model="currentPrices.level4.motorcycleComission" @change="handlePriceChange('level4', 'motorcycleComission')"></td>
            <td></td>
          </tr>
          <tr>
            <td>Commission Van</td>
            <td><input type="number" v-model="currentPrices.level1.vanComission" @change="handlePriceChange('level1', 'vanComission')"></td>
            <td><input type="number" v-model="currentPrices.level2.vanComission" @change="handlePriceChange('level2', 'vanComission')"></td>
            <td><input type="number" v-model="currentPrices.level3.vanComission" @change="handlePriceChange('level3', 'vanComission')"></td>
            <td><input type="number" v-model="currentPrices.level4.vanComission" @change="handlePriceChange('level4', 'vanComission')"></td>
            <td></td>
          </tr>
          <tr>
            <td>Commission Comfort</td>
            <td><input type="number" v-model="currentPrices.level1.comfortComission" @change="handlePriceChange('level1', 'comfortComission')"></td>
            <td><input type="number" v-model="currentPrices.level2.comfortComission" @change="handlePriceChange('level2', 'comfortComission')"></td>
            <td><input type="number" v-model="currentPrices.level3.comfortComission" @change="handlePriceChange('level3', 'comfortComission')"></td>
            <td><input type="number" v-model="currentPrices.level4.comfortComission" @change="handlePriceChange('level4', 'comfortComission')"></td>
            <td></td>
          </tr>
          </tbody>
        </table>
      </div>
      <button class="save-btn" @click="saveAllPrices">Save All</button>

      <!-- Add Country Pricing Form -->
      <div class="add-country">
        <h3>Add Pricing for Country</h3>
        <form @submit.prevent="addCountryPricing">
          <div class="form-group">
            <label>Country</label>
            <input v-model="newCountry.country" type="text" placeholder="Enter country code" required />
          </div>
          <div class="form-group">
            <label>Level</label>
            <select v-model="newCountry.level" required>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>
          </div>
          <div class="form-group">
            <label>Car Price</label>
            <input v-model.number="newCountry.priceCar" type="number" min="0" required />
          </div>
          <div class="form-group">
            <label>Van Price</label>
            <input v-model.number="newCountry.priceVan" type="number" min="0" required />
          </div>
          <div class="form-group">
            <label>Motorcycle Price</label>
            <input v-model.number="newCountry.motorcycle" type="number" min="0" required />
          </div>
          <div class="form-group">
            <label>Comfort Price</label>
            <input v-model.number="newCountry.comfort" type="number" min="0" required />
          </div>
          <div class="form-group">
            <label>Car Commission</label>
            <input v-model.number="newCountry.carComission" type="number" min="0" required />
          </div>
          <div class="form-group">
            <label>Van Commission</label>
            <input v-model.number="newCountry.vanComission" type="number" min="0" required />
          </div>
          <div class="form-group">
            <label>Motorcycle Commission</label>
            <input v-model.number="newCountry.motorcycleComission" type="number" min="0" required />
          </div>
          <div class="form-group">
            <label>Comfort Commission</label>
            <input v-model.number="newCountry.comfortComission" type="number" min="0" required />
          </div>
          <button type="submit" class="save-btn">Add Pricing</button>
        </form>
      </div>
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
      waitingCaptains: 0,
      selectedCountry: 'egypt',
      countries: [
        { code: 'egypt', name: 'Egypt' },
        { code: 'us', name: 'United States' },
        { code: 'uk', name: 'United Kingdom' },
        { code: 'sa', name: 'Saudi Arabia' }
      ],
      currentPrices: {
        level1: { priceCar: 0, motorcycle: 0, priceVan: 0, comfort: 0, carComission: 0, vanComission: 0, motorcycleComission: 0, comfortComission: 0 },
        level2: { priceCar: 0, motorcycle: 0, priceVan: 0, comfort: 0, carComission: 0, vanComission: 0, motorcycleComission: 0, comfortComission: 0 },
        level3: { priceCar: 0, motorcycle: 0, priceVan: 0, comfort: 0, carComission: 0, vanComission: 0, motorcycleComission: 0, comfortComission: 0 },
        level4: { priceCar: 0, motorcycle: 0, priceVan: 0, comfort: 0, carComission: 0, vanComission: 0, motorcycleComission: 0, comfortComission: 0 }
      },
      fixedAmounts: {
        fixedAmountCar: 0,
        fixedAmountVan: 0,
        fixedAmountMotorcycle: 0,
        fixedAmountComfort: 0
      },
      changes: {},
      fixedAmountChanges: {},
      newCountry: {
        country: '',
        level: '1',
        priceCar: 0,
        priceVan: 0,
        motorcycle: 0,
        comfort: 0,
        carComission: 0,
        vanComission: 0,
        motorcycleComission: 0,
        comfortComission: 0
      },
      loading: false,
      error: null
    };
  },
  created() {
    this.fetchCountryPrices();
    this.fetchFixedPrices();
  },
  methods: {
    async fetchCountryPrices() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`https://backend.fego-rides.com/levels/${this.selectedCountry}`);
        const data = response.data;

        this.currentPrices = {
          level1: {
            priceCar: data.levelOne?.[0]?.priceCar || 0,
            motorcycle: data.levelOne?.[0]?.motorcycle || 0,
            priceVan: data.levelOne?.[0]?.priceVan || 0,
            comfort: data.levelOne?.[0]?.comfort || 0,
            carComission: data.levelOne?.[0]?.carComission || 0,
            vanComission: data.levelOne?.[0]?.vanComission || 0,
            motorcycleComission: data.levelOne?.[0]?.motorcycleComission || 0,
            comfortComission: data.levelOne?.[0]?.comfortComission || 0
          },
          level2: {
            priceCar: data.levelTwo?.[0]?.priceCar || 0,
            motorcycle: data.levelTwo?.[0]?.motorcycle || 0,
            priceVan: data.levelTwo?.[0]?.priceVan || 0,
            comfort: data.levelTwo?.[0]?.comfort || 0,
            carComission: data.levelTwo?.[0]?.carComission || 0,
            vanComission: data.levelTwo?.[0]?.vanComission || 0,
            motorcycleComission: data.levelTwo?.[0]?.motorcycleComission || 0,
            comfortComission: data.levelTwo?.[0]?.comfortComission || 0
          },
          level3: {
            priceCar: data.levelThree?.[0]?.priceCar || 0,
            motorcycle: data.levelThree?.[0]?.motorcycle || 0,
            priceVan: data.levelThree?.[0]?.priceVan || 0,
            comfort: data.levelThree?.[0]?.comfort || 0,
            carComission: data.levelThree?.[0]?.carComission || 0,
            vanComission: data.levelThree?.[0]?.vanComission || 0,
            motorcycleComission: data.levelThree?.[0]?.motorcycleComission || 0,
            comfortComission: data.levelThree?.[0]?.comfortComission || 0
          },
          level4: {
            priceCar: data.levelFour?.[0]?.priceCar || 0,
            motorcycle: data.levelFour?.[0]?.motorcycle || 0,
            priceVan: data.levelFour?.[0]?.priceVan || 0,
            comfort: data.levelFour?.[0]?.comfort || 0,
            carComission: data.levelFour?.[0]?.carComission || 0,
            vanComission: data.levelFour?.[0]?.vanComission || 0,
            motorcycleComission: data.levelFour?.[0]?.motorcycleComission || 0,
            comfortComission: data.levelFour?.[0]?.comfortComission || 0
          }
        };
      } catch (error) {
        console.error(`Error fetching ${this.selectedCountry} prices:`, error);
        this.error = `Error fetching ${this.selectedCountry} prices: ${error.response?.data?.message || error.message}`;
      } finally {
        this.loading = false;
      }
    },
    async fetchFixedPrices() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('https://backend.fego-rides.com/prices/getFixedPrices');
        this.fixedAmounts = {
          fixedAmountCar: response.data.fixedAmountCar || 0,
          fixedAmountVan: response.data.fixedAmountVan || 0,
          fixedAmountMotorcycle: response.data.fixedAmountMotorcycle || 0,
          fixedAmountComfort: response.data.fixedAmountComfort || 0
        };
      } catch (error) {
        console.error('Error fetching fixed prices:', error);
        this.error = 'Error fetching fixed prices: ' + (error.response?.data?.message || error.message);
      } finally {
        this.loading = false;
      }
    },
    handlePriceChange(level, field) {
      if (!this.changes[level]) {
        this.changes[level] = {};
      }
      this.changes[level][field] = this.currentPrices[level][field];
    },
    handleFixedAmountChange(field) {
      this.fixedAmountChanges[field] = this.fixedAmounts[field];
    },
    async saveAllPrices() {
      this.loading = true;
      this.error = null;
      try {
        const updates = [];

        for (const level in this.changes) {
          const levelNumber = parseInt(level.replace('level', ''));
          const updateData = {
            level: levelNumber,
            country: this.selectedCountry,
            priceCar: this.currentPrices[level].priceCar || 0,
            priceVan: this.currentPrices[level].priceVan || 0,
            motorcycle: this.currentPrices[level].motorcycle || 0,
            comfort: this.currentPrices[level].comfort || 0,
            carComission: this.currentPrices[level].carComission || 0,
            vanComission: this.currentPrices[level].vanComission || 0,
            motorcycleComission: this.currentPrices[level].motorcycleComission || 0,
            comfortComission: this.currentPrices[level].comfortComission || 0
          };

          updates.push(
              axios.patch('https://backend.fego-rides.com/levels', updateData)
          );
        }

        if (Object.keys(this.fixedAmountChanges).length > 0) {
          const fixedAmountUpdate = {
            fixedAmountCar: this.fixedAmounts.fixedAmountCar || 0,
            fixedAmountVan: this.fixedAmounts.fixedAmountVan || 0,
            fixedAmountMotorcycle: this.fixedAmounts.fixedAmountMotorcycle || 0,
            fixedAmountComfort: this.fixedAmounts.fixedAmountComfort || 0
          };

          updates.push(
              axios.patch('https://backend.fego-rides.com/prices/updateFixedAmount', fixedAmountUpdate)
          );
        }

        if (updates.length > 0) {
          await Promise.all(updates);
          alert('Prices updated successfully!');
          this.changes = {};
          this.fixedAmountChanges = {};
          await this.fetchCountryPrices();
          await this.fetchFixedPrices();
        } else {
          alert('No changes detected to save.');
        }
      } catch (error) {
        console.error('Error updating prices:', error);
        this.error = 'Error updating prices: ' + (error.response?.data?.message || error.message);
      } finally {
        this.loading = false;
      }
    },
    async addCountryPricing() {
      this.loading = true;
      this.error = null;
      try {
        const payload = {
          level: parseInt(this.newCountry.level),
          country: this.newCountry.country.toLowerCase(),
          priceCar: this.newCountry.priceCar || 0,
          priceVan: this.newCountry.priceVan || 0,
          motorcycle: this.newCountry.motorcycle || 0,
          comfort: this.newCountry.comfort || 0,
          carComission: this.newCountry.carComission || 0,
          vanComission: this.newCountry.vanComission || 0,
          motorcycleComission: this.newCountry.motorcycleComission || 0,
          comfortComission: this.newCountry.comfortComission || 0
        };

        await axios.post('https://backend.fego-rides.com/levels', payload);
        alert(`Pricing for ${this.newCountry.country} (Level ${this.newCountry.level}) added successfully!`);
        this.newCountry = {
          country: '',
          level: '1',
          priceCar: 0,
          priceVan: 0,
          motorcycle: 0,
          comfort: 0,
          carComission: 0,
          vanComission: 0,
          motorcycleComission: 0,
          comfortComission: 0
        };
        if (this.newCountry.country === this.selectedCountry) {
          await this.fetchCountryPrices();
        }
      } catch (error) {
        console.error('Error adding country pricing:', error);
        this.error = 'Error adding country pricing: ' + (error.response?.data?.message || error.message);
      } finally {
        this.loading = false;
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
  margin-bottom: 20px;
}

.add-country {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.country-selector {
  margin-bottom: 20px;
}

.country-selector label {
  display: inline-block;
  margin-right: 10px;
  color: #2c3e50;
  font-weight: 600;
}

.country-selector select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
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

.prices-table th,
.prices-table td {
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #2c3e50;
  font-weight: 600;
}

.form-group input,
.form-group select {
  width: 100%;
  max-width: 200px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.row-grey {
  background-color: #f8f9fa;
}

.row-purple {
  background-color: rgba(107, 91, 149, 0.1);
}

.row-grey:hover,
.row-purple:hover {
  background-color: #e9ecef;
}

.table-header {
  background-color: #6b5b95 !important;
  color: white;
}

.loading-overlay {
  position: relative;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  min-height: 100px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6b5b95;
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
  color: #dc3545;
  text-align: center;
  margin-bottom: 20px;
}
</style>
```