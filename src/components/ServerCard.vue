<template>
  <div class="border p-4 rounded shadow mb-4">
    <h3>{{ server.title }} ({{ server.serverCategory }})</h3>
    <p>Link/IP: {{ server.link }}</p>
    <!-- Mais detalhes e botões (Editar, Excluir, Ver Sites se for File Server) -->
    <button @click="editServer">Editar</button>
    <button @click="deleteServer">Excluir</button>
    <button v-if="server.serverCategory === 'FILE_SERVER'" @click="viewSites">Ver Sites</button>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboardStore'

const props = defineProps({
  server: {
    type: Object,
    required: true
  }
})

const store = useDashboardStore()

function editServer() {
  // Chamar action do store para abrir modal de edição
  // store.openEditServerModal(props.server)
  console.log('Edit server:', props.server.id)
}

function deleteServer() {
  // Chamar action do store para confirmar exclusão
  // store.confirmDeleteServer(props.server)
  console.log('Delete server:', props.server.id)
}

function viewSites() {
  // Chamar action do store para selecionar este servidor e mostrar seus sites
  // store.selectServer(props.server)
  console.log('View sites for server:', props.server.id)
}
</script>

<style scoped>
/* Estilos para o card */
</style>
