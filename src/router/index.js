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
import sucessTransactions from "@/components/getRequests.vue";
import ContactsComponent from "@/components/getContacts.vue";
import DriverRequestsComponent from "@/components/getChangeReqs.vue";
import ShareTripMap from "@/components/shareTrip/shareTrip.vue";
import defineComponent from "@/components/couponsandMessages.vue";
import SpecialCases from "@/components/specialCases.vue";
const routes = [
    {
      path: "/special-cases",
        name: "specia-cases",
      component: SpecialCases,
    },
    {
      path: "/defineComponent",
      name: "defineComponent",
      component: defineComponent
    },
    {
      path: '/share-trip/:tripId/:driverId',
      name: 'share-tip',
      component: ShareTripMap
    },
    {
        path: "/change-reqs",
        name: "change-reqs",
        component: DriverRequestsComponent
    },
    {
      path: '/get-contact',
      name: "getContact",
      component: ContactsComponent
    },
    {
      path: '/sucesstrans',
      name: "Sucesstrans",
      component: sucessTransactions,
    },
    {
        path: '/confirm-requests/:id',
        name: 'confirmRequest',
        component: confirmRequest,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: "/wallet-systems",
        name: "walletSystems",
        component: walletSystems,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: "/get-req",
        name: "getreqComponent",
        component: getreqComponent,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: '/chat',
        name: 'chat',
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3" || role === "support4") {
                window.location.href = '/chat.html';
                return;
            }
            next('/');
        }
    },
    {
        path: '/chat-history',
        name: 'chatHisory',
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3" || role === "support4") {
                window.location.href = '/chat-history.html';
                return;
            }
            next('/');
        }
    },
    {
        path: "/",
        name: "auth",
        component: AuthComponent,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role) {
                if (role === 'admin' || role === 'support1') {
                    next('/home');
                } else if (role === 'support2') {
                    next('/waiting-drivers');
                } else if (role === 'support3') {
                    next('/admin/get-trips');
                } else if (role === 'support4') {
                    next('/chatSupport');
                } else {
                    next(); // Stay on auth page if role is unrecognized
                }
            } else {
                next(); // No role, stay on auth page
            }
        }
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
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: "/admin/drivers",
        name: "driversPanel",
        component: driversPanel,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3") {
                next(); // Allow access
            } else {
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
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3") {
                next(); // Allow access
            } else {
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
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3") {
                next(); // Allow access
            } else {
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
                next('/');
            }
        }
    },
    {
        path: "/chatSupport",
        name: "chatSupport",
        component: chatSupport,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3" || role === "support4") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: "/driver-signup",
        name: "DriverSignup",
        component: DriverSignup,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: "/coupons",
        name: "couponsComponent",
        component: couponsComponent,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: "/levels",
        name: "levelsComponent",
        component: levelComponent,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: '/driver/:driverId',
        name: 'DriverDetails',
        component: DriverDetails,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: '/user/:userId',
        name: 'UserDetails',
        component: UserDetails,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1" || role === "support2" || role === "support3") {
                next(); // Allow access
            } else {
                next('/');
            }
        }
    },
    {
        path: '/waiting-drivers',
        name: 'WaitingDrivers',
        component: WaitingDrivers,
        beforeEnter: (to, from, next) => {
            const role = localStorage.getItem('role');
            if (role === 'admin' || role === "support1" || role === "support2") {
                next(); // Allow access
            } else {
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