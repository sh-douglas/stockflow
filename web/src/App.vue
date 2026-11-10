<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="app-layout">
    <aside>
      <nav>
        <RouterLink to="/">Dashboard</RouterLink>
        <RouterLink to="/products">Ir para Produtos</RouterLink>
        <RouterLink to="/categories">Ir para Categorias</RouterLink>
        <RouterLink to="/stock-movements">Movimentações</RouterLink>
      </nav>
    </aside>
    <div class="content">
      <header>
        <h1>StockFlow</h1>
      </header>
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}
.app-layout aside {
  width: 240px;
  flex-shrink: 0;
  padding: 24px 16px;
  box-sizing: border-box;
  background-color: #111827;
  color: #f9fafb;
}

.app-layout aside nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-layout aside nav a {
  color: #d1d5db;
  text-decoration: none;
  padding: 12px 16px;
  border-radius: 8px;
  display: block;
}

.app-layout aside nav a.router-link-exact-active {
  background-color: #374151;
  color: #ffffff;
  font-weight: 600;
}

.app-layout aside nav a:hover {
  background-color: #374151;
  color: #ffffff;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.app-layout aside nav a:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

.content {
  flex: 1;
  min-width: 0;
  padding: 32px;
  background-color: #f9fafb;
  color: #111827;
}

.content header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.content header h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.content main {
  padding-top: 24px;
}
</style>
