// filepath: c:\Users\Terer\Desktop\UNIVERSITY\AN 2\SEMESTRUL 4\MPP (Systems for Design and Implementations)\HarmonicArchive_draft\music-sheet-app\src\router.js
import { createRouter, createWebHistory } from "vue-router";
import Home from "./views/Home.vue";
import Upload from "./views/Upload.vue";
import View from "./views/View.vue";
import ViewMusicScore from "./components/ViewMusicScore.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/upload", component: Upload },
  { path: "/view", component: View },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
