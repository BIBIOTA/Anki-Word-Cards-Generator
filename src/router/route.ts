const routes = [
    {
      path: "/",
      name: "index",
      title: "Anki Card Generator",
      component: () => import("@/views/Generator.vue"),
    }
  ];
   
export default routes;
