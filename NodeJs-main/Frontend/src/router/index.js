import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import ProductDetail from "@/views/ProductDetail.vue";
import ProductManagement from '@/views/ProductManagement.vue';
import Products from '@/views/Products.vue'
import Cart from '@/views/Cart.vue';
import Profile from '@/views/Profile.vue'
import Orders from '@/views/Orders.vue'
import SearchResults from '@/views/SearchResults.vue'

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/product/:id", component: ProductDetail },
  {
    path: '/product-management',
    name: 'ProductManagement',
    component: ProductManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: Products
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: SearchResults
  },
  {
    path: '/new-arrivals',
    name: 'NewArrivals',
    component: Products,
    props: { type: 'new' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders,
    meta: { requiresAuth: true }
  },
  { 
    path: "/:pathMatch(.*)*", 
    name: "NotFound",
    component: () => import("@/views/NotFound.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem("user");
  let user = null;
  
  try {
    if (userStr) {
      user = JSON.parse(userStr);
      console.log('Current user:', user); // Debug
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem("user");
  }

  // Kiểm tra quyền truy cập
  if (to.meta.requiresAuth && !user) {
    console.log('Route requires auth, redirecting to login'); // Debug
    next('/login');
    return;
  }

  if (to.meta.requiresAdmin && (!user || user.role !== 'admin')) {
    console.log('Route requires admin, redirecting to home'); // Debug
    next('/');
    return;
  }

  next();
});

export default router;
