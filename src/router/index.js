import { createRouter, createWebHistory } from 'vue-router'
import NewOrder from "../views/doctor/createOrder.vue"
import homeComponent from "@/views/home/homeComponent.vue";
import login from "@/views/auth/login.vue";
import AllOrders from "@/views/doctor/allOrders.vue";
import ShowOrder from '@/views/doctor/showOrders.vue';
import LabOrders from "@/views/lab/labOrders.vue";
import showOrderlab from "@/views/lab/showOrder.vue";
import myDoctors from "@/views/lab/myDoctors.vue";
import addDoctor from "@/views/lab/addDoctor.vue";
import contract from "@/views/lab/contractView.vue";
import deliverMain from "@/views/Delivery/pageDelivery.vue";
import BillingDashboard from "@/views/lab/accountsView.vue";
import SignupComponent from "@/views/auth/signup.vue"
const routes = [
  {
    path:'/',
    name: "homeComponent",
    component: homeComponent
  },
  {
    path: '/create-order',
    name: 'create-order',
    component: NewOrder,
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem('role');
      if (role === 'doctor') {
        console.log(role);
        next(); // allow access
      } else {
        next('/login'); // cancel navigation
        // Optionally redirect:
        // next('/not-authorized');
      }
    }
  },

  {
    path: '/login',
    name: "login",
    component: login,
  },
  {
    path: '/register',
    name: "register",
    component: SignupComponent,
  },
  {
    path: '/doctor/orders',
    name: 'AllOrders',
    component: AllOrders,
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem('role');
      if (role === 'doctor') {
        next(); // allow access
      } else {
        next('/login'); // cancel navigation
        // Or optionally:
        // next('/login');
      }
    }
  },

  {
    path: '/orders/:id',
    name: 'showOrder',
    component: ShowOrder,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/lab',
    name: "LabOrders",
    component: LabOrders
  },
  {
    path: '/showOrderlab/:id',
    name: "showOrderlab",
    component: showOrderlab,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/my-doctors',
    name: 'myDoctors',
    component: myDoctors,
  },
  {
    path: '/lab/add-doctor',
    name: 'addDoctor',
    component: addDoctor,
  },
  {
    path:'/doctor-contract/:id',
    name: 'contractContract',
    component: contract
  },
  {
    path: '/deliver-main',
    name: 'deliverMain',
    component: deliverMain,
  },
  {
    path: '/accounts',
    name: 'BillingDashboard',
    component: BillingDashboard,
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
