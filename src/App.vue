<template>
  <div>
    <!-- Layout Principal (ex: Cabeçalho, Barra Lateral) -->
    <header>Dashboard NC Host</header>
    <main>
      <router-view></router-view>
      <!-- Onde as views serão renderizadas -->
    </main>
    <footer>Rodapé</footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboardStore'

const store = useDashboardStore()

onMounted(() => {
  store.loadData() // Chama a action para carregar os dados
})
</script>

<style>
/* Estilos globais ou do layout principal */
</style>
