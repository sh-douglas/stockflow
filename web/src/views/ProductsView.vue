<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'

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

interface Category {
  id: string
  name: string
}

interface CategoryResponse {
  categories: Category[]
}

const products = ref<Product[]>([])
const errorMessage = ref<string | null>(null)
const isLoading = ref<boolean>(true)
const categories = ref<Category[]>([])
const isSubmitting = ref<boolean>(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)

function formatPrice(price: string) {
  const parsedPrice = Number(price)

  const priceFormatter = Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return priceFormatter.format(parsedPrice)
}

onMounted(async () => {
  await loadProducts()

  try {
    const response = await fetch('http://localhost:3000/categories')
    if (response.ok === false) {
      throw new Error(`Falha ao carregar dados da API ${response.status}`)
    }
    const data = (await response.json()) as CategoryResponse
    categories.value = data.categories
  } catch (error) {
    console.error(error)
  }
})

async function loadProducts() {
  isLoading.value = true
  errorMessage.value = null

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
}

const productForm = reactive({
  name: '',
  sku: '',
  price: '',
  categoryId: '',
})

async function handleSubmit() {
  if (isSubmitting.value) {
    return
  }

  submitError.value = null
  submitSuccess.value = null

  isSubmitting.value = true

  const payload = {
    name: productForm.name,
    sku: productForm.sku,
    price: Number(productForm.price),
    categoryId: productForm.categoryId,
  }

  try {
    const response = await fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Falha ao cadastrar produto ${response.status}`)
    }

    Object.assign(productForm, {
      name: '',
      sku: '',
      price: '',
      categoryId: '',
    })
    submitSuccess.value = 'Produto cadastrado com sucesso'
    await loadProducts()
  } catch {
    submitError.value = 'Não foi possível cadastrar o produto.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <h1>Produtos</h1>
  <section class="product-form">
    <h2>Cadastrar produto</h2>
    <form @submit.prevent="handleSubmit">
      <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
      <p v-if="submitSuccess" class="submit-success" role="status">{{ submitSuccess }}</p>
      <div class="form-grid">
        <div class="form-field">
          <label for="name">Nome</label>
          <input type="text" id="name" name="name" v-model="productForm.name" />
        </div>
        <div class="form-field">
          <label for="sku">Sku</label>
          <input type="text" id="sku" name="sku" v-model="productForm.sku" />
        </div>
        <div class="form-field">
          <label for="price">Preço</label>
          <input
            type="number"
            id="price"
            name="price"
            v-model="productForm.price"
            min="0.01"
            step="0.01"
          />
        </div>
        <div class="form-field">
          <label for="category">Categoria</label>
          <select name="category" id="category" v-model="productForm.categoryId">
            <option value="">Selecione uma categoria</option>
            <option :value="category.id" v-for="category in categories" :key="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </div>
    </form>
  </section>
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
h1 {
  margin-bottom: 32px;
}

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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field input,
.form-field select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #ffffff;
  color: #111827;
  font-size: 14px;
}

.form-field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-field input:focus-visible,
.form-field select:focus-visible {
  outline: 2px solid #2453eb;
  outline-offset: 2px;
}

form button {
  background-color: #2453eb;
  color: #ffffff;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.2s ease;
}

form button:hover {
  background-color: #1d4ed8;
}

form button:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
  opacity: 0.7;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-error,
.submit-success {
  border-radius: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1px solid transparent;
}

.submit-error {
  background-color: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.submit-success {
  background-color: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.product-form {
  margin-bottom: 32px;
}
</style>
