<template>
  <tr>
    <td>{{ site.domainName }}</td>
    <td>{{ site.groupName }}</td>
    <td>{{ site.displayBdLink }}</td>
    <td>{{ site.displayReverseProxyLink }}</td>
    <td>
      <button @click="viewDetails">Detalhes</button>
      <button @click="editSite">Editar</button>
      <button @click="deleteSite">Excluir</button>
    </td>
  </tr>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboardStore'

const props = defineProps({
  site: {
    type: Object,
    required: true
  }
})

const store = useDashboardStore()

function viewDetails() {
  // Chamar action do store para abrir modal de detalhes
  // store.viewSiteDetails(props.site)
  console.log('View details for site:', props.site.id)
}

function editSite() {
  // Chamar action do store para abrir modal de edição
  // store.openEditSiteModal(props.site)
  console.log('Edit site:', props.site.id)
}

function deleteSite() {
  // Chamar action do store para confirmar exclusão
  // store.confirmDeleteSite(props.site.id, props.site.groupId)
  console.log('Delete site:', props.site.id)
}
</script>

<style scoped>
/* Estilos para a linha da tabela */
td button {
  margin-right: 5px;
}
</style>
