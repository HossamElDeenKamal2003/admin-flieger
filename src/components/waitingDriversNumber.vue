<template>
  <div class="waiting-notification">
    <h1>Good morning, {{ adminUsername || 'Admin' }} <span class="wave">👋</span></h1>

    <!-- Loading State -->
    <p v-if="loading">Loading waiting captains...</p>
    <!-- Error State -->
    <p v-else-if="error" class="error-text">
      {{ error }} <button @click="getDrivers">Retry</button>
    </p>
    <!-- Success State -->
    <p v-else-if="filteredWaitingCaptains.length > 0">
      You have {{ filteredWaitingCaptains.length }} captain{{ filteredWaitingCaptains.length === 1 ? '' : 's' }}
      on the <router-link to="/waiting-drivers" class="waiting-link">waiting list</router-link>
    </p>
    <!-- Empty State -->
    <p v-else>No captains on the waiting list.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'WaitingDriversNumber',
  data() {
    return {
      waitingCaptains: [],
      baseUrl: 'https://backend.fego-rides.com/admin',
      loading: false,
      error: null,
      adminUsername: localStorage.getItem('username') || null
    };
  },
  computed: {
    filteredWaitingCaptains() {
      return this.waitingCaptains.filter(captain => captain.block === false && (captain.ctr || 0) === 0);
    }
  },
  methods: {
    async getDrivers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${this.baseUrl}/get-drivers`, {
          timeout: 10000 // Add timeout to prevent hanging
        });
        this.waitingCaptains = response.data
            .filter(driver => !driver.block && (driver.ctr || 0) === 0)
            .map(driver => ({ ...driver }));
      } catch (err) {
        console.error('Error fetching drivers:', err);
        this.error = 'Failed to load waiting captains. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  },
  created() {
    this.getDrivers();
  }
};
</script>

<style scoped>
.waiting-notification {
  margin: 4px 0 0 0;
}

.waiting-notification p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.waiting-link {
  color: #2563eb;
  text-decoration: none;
  cursor: pointer;
}

.waiting-link:hover {
  text-decoration: underline;
}

.error-text {
  color: #ff4d4f;
}

.error-text button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.wave {
  display: inline-block;
  font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;
  animation: wave 1s infinite ease-in-out;
  transform-origin: center;
}

@keyframes wave {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(20deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-20deg); }
  100% { transform: rotate(0deg); }
}
</style>