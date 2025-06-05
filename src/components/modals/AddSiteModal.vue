<template>
  <div v-if="store.showAddSiteModal" class="modal-backdrop">
    <div class="modal-content">
      <h2>{{ store.isEditModeSite ? 'Editar Site' : 'Adicionar Novo Site' }}</h2>
      <form @submit.prevent="handleSubmit">
        <!-- Campos do formulário (v-model ligado a store.newSiteData) -->
        <label>Domínio: <input type="text" v-model="store.newSiteData.domainName" required></label>
        <label>File Server de Destino: {{ store.newSiteData.targetFileServerName }}</label>
        <!-- Adicionar outros campos: adminUser, adminPassword, associações, customFields, etc. -->

        <button type="submit">{{ store.isEditModeSite ? 'Salvar Alterações' : 'Adicionar Site' }}</button>
        <button type="button" @click="closeModal">Cancelar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboardStore'

const store = useDashboardStore()

function handleSubmit() {
  // Chamar action do store para salvar/atualizar
  // store.handleSubmitSiteForm()
  console.log('Submit Site Form:', store.newSiteData)
}

function closeModal() {
  // Chamar action do store para fechar modal
  // store.closeAddSiteModal()
  store.showAddSiteModal = false // Temporário para teste
}
</script>

<style scoped>
/* Reutilizar estilos do AddServerModal ou criar específicos */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0,0,0,0.5); display: flex;
  justify-content: center; align-items: center;
}
.modal-content {
  background-color: white; padding: 20px; border-radius: 5px; color: black;
}
label {
  display: block; margin-bottom: 10px;
}
</style>
