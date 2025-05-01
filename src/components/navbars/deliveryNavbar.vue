<template>
  <div class="navbar">
    <ul>
      <li><a href="#finished-orders">Finished Orders</a></li>
      <li><a href="#new-orders">New Orders</a></li>
      <li><a href="#accounts">Accounts</a></li>
    </ul>
    <div class="logout">
      <a href="#logout">Logout</a>
    </div>
  </div>
</template>

<script setup>
// No logic needed here yet
</script>

<style scoped>
.navbar {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  padding: 10px 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.navbar ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.navbar ul li {
  margin: 0 15px;
}

.navbar ul li a {
  color: white;
  text-decoration: none;
  font-size: 18px;
}
</style>
