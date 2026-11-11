<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'

interface Category {
  id: string
  name: string
  createdAt: string
}

interface CategoryResponse {
  categories: Category[]
}

const categories = ref<Category[]>([])
const isLoading = ref<boolean>(true)
const errorMessage = ref<string | null>(null)
const categoryForm = reactive({
  name: '',
})

onMounted(async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await fetch('http://localhost:3000/categories')
    if (!response.ok) {
      throw new Error(`Falha ao carregar dados da API ${response.status}`)
    }

    const data = (await response.json()) as CategoryResponse
    categories.value = data.categories
  } catch {
    errorMessage.value = 'Não foi possivel carregar as categorias.'
  } finally {
    isLoading.value = false
  }
})

function formatDate(date: string) {
  const parsedDate = new Date(date)

  const dateFormatter = Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Bahia',
  })

  return dateFormatter.format(parsedDate)
}

async function handleSubmit() {
  const payload = {
    name: categoryForm.name,
  }
}
</script>

<template>
  <h1>Categorias</h1>
  <section class="category-form">
    <h2>Cadastrar categoria</h2>
    <form @submit.prevent="handleSubmit">
      <div class="form-grid">
        <div class="form-field">
          <label for="name">Nome</label>
          <input type="text" id="name" name="name" v-model="categoryForm.name" required />
        </div>
      </div>
      <div class="form-actions">
        <button type="submit">Cadastrar</button>
      </div>
    </form>
  </section>
  <section>
    <p v-if="isLoading">Carregando categorias...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <p v-else-if="categories.length === 0">Nenhuma categoria cadastrada</p>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Data de criação</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.name }}</td>
            <td>{{ formatDate(category.createdAt) }}</td>
            <td>
              <button>Deletar</button>
              <button>Editar</button>
            </td>
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

.form-field input {
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

.category-form {
  margin-bottom: 32px;
}
</style>
