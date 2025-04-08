<!-- Sidebar.vue -->
<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="logo">
      <img src="../assets/fego%202.png" alt="Fego Logo" />
      <span v-if="!isCollapsed">Fego</span>
    </div>
    <div class="menu">
      <p class="menu-label" v-if="!isCollapsed">MAIN MENU</p>
      <ul>
        <li
            v-for="item in menuItems"
            :key="item.name"
            :class="{ active: activeMenu === item.name }"
            @click="setActiveMenu(item.name)"
        >
          <i :class="`icon ${item.icon}`"></i>
          <span v-if="!isCollapsed">{{ item.name }}</span>
        </li>
      </ul>
    </div>
    <button class="toggle-btn" @click="toggleSidebar">
      <i :class="isCollapsed ? 'icon expand' : 'icon collapse'"></i>
    </button>
  </aside>
</template>

<script>
export default {
  data() {
    return {
      menuItems: [
        { name: 'Overview', icon: 'overview' },
        { name: 'Trips', icon: 'trips' },
        { name: 'Users', icon: 'users' },
        { name: 'Captains', icon: 'captains' },
        { name: 'Moderators', icon: 'moderators' },
        { name: 'Settings', icon: 'settings' },
      ],
      activeMenu: 'Captains',
      isCollapsed: false
    }
  },
  mounted() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.isCollapsed = window.innerWidth <= 768;
      this.$emit('toggle', this.isCollapsed);
    },
    setActiveMenu(menuName) {
      this.activeMenu = menuName;
      console.log(`Navigating to ${menuName}`);
    },
    toggleSidebar() {
      if (window.innerWidth <= 768) {
        this.isCollapsed = !this.isCollapsed;
        this.$emit('toggle', this.isCollapsed);
      }
    }
  }
}
</script>

<style scoped>
/* Your existing styles remain exactly the same */
.sidebar {
  width: 250px;
  background-color: #6b48ff;
  color: white;
  padding: 20px;
  border-radius: 0 20px 20px 0;
  position: fixed;
  top: 0;
  bottom: 0;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 80px;
}

.logo {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.logo img {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 50%;
}

.logo span {
  font-size: 1.5rem;
  font-weight: bold;
}

.menu-label {
  font-size: 0.8rem;
  color: #d1c4ff;
  margin-bottom: 10px;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu li {
  display: flex;
  align-items: center;
  padding: 10px 0;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu li.active {
  background-color: #5439d6;
  border-radius: 8px;
  padding-left: 10px;
}

.menu li:hover {
  background-color: #5439d6;
  border-radius: 8px;
}

.menu li i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

.toggle-btn {
  position: absolute;
  top: 20px;
  right: -15px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  display: none;
}

.toggle-btn i {
  font-size: 1rem;
}

.icon {
  display: inline-block;
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 250px;
  }

  .sidebar-collapsed {
    width: 80px;
  }

  .toggle-btn {
    display: flex;
  }

  .sidebar-collapsed .logo span,
  .sidebar-collapsed .menu-label,
  .sidebar-collapsed .menu li span {
    display: none;
  }
}

@media (min-width: 769px) {
  .sidebar {
    width: 250px !important;
  }
}
</style>