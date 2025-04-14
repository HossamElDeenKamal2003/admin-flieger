<template>
  <div class="fego-dashboard">
    <div class="sidebar">
      <h1 class="logo">Fego</h1>
      <nav class="main-menu">
        <ul>
          <li v-for="item in menuItems" :key="item" :class="{ active: activeMenu === item }">
            {{ item }}
          </li>
        </ul>
      </nav>
    </div>

    <div class="main-content">
      <div class="levels-prices">
        <h2>Levels Prices</h2>
        <h3>EGYPT</h3>

        <table class="prices-table">
          <thead>
          <tr>
            <th>Vehicle</th>
            <th>Level 1</th>
            <th>Level 2</th>
            <th>Level 3</th>
            <th>Level 4</th>
            <th>Fixed Amount</th>
            <th>Commission %</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(row, index) in vehicleData" :key="index">
            <td>{{ row.vehicle }}</td>
            <td>{{ row.level1 }}</td>
            <td>{{ row.level2 }}</td>
            <td>{{ row.level3 }}</td>
            <td>{{ row.level4 }}</td>
            <td>{{ row.fixedAmount || '-' }}</td>
            <td>{{ row.commission || '-' }}</td>
          </tr>
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="actions">
          <button class="add-country-btn">Add Country</button>
          <button class="add-vehicle-btn">+ Add Vehicle</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
      vehicleData: [
        { vehicle: 3000, level1: 300, level2: 1200, level3: 3, level4: 3 },
        { vehicle: 3000, level1: 300, level2: 3400, level3: 5, level4: 5 },
        { vehicle: 3000, level1: 300, level2: 5600, level3: 2, level4: 2 },
        { vehicle: 3000, level1: 300, level2: 5600, level3: 3, level4: 3 }
      ]
    }
  }
}
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

.divider {
  height: 1px;
  background-color: #ecf0f1;
  margin: 20px 0;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.add-country-btn, .add-vehicle-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.add-country-btn {
  background-color: #3498db;
  color: white;
}

.add-vehicle-btn {
  background-color: #2ecc71;
  color: white;
}

button:hover {
  opacity: 0.9;
}
</style>