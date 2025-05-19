import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Upload from "./views/Upload.vue";
import View from "./views/View.vue";
import ViewMusicScore from "./components/ViewMusicScore.vue";
import LoginRegister from "./views/LoginRegister.vue";

const routes = [
  {
    path: "/",
    name: "LoginRegister",
    component: LoginRegister,
  },
  {
    path: "/app",
    name: "Dashboard",
    component: Home,
  },
  { 
    path: "/upload", 
    name: "Upload",
    component: Upload 
  },
  // In router.js
  {
    path: "/:id",
    name: "ViewSheet",
    component: ViewMusicScore,
    props: (route) => ({ 
      id: route.params.id
    }),
    beforeEnter: (to, from, next) => {
      const id = Number(to.params.id);
      if (isNaN(id)) {
        next({ name: "Home" });
      } else {
        next();
      }
    },
  },
  {
    path: "/my-account",
    name: "MyAccount",
    component: () => import("./components/MyAccount.vue"),
    // meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {

  const isAuthenticated = !!localStorage.getItem("authToken"); // Check if the token exists
  if (to.name !== "LoginRegister" && !isAuthenticated) {
    next({ name: "LoginRegister" }); // Redirect to login if not authenticated
  } else {
    next(); // Proceed to the requested route
  }
});

export default router;