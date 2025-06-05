import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ServerListView from '../views/ServerListView.vue'
import SiteListView from '../views/SiteListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      // Example route for server list by category
      path: '/servers/:category?', // Make category optional or handle 'ALL'
      name: 'serverList',
      component: ServerListView,
      props: true // Pass route params as props
    },
    {
      // Example route for global site search results
      path: '/sites',
      name: 'siteList',
      component: SiteListView,
      props: route => ({ query: route.query.q }) // Pass search query as prop
    }
    // Add other routes as needed
  ]
})

export default router

