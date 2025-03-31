// filepath: music-sheet-app/src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
import { faker } from "@faker-js/faker";

app.use(router).mount("#app");
