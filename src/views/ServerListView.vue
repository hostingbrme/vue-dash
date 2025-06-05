<template>
  <div>
    <h2>Lista de Servidores ({{ category }})</h2>
    <!-- Loop v-for para exibir ServerCard -->
    <div v-if="store.isLoading">Carregando servidores...</div>
    <div v-else>
       <ServerCard v-for="server in filteredServers" :key="server.id" :server="server" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboardStore'
import ServerCard from '@/components/ServerCard.vue'

const store = useDashboardStore()
const route = useRoute()

const category = computed(() => route.params.category || 'ALL')

// Exemplo: A lógica de filtragem real estaria no store Pinia
const filteredServers = computed(() => {
  if (!store.allServers) return []
  if (category.value === 'ALL') return store.allServers
  return store.allServers.filter(s => s.serverCategory === category.value)
})

</script>

