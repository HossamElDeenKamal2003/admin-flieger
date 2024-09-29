<!-- Sidebar.vue -->
<template>
    <div :class="['sidebar', { 'sidebar-open': isOpen }]">
        <button @click="toggleSidebar" class="toggle-btn">☰</button>
        <div class="sidebar-content">
            <p>Sidebar Content</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SideBar',
    data() {
        return {
            isOpen: false,
        };
    },
    methods: {
        toggleSidebar() {
            this.isOpen = !this.isOpen;
        },
    },
};
</script>

<style scoped>
.sidebar {
    position: fixed;
    top: 0;
    left: -250px;
    /* Sidebar is hidden initially */
    width: 250px;
    height: 100%;
    background: #333;
    color: #fff;
    transition: left 0.3s;
    overflow: auto;
}

.sidebar-open {
    left: 0;
}

.toggle-btn {
    position: absolute;
    top: 10px;
    right: -50px;
    background: #444;
    border: none;
    color: #fff;
    padding: 10px;
    cursor: pointer;
}

.sidebar-content {
    padding: 20px;
}
</style>