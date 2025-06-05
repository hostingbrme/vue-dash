<template>
  <div v-if="store.showAddServerModal" class="modal-backdrop">
    <div class="modal-content">
      <h2>{{ store.isEditModeServer ? 'Editar Servidor' : 'Adicionar Novo Servidor' }}</h2>
      <form @submit.prevent="handleSubmit">
        <!-- Campos do formulário (v-model ligado a store.newServerData) -->
        <label>Nome (Título): <input type="text" v-model="store.newServerData.title" required></label>
        <label>Categoria:
          <select v-model="store.newServerData.serverCategory">
            <option value="GENERIC">Genérico</option>
            <option value="FILE_SERVER">File Server</option>
            <option value="DB_SERVER">Banco de Dados</option>
            <option value="REVERSE_PROXY_SERVER">Proxy Reverso</option>
            <option value="BACKUP_SERVER">Backup</option>
            <option value="EMAIL_SERVICE">Serviço de Email</option>
          </select>
        </label>
        <label>Link/IP: <input type="text" v-model="store.newServerData.link"></label>
        <!-- Adicionar outros campos: port, login, password, customFields, etc. -->

        <button type="submit">{{ store.isEditModeServer ? 'Salvar Alterações' : 'Adicionar Servidor' }}</button>
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
  // store.handleSubmitServerForm()
  console.log('Submit Server Form:', store.newServerData)
}

function closeModal() {
  // Chamar action do store para fechar modal
  // store.closeAddServerModal()
  store.showAddServerModal = false // Temporário para teste
}
</script>

<style scoped>
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
