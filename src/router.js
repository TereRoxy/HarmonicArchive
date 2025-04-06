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
    component: Upload 
  },
  { 
    path: "/view", 
    component: View,
    children: [
      {
        path: ":id", // This will match /view/1, /view/2, etc.
        name: "ViewSheet", // This name is used in your navigation
        component: ViewMusicScore,
        props: (route) => ({ id: route.params.id }), // Pass the id as a prop to the component
        beforeEnter: (to, from, next) => {
          // Check if the id is a valid number
          const id = Number(to.params.id);
          if (isNaN(id)) {
            next({ name: "Home" }); // Redirect to Home if invalid
          } else {
            next(); // Proceed to the route
          }
        },
      }
    ]
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;