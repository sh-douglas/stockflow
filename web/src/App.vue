<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Dashboard</RouterLink>
      <RouterLink to="/products">Ir para Produtos</RouterLink>
      <RouterLink to="/categories">Ir para Categorias</RouterLink>
      <RouterLink to="/stock-movements">Movimentações</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
