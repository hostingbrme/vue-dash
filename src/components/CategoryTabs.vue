<template>
  <div class="flex space-x-2 mb-4">
    <button @click="setFilter('ALL')" :class="{ 'active': store.selectedServerCategoryFilter === 'ALL' }">Todos</button>
    <button @click="setFilter('FILE_SERVER')" :class="{ 'active': store.selectedServerCategoryFilter === 'FILE_SERVER' }">File Servers</button>
    <button @click="setFilter('DB_SERVER')" :class="{ 'active': store.selectedServerCategoryFilter === 'DB_SERVER' }">Bancos de Dados</button>
    <button @click="setFilter('REVERSE_PROXY_SERVER')" :class="{ 'active': store.selectedServerCategoryFilter === 'REVERSE_PROXY_SERVER' }">Proxy Reverso</button>
    <button @click="setFilter('BACKUP_SERVER')" :class="{ 'active': store.selectedServerCategoryFilter === 'BACKUP_SERVER' }">Backup</button>
    <button @click="setFilter('EMAIL_SERVICE')" :class="{ 'active': store.selectedServerCategoryFilter === 'EMAIL_SERVICE' }">Email</button>
    <button @click="setFilter('GENERIC')" :class="{ 'active': store.selectedServerCategoryFilter === 'GENERIC' }">Genéricos</button>
  </div>
</template>

<script setup>
import { useDashboardStore } from "@/stores/dashboardStore";

const store = useDashboardStore();

function setFilter(category) {
  // Chamar action do store para definir a view e o filtro
  // store.setView("serversDashboard", category);
  store.selectedServerCategoryFilter = category; // Temporário para teste
  console.log("Set filter to:", category);
}
</script>

<style scoped>
button {
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}
button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>

