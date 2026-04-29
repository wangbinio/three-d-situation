import { createRouter, createWebHistory } from "vue-router";

import SituationView from "@/views/SituationView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "situation",
      component: SituationView,
    },
  ],
});

export default router;
