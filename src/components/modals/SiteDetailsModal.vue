<template>
  <div v-if="store.detailedSite" class="modal-backdrop">
    <div class="modal-content">
      <h2>Detalhes do Site: {{ store.detailedSite.domainName }}</h2>
      <p>Grupo (File Server): {{ store.detailedSite.groupName }}</p>
      <p>Usuário Admin: {{ store.detailedSite.adminUser }}</p>
      <p>Senha Admin: <PasswordInput :password="store.detailedSite.adminPassword" :id="store.detailedSite.id + 
'_modal'" /> </p>
      <!-- Adicionar outras informações: associações, custom fields -->
      <button type="button" @click="closeModal">Fechar</button>
      <button type="button" @click="editSite">Editar Site</button>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboardStore'
// import PasswordInput from '@/components/PasswordInput.vue' // Assuming this component exists

const store = useDashboardStore()

function closeModal() {
  store.detailedSite = null // Or call an action: store.closeSiteDetailsModal()
}

function editSite() {
  const siteToEdit = store.detailedSite // Get the site data
  store.detailedSite = null // Close this modal
  // store.openEditSiteModal(siteToEdit) // Call action to open edit modal
  console.log('Request edit for site:', siteToEdit?.id)
}

// Placeholder for PasswordInput component if not created yet
const PasswordInput = { 
  props: ['password', 'id'],
  template: '<span>{{ password }}</span>' // Simple display for now
}

</script>

<style scoped>
/* Reutilizar estilos de modal */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5); display: flex;
  justify-content: center; align-items: center;
}
.modal-content {
  background-color: white; padding: 20px; border-radius: 5px; color: black;
}
</style>
