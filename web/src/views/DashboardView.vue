<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'

interface Products {
  id: string
  name: string
  quantity: number
}

interface ProductsResponse {
  products: Products[]
}

interface Category {
  id: string
  name: string
}

interface CategoriesResponse {
  categories: Category[]
}

const products = ref<Products[]>([])
const categories = ref<Category[]>([])
const isLoading = ref<boolean>(true)
const errorMessage = ref<string | null>(null)

async function loadProducts() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await fetch('http://localhost:3000/products')

    if (!response.ok) {
      throw new Error(`Falha ao carregar dados da API ${response.status}`)
    }

    const data = (await response.json()) as ProductsResponse
    products.value = data.products
  } catch {
    errorMessage.value = 'Falha ao carregar informações da API.'
  } finally {
    isLoading.value = false
  }
}

async function loadCategories() {
  try {
    const response = await fetch('http://localhost:3000/categories')

    if (!response.ok) {
      throw new Error(`Falha ao carregar dados da API ${response.status}`)
    }

    const data = (await response.json()) as CategoriesResponse
    categories.value = data.categories
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  await loadProducts()
  await loadCategories()
})

const totalProducts = computed(() => {
  return products.value.length
})

const totalStock = computed(() => {
  return products.value.reduce((acc, product) => {
    return acc + product.quantity
  }, 0)
})

const lowStockProducts = computed(() => {
  return products.value.filter((product) => {
    return product.quantity <= 5
  })
})
</script>

<template>
  <h1>Dashboard</h1>
  <div class="stats-grid">
    <div class="stat-card">
      <h2>Total de Produtos</h2>
      <p>{{ totalProducts }}</p>
    </div>
    <div class="stat-card">
      <h2>Total de categorias</h2>
      <p>{{ categories.length }}</p>
    </div>
    <div class="stat-card">
      <h2>Unidades em Estoque</h2>
      <p>{{ totalStock }}</p>
    </div>
    <div class="stat-card">
      <h2>Produtos com estoque baixo</h2>
      <p>{{ lowStockProducts.length }}</p>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.stat-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
}

.stat-card h2 {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.stat-card p {
  font-size: 32px;
  font-weight: 700;
  margin-top: 12px;
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
