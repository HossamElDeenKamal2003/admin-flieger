<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-logo">
          <router-link to="/">
            <img src="@/assets/logo.jpeg" alt="Logo" />
          </router-link>
        </div>

        <!-- Nav Links for larger screens -->
        <div class="nav-links desktop-only">
          <router-link to="/create-order">Create Order</router-link>

          <router-link to="/doctor/orders">Orders</router-link>
<!--          <router-link to="/accounts">Accounts</router-link>-->
          <div v-if="username" class="user-info">
            <span>Welcome, {{ username }}</span>
            <div v-if="uid" class="uid-display">
              <span class="uid-label">ID:</span>
              <span class="uid-value">{{ uid }}</span>
            </div>
            <a href="#" class="logout" @click.prevent="logout">Logout</a>
          </div>
          <router-link v-else to="/login">Login</router-link>
        </div>

        <!-- Hamburger button for mobile -->
        <div class="hamburger mobile-only" @click="toggleDrawer">
          <span :class="{ 'open': drawerOpen }"></span>
          <span :class="{ 'open': drawerOpen }"></span>
          <span :class="{ 'open': drawerOpen }"></span>
        </div>
      </div>
    </nav>

    <!-- Drawer for mobile navigation -->
    <transition name="slide">
      <div class="drawer" v-if="drawerOpen">
        <div class="drawer-header">
          <button class="close-btn" @click="toggleDrawer">&times;</button>
        </div>
        <div class="drawer-links">
          <router-link to="/allorders" @click="toggleDrawer">Orders</router-link>
          <router-link to="/accounts" @click="toggleDrawer">Accounts</router-link>
          <div v-if="username" class="user-info">
            <span>Welcome, {{ username }}</span>
            <div v-if="uid" class="uid-display">
              <span class="uid-label">ID:</span>
              <span class="uid-value">{{ uid }}</span>
            </div>
            <a href="#" class="logout" @click.prevent="logout">Logout</a>
          </div>
          <router-link v-else to="/login" @click="toggleDrawer">Login</router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "DoctorNavbar",
  data() {
    return {
      drawerOpen: false,
      localUid: localStorage.getItem('uid'),
    };
  },
  computed: {
    username() {
      return localStorage.getItem("username") || '';
    },
    uid() {
      return this.localUid || localStorage.getItem("uid") || '';
    },
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("uid");
      this.drawerOpen = false;
      this.$router.push({ name: "login" });
    },
    toggleDrawer() {
      this.drawerOpen = !this.drawerOpen;
    },
  },
};
</script>

<style scoped>
/* Navbar Styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  z-index: 1000;
  padding: 8px 20px;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.navbar-logo img {
  width: 50px;
  height: auto;
  border-radius: 50%;
}

/* Desktop links */
.nav-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: #007bff;
}

/* Enhanced UID Display */
.uid-display {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
}

.uid-label {
  font-weight: bold;
  color: #333;
}

.uid-value {
  font-weight: 800; /* Extra bold */
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  background-color: #4CAF50; /* Green background */
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 2px solid #388E3C; /* Darker green border */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logout {
  color: red;
  cursor: pointer;
  font-weight: bold;
  margin-left: 10px;
}

.logout:hover {
  text-decoration: underline;
}

/* Hamburger Menu and Drawer styles remain the same */
.hamburger {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 25px;
  height: 20px;
}

.hamburger span {
  display: block;
  height: 3px;
  background-color: #333;
  transition: all 0.3s ease;
}

.hamburger span.open:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger span.open:nth-child(2) {
  opacity: 0;
}

.hamburger span.open:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 300px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 6px rgba(0,0,0,0.2);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.drawer-header {
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

.drawer-links {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.drawer-links a {
  text-decoration: none;
  color: #333;
  font-size: 1.2rem;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter, .slide-leave-to {
  transform: translateX(100%);
}

/* Responsive Utility Classes */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  .mobile-only {
    display: flex;
  }

  /* Mobile-specific UID styling */
  .uid-display {
    flex-direction: column;
    align-items: flex-start;
    margin: 5px 0;
  }
}
</style>