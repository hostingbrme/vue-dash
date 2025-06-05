<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboardStore'

const store = useDashboardStore()

onMounted(() => {
  console.log('App.vue mounted, calling loadData...') // Log para confirmar a chamada
  store.loadData() // Chama a action para carregar os dados
})
</script>

<template>
  <!-- Seu template existente com <RouterView /> etc. -->
  <header>
    <!-- ... -->
  </header>

  <RouterView />

  <footer>
    <!-- ... -->
  </footer>
</template>
