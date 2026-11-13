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
const isSubmitting = ref<boolean>(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)
const editError = ref<string | null>(null)
const editSuccess = ref<string | null>(null)
const deleteError = ref<string | null>(null)
const deleteSuccess = ref<string | null>(null)
const categoryForm = reactive({
  name: '',
})
const editingCategoryId = ref<string | null>(null)
const editName = ref<string>('')

onMounted(async () => {
  await loadCategories()
})

async function loadCategories() {
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
}

function formatDate(date: string) {
  const parsedDate = new Date(date)

  const dateFormatter = Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Bahia',
  })

  return dateFormatter.format(parsedDate)
}

async function handleSubmit() {
  if (isSubmitting.value) {
    return
  }

  submitError.value = null
  submitSuccess.value = null

  isSubmitting.value = true

  const payload = {
    name: categoryForm.name.trim(),
  }

  try {
    const response = await fetch('http://localhost:3000/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Falha ao cadastrar categoria ${response.status}`)
    }

    Object.assign(categoryForm, {
      name: '',
    })

    submitSuccess.value = 'Categoria cadastrada com sucesso'
    await loadCategories()
  } catch {
    submitError.value = 'Não foi possível cadastrar a categoria.'
  } finally {
    isSubmitting.value = false
  }
}

function startEditing(category: Category) {
  editingCategoryId.value = category.id
  editName.value = category.name
}

function cancelEditing() {
  editingCategoryId.value = null
  editName.value = ''
}

async function saveEditing() {
  if (editingCategoryId.value === null) {
    return
  }

  const payload = {
    name: editName.value.trim(),
  }

  try {
    const response = await fetch(`http://localhost:3000/categories/${editingCategoryId.value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Falha ao editar categoria ${response.status}`)
    }

    await loadCategories()
    cancelEditing()

    editSuccess.value = 'Categoria editada com sucesso'
  } catch {
    editError.value = 'Não foi possível editar a categoria.'
  }
}

async function deleteCategory(category: Category) {
  deleteError.value = ''
  deleteSuccess.value = ''

  try {
    const confirmed = window.confirm(`Deseja realmente apagar a categoria: ${category.name}?`)

    if (!confirmed) {
      return
    }

    const response = await fetch(`http://localhost:3000/categories/${category.id}`, {
      method: 'DELETE',
    })

    if (response.status === 409) {
      deleteError.value = 'Não é possivel excluir uma categoria que possui produtos vinculados'
      return
    }

    if (!response.ok) {
      throw new Error(`Falha ao excluir categoria ${response.status}`)
    }

    await loadCategories()
    deleteSuccess.value = 'Categoria excluida com sucesso.'
  } catch {
    deleteError.value = 'Não foi possivel excluir categoria. '
  }
}
</script>

<template>
  <h1>Categorias</h1>
  <section class="category-form">
    <h2>Cadastrar categoria</h2>
    <form @submit.prevent="handleSubmit">
      <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
      <p v-if="submitSuccess" class="submit-success" role="status">{{ submitSuccess }}</p>

      <div class="form-grid">
        <div class="form-field">
          <label for="name">Nome</label>
          <input type="text" id="name" name="name" v-model="categoryForm.name" required />
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
    <p v-if="editError" class="submit-error" role="alert">{{ editError }}</p>
    <p v-if="editSuccess" class="submit-success" role="status">{{ editSuccess }}</p>
    <p v-if="deleteError" class="submit-error" role="alert">{{ deleteError }}</p>
    <p v-if="deleteSuccess" class="submit-success" role="status">{{ deleteSuccess }}</p>
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
            <td>
              <input
                v-if="editingCategoryId === category.id"
                type="text"
                v-model="editName"
                required
              />
              <span v-else>
                {{ category.name }}
              </span>
            </td>
            <td>{{ formatDate(category.createdAt) }}</td>
            <td class="table-actions">
              <template v-if="editingCategoryId === category.id">
                <button
                  type="button"
                  class="action-button action-button--save"
                  @click="saveEditing"
                >
                  Salvar
                </button>

                <button
                  type="button"
                  class="action-button action-button--cancel"
                  @click="cancelEditing"
                >
                  Cancelar
                </button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="action-button action-button--edit"
                  @click="startEditing(category)"
                >
                  Editar
                </button>

                <button
                  type="button"
                  class="action-button action-button--delete"
                  @click="deleteCategory(category)"
                >
                  Deletar
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button--edit {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.action-button--delete {
  background-color: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.action-button--save {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}
.action-button--cancel {
  background-color: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

.action-button--edit:hover {
  background-color: #dbeafe;
}
.action-button--delete:hover {
  background-color: #fee2e2;
}
.action-button--save:hover {
  background-color: #1d4ed8;
}
.action-button--cancel:hover {
  background-color: #e2e8f0;
}

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
