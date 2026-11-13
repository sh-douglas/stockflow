<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

type StockMovementType = 'IN' | 'OUT'

interface StockMovement {
  id: string
  productId: string
  type: StockMovementType
  quantity: number
  createdAt: string
}

interface StockMovementsResponse {
  movements: StockMovement[]
}

interface Product {
  id: string
  name: string
}

interface ProductResponse {
  products: Product[]
}

interface MovementForm {
  productId: string
  type: StockMovementType | ''
  quantity: string
}

const movements = ref<StockMovement[]>([])
const products = ref<Product[]>([])
const isLoading = ref<boolean>(true)
const errorMessage = ref<string | null>(null)
const isSubmitting = ref<boolean>(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)
const movementForm = reactive<MovementForm>({
  productId: '',
  type: '',
  quantity: '',
})

function formatDate(date: string) {
  const parsedDate = new Date(date)

  const dateFormatter = Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Bahia',
  })

  return dateFormatter.format(parsedDate)
}

async function loadMovements() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await fetch('http://localhost:3000/stock-movements')

    if (!response.ok) {
      throw new Error(`Falha ao carregar as movimentações ${response.status}`)
    }

    const data = (await response.json()) as StockMovementsResponse

    movements.value = data.movements
  } catch {
    errorMessage.value = 'Não foi possivel carregar as movimentações.'
  } finally {
    isLoading.value = false
  }
}

async function loadProducts() {
  try {
    const response = await fetch('http://localhost:3000/products')
    if (response.ok === false) {
      throw new Error(`Falha ao carregar dados da API ${response.status}`)
    }
    const data = (await response.json()) as ProductResponse
    products.value = data.products
  } catch (error) {
    console.error(error)
  }
}

function getProductName(productId: string) {
  const product = products.value.find((item) => item.id === productId)

  if (!product) {
    return productId
  }

  return product.name
}

function formatMovementType(type: StockMovementType) {
  if (type === 'IN') {
    return 'Entrada'
  }

  return 'Saída'
}

async function handleSubmit() {
  if (isSubmitting.value) {
    return
  }

  submitError.value = null
  submitSuccess.value = null

  const payload = {
    productId: movementForm.productId,
    type: movementForm.type,
    quantity: Number(movementForm.quantity),
  }

  if (payload.productId === '') {
    submitError.value = 'O campo Produto não pode estar vazio!'
    return
  }

  if (payload.type !== 'IN' && payload.type !== 'OUT') {
    submitError.value = 'Tipo de movimentação inválida.'
    return
  }

  if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) {
    submitError.value = 'Valor da movimentação invalido.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch(`http://localhost:3000/stock-movements/`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error(`Falha ao gerar movimentação ${response.status}`)
    }
    Object.assign(movementForm, {
      productId: '',
      type: '',
      quantity: '',
    })

    submitSuccess.value = 'Movimentação feita com sucesso.'
    await loadMovements()
  } catch {
    submitError.value = 'Falha ao realizar movimentação.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  await loadMovements()
  await loadProducts()
})
</script>

<template>
  <h1>Movimentações do Estoque</h1>
  <section class="category-form">
    <h2>Cadastrar movimentação</h2>
    <form @submit.prevent="handleSubmit">
      <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
      <p v-if="submitSuccess" class="submit-success" role="status">{{ submitSuccess }}</p>

      <div class="form-field">
        <label for="product">Produto</label>
        <select name="product" id="product" v-model="movementForm.productId" required>
          <option value="">Selecione um produto</option>
          <option :value="product.id" v-for="product in products" :key="product.id">
            {{ product.name }}
          </option>
        </select>
      </div>

      <div class="form-field">
        <label for="type">Tipo de movimentação</label>
        <select name="type" id="type" v-model="movementForm.type" required>
          <option value="">Selecione o tipo da movimentação</option>
          <option value="IN">Entrada</option>
          <option value="OUT">Saída</option>
        </select>
      </div>
      <div class="form-field">
        <label for="quantity">Quantidade</label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          min="1"
          step="1"
          required
          v-model="movementForm.quantity"
        />
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Cadastrando...' : 'Cadastrar' }}
        </button>
      </div>
    </form>
  </section>
  <section>
    <p v-if="isLoading">Carregando movimentações...</p>
    <p v-else-if="errorMessage" role="alert">{{ errorMessage }}</p>
    <p v-else-if="movements.length === 0">Nenhuma movimentação cadastrada.</p>
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="movement in movements" :key="movement.id">
            <td>{{ getProductName(movement.productId) }}</td>
            <td>
              <span
                class="movement-badge"
                :class="movement.type === 'IN' ? 'movement-badge--in' : 'movement-badge--out'"
              >
                {{ formatMovementType(movement.type) }}
              </span>
            </td>
            <td>{{ movement.quantity }}</td>
            <td>{{ formatDate(movement.createdAt) }}</td>
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

.movement-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.movement-badge--in {
  background-color: #dcfce7;
  color: #166534;
}
.movement-badge--out {
  background-color: #fee2e2;
  color: #991b1b;
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

form {
  margin-bottom: 20px;
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
