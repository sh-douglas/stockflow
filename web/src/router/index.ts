import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import ProductsView from '@/views/ProductsView.vue'
import CategoriesView from '@/views/CategoriesView.vue'
import StockMovementsView from '@/views/StockMovementsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
    },
    {
      path: '/stock-movements',
      name: 'stock-movements',
      component: StockMovementsView,
    },
  ],
})

export default router
