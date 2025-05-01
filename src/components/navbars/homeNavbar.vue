<template>
  <nav class="navbar">
    <div class="logo">Reception Robot</div>
    <ul class="nav-links">
      <li><a href=/create-order>Doctors</a></li>
      <li><a href="/lab">Lab</a></li>
      <li><a href="/deliver-main">Delivery</a></li>
      <li><a href="#shope">Shop</a></li>
    </ul>
    <div class="auth-buttons">
      <template v-if="username">
        <div class="user-profile">
          <span class="welcome">Welcome, {{ username }}</span>
          <button class="logout" @click="handleLogout">Logout</button>
        </div>
      </template>
      <template v-else>
        <a href="/login" class="login">Login</a>
        <a href="/register" class="signup">Sign Up</a>
      </template>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavbarComponent',
  data() {
    return {
      username: ""
    }
  },
  created() {
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      this.username = localStorage.getItem("username") || "";
    },
    handleLogout() {
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      this.username = "";
      // Redirect to home or login page if needed
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 50px;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  backdrop-filter: blur(10px);
  z-index: 1000;
}

.logo {
  color: white;
  font-size: 24px;
  font-weight: bold;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 20px;
}

.nav-links li a {
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: 0.3s;
}

.nav-links li a:hover {
  color: #00c3ff;
}

.auth-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
}

.auth-buttons a, .auth-buttons button {
  text-decoration: none;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  transition: 0.3s;
  font-size: 16px;
  cursor: pointer;
}

.login {
  border: 2px solid white;
  background: transparent;
}

.signup {
  background: #00c3ff;
  border: 2px solid #00c3ff;
}

.logout {
  border: 2px solid #ff4757;
  background: #ff4757;
}

.auth-buttons a:hover, .auth-buttons button:hover {
  opacity: 0.8;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome {
  color: white;
  font-size: 16px;
}
</style>