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
    import chatSupport from "../components/chatSupport.vue";
    import DriverSignup from "../components/driverSignup.vue";
    import getreqComponent from "../components/getReq.vue";
    import couponsComponent from "../components/couponsComponent.vue";
    import levelComponent from "../components/levels/levelComponent.vue";
    import DriverDetails from '@/components/getDriverbyId.vue';
    import UserDetails from '@/components/userDetails.vue';
    import WaitingDrivers from '@/components/waitingDrivers.vue';
    import walletSystems from "@/components/walletSystems.vue";
    import confirmRequest from '@/components/confirmRequests.vue';
    const routes = [
        {
          path: '/confirm-requests',
          name: 'confirmRequest',
          component: confirmRequest
        },
        {
          path: "/wallet-systems",
          name: "walletSystems",
          component: walletSystems
        },
         {
            path: "/get-req",
            name: "getreqComponent",
            component: getreqComponent
        },
        {
            path: '/chat',
            name: 'chat',
            beforeEnter: () => {
              window.location.href = '/chat.html';
            }
          },
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
        path: "/moderators",
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
    },
    {
        path: "/chatSupport",
        name: "chatSupport",
        component: chatSupport
    },
    {
        path: "/driver-signup",
        name: "DriverSignup",
        component: DriverSignup
    },
    {
        path: "/coupons",
        name: "couponsComponent",
        component: couponsComponent
    },
        {
            path: "/levels",
            name: "levelsComponent",
            component: levelComponent
        },
        {
            path: '/driver/:driverId',
            name: 'DriverDetails',
            component: DriverDetails
        },
        {
            path: '/user/:userId',
            name: 'UserDetails',
            component: UserDetails
        },
        {
            path: '/waiting-drivers',
            name: 'WaitingDrivers',
            component: WaitingDrivers
        }

    ];

    const router = createRouter({
    history: createWebHistory(),
    routes,
    });

    export default router;
