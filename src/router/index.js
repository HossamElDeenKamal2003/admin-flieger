import { createRouter, createWebHistory } from "vue-router";
import AuthComponent from "../components/HelloWorld.vue";
import TxtRotate from "../components/HomeComponent.vue";
import usersPanel from "../components/usersPanel.vue";
import driversPanel from "../components/driversComponent.vue";
import getDriver from "../components/getDriver.vue";
import trackingDriver from "../components/trackingDrivers.vue";
import tripsComponent from "../components/tripsComponent.vue";
import settingsPage from "../components/settingsComponent.vue";
import permissionForm from "../components/permisitionsComponent.vue";
const routes = [
{
    path: "/",
    name: "auth",
    component: AuthComponent,
},
{
    path: "/home",
    name: "home",
    component: TxtRotate,
    beforeEnter: (to, from, next) => {
        const role = localStorage.getItem('role');
        if (role === 'admin' || role === "support1" || role === "support2" || role === "support3") {
          next(); // Allow access
        } else {
            //alert("You Are Not An Admin")
            next('/'); 
        }
    }
},
{
    path: "/admin/users",
    name: "usersPanel",
    component: usersPanel,
    beforeEnter: (to, from, next) => {
        const role = localStorage.getItem('role');
        if (role === 'admin' || role === "support1") {
          next(); // Allow access
        } else {
            //alert("You Are Not An Admin")
            next('/'); 
        }
    }
},
{
    path: "/admin/drivers",
    name: driversPanel,
    component: driversPanel,
    beforeEnter: (to, from, next) => {
        const role = localStorage.getItem('role');
        if (role === 'admin' || role === "support1") {
          next(); // Allow access
        } else {
            //alert("You Are Not An Admin")
            next('/'); 
        }
    }
},
{
    path: "/admin/getdriver",
    name: "getDriver",
    component: getDriver,
    beforeEnter: (to, from, next) => {
        const role = localStorage.getItem('role');
        if (role === 'admin' || role === "support1") {
          next(); // Allow access
        } else {
            //alert("You Are Not An Admin")
            next('/'); 
        }
    }
},
{
    path: "/admin/tracking",
    name: "trackingDriver",
    component: trackingDriver,
    beforeEnter: (to, from, next) => {
        const role = localStorage.getItem('role');
        if (role === 'admin' || role === "support1") {
          next(); // Allow access
        } else {
            //alert("You Are Not An Admin")
            next('/'); 
        }
    }
},
{
    path: "/admin/get-trips",
    name: "tripsComponent",
    component: tripsComponent,
    beforeEnter: (to, from, next) => {
        const role = localStorage.getItem('role');
        if (role === 'admin' || role === "support1" || role === "support2") {
          next(); // Allow access
        } else {
            //alert("You Are Not An Admin")
            next('/'); 
        }
    }
},
{
    path: "/admin/settings",
    name: "settingsPage",
    component: settingsPage,
    beforeEnter: (to, from, next) => {
        const role = localStorage.getItem('role');
        if (role === 'admin' || role === "support1") {
          next(); // Allow access
        } else {
            //alert("You Are Not An Admin")
            next('/'); 
        }
    }
},
{
    path: "/permission",
    name: "permissionPage",
    component: permissionForm,
    beforeEnter: (to, from, next) => {
        const role = localStorage.getItem('role');
        if (role === 'admin') {
          next(); // Allow access
        } else {
            //alert("You Are Not An Admin")
            next('/'); 
        }
    }
}

];

const router = createRouter({
history: createWebHistory(),
routes,
});

export default router;
