<template>
    <div id="app">
        <!-- Main Content Area -->
        <div class="wrapper">
            <header>
                <button @click="toggleNav" class="btn" style="color: white;">Toggle Sidebar</button>
            </header>
            <main>
                <div class="parent">
                    <!-- First H1: Flieger on Site -->
                    <div>
                        <h1 class="flieger">
                            Flieger
                            <span ref="txtRotate1" class="txt-rotate" :data-period="period"
                                :data-rotate="toRotate1"></span>
                        </h1>
                    </div>
                    <!-- Second H1: Flieger on Time -->
                    <div>
                        <h1 class="flieger">
                            Flieger
                            <span ref="txtRotate2" class="txt-rotate" :data-period="period"
                                :data-rotate="toRotate2"></span>
                        </h1>
                    </div>
                    <!-- Third H1: Flieger on Budget -->
                    <div>
                        <h1 class="flieger">
                            Flieger
                            <span ref="txtRotate3" class="txt-rotate" :data-period="period"
                                :data-rotate="toRotate3"></span>
                        </h1>
                    </div>
                </div>
            </main>
        </div>

        <!-- Sidebar -->
        <aside :class="{ active: isSidebarActive }">
            <button class="close-btn" @click="toggleNav">&times;</button>
            <h1 style="color:white">Flieger</h1>
            <h4 style="color: white; padding-bottom:15px">Username: {{ username }}</h4>
            <h4 style="color: white">Role: {{ role }}</h4>
            <nav>
                <a href="/admin/users">Users</a>
                <a href="/admin/drivers">Drivers</a>
                <a href="/admin/getdriver">Get Driver</a>
                <a href="/admin/tracking">Tracking Drivers</a>
                <a href="/admin/get-trips">All Trips</a>
                <a href="/admin/settings">Settings</a>
                <a href="/permission">Permissions</a>
            </nav>
            <button class="btn btn-primary" @click="logout">Logout</button>
        </aside>
        <div v-if="isSidebarActive" class="overlay" @click="toggleNav"></div>
    </div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            period: 2000,
            toRotate1: ['on Site'],  // For the first H1
            toRotate2: ['on Time'],  // For the second H1
            toRotate3: ['on Budget'],  // For the third H1
            isSidebarActive: false,
            username: "",
            role: "",
        };
    },
    mounted() {
        this.initializeTxtRotate();
        this.getUsername();
    },
    methods: {
        logout() {
            localStorage.clear();
            this.$router.push('/');
        },
        getUsername() {
            this.username = localStorage.getItem('username');
            this.role = localStorage.getItem('role');
        },
        initializeTxtRotate() {
            // Define TxtRotate class
            class TxtRotate {
                constructor(el, toRotate, period) {
                    this.toRotate = toRotate;
                    this.el = el;
                    this.loopNum = 0;
                    this.period = parseInt(period, 10) || 2000;
                    this.txt = '';
                    this.tick();
                    this.isDeleting = false;
                }

                tick() {
                    const i = this.loopNum % this.toRotate.length;
                    const fullTxt = this.toRotate[i];

                    if (!this.isDeleting) {
                        this.txt = fullTxt.substring(0, this.txt.length + 1);
                    }

                    this.el.innerHTML = `<span class="wrap">${this.txt}</span>`;

                    const delta = 300 - Math.random() * 100;

                    if (this.txt === fullTxt) {
                        // Stop once the full text is displayed (no rotating or deleting)
                        return;
                    }

                    setTimeout(() => this.tick(), delta);
                }
            }

            // Initialize TxtRotate for each h1
            const el1 = this.$refs.txtRotate1;
            const el2 = this.$refs.txtRotate2;
            const el3 = this.$refs.txtRotate3;

            new TxtRotate(el1, this.toRotate1, this.period);
            new TxtRotate(el2, this.toRotate2, this.period);
            new TxtRotate(el3, this.toRotate3, this.period);
        },
        toggleNav() {
            this.isSidebarActive = !this.isSidebarActive;
        }
    }
};
</script>

<style scoped>
html,
body {
    font-family: 'Raleway', sans-serif;
    padding: 3em 2em;
    font-size: 18px;
    background: #222;
    color: #aaa;
}

h1,
h2 {
    font-weight: 200;
    margin: 0.4em 0;
}

h1 {
    font-size: 3.5em;
}

h2 {
    color: #888;
    font-size: 2em;
}

.flieger {
    color: rgb(114, 89, 170);
    font-size: 8em;
    font-weight: bold;
    text-shadow:
        1px 1px 2px rgba(0, 0, 0, 0.3),
        2px 2px 4px rgba(0, 0, 0, 0.2),
        3px 3px 6px rgba(0, 0, 0, 0.2),
        4px 4px 8px rgba(0, 0, 0, 0.2),
        5px 5px 10px rgba(114, 89, 170, 0.4);
}

.parent {
    height: 100vh;
    display: flex;
    flex-direction: column;
    /* Stack h1 elements vertically */
    justify-content: center;
    align-items: center;
    background-color: whitesmoke;
}

.txt-rotate>.wrap {
    border-right: 0.08em solid #666;
}

#app {
    display: flex;
    position: relative;
}

aside {
    position: fixed;
    top: 0;
    left: -200px;
    /* Hidden off-screen initially */
    width: 200px;
    background: rgb(114, 89, 170);
    height: 100vh;
    transition: left 0.3s ease;
    z-index: 1000;
    /* Ensure it overlays other content */
}

aside.active {
    left: 0;
    /* Slide in from the left */
}

aside a {
    display: block;
    padding: 10px 5px;
    color: white;
    border-bottom: 1px solid #bbb;
}

.close-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background: transparent;
    border: none;
    color: white;
    font-size: 2em;
    cursor: pointer;
}

.wrapper {
    display: flex;
    flex-direction: column;
    width: 100vw;
    transition: margin-left 0.3s ease;
}

header {
    width: 100%;
    padding: 10px;
    background: rgb(114, 89, 170);
}

main {
    flex-grow: 2;
    padding: 10px;
}

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    /* Ensure it overlays content */
    display: none;
}

.overlay.active {
    display: block;
}
</style>