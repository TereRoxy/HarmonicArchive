import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Upload from "./views/Upload.vue";
import View from "./views/View.vue";
import ViewMusicScore from "./components/ViewMusicScore.vue";

const routes = [
  { 
    path: "/", 
    component: Home 
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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;