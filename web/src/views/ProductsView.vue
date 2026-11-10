<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Product {
  id: string
  name: string
  sku: string
  price: string
  quantity: number
  category: {
    id: string
    name: string
  }
}

interface ProductResponse {
  products: Product[]
}

const products = ref<Product[]>([])
const errorMessage = ref<string | null>(null)
const isLoading = ref<boolean>(true)

function formatPrice(price: string) {
  const parsedPrice = Number(price)

  const priceFormatter = Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return priceFormatter.format(parsedPrice)
}

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/products')
    if (response.ok === false) {
      throw new Error(`Falha ao carregar dados da API ${response.status}`)
    }
    const data = (await response.json()) as ProductResponse
    products.value = data.products
  } catch {
    errorMessage.value = 'Não foi possivel carregar os produtos.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <h1>Produtos</h1>
  <section>
    <p v-if="isLoading">Carregando produtos...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="products.length === 0">Nenhum produto cadastrado</p>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>SKU</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.sku }}</td>
            <td>{{ product.category.name }}</td>
            <td>{{ formatPrice(product.price) }}</td>
            <td>{{ product.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  background-color: #ffffff;
  border-radius: 8px;
  table-layout: fixed;
  min-width: 760px;
}

table tr th {
  text-align: left;
  padding: 14px 16px;
  background-color: #f3f4f6;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

table tr td {
  padding: 16px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

table tbody tr {
  transition: background-color 0.2s ease;
}

table tbody tr:hover {
  background-color: #f9fafb;
}
.table-wrapper {
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
}
</style>
