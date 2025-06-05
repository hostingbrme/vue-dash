<template>
  <div v-if="store.selectedServer" class="mt-4 p-4 border rounded bg-gray-200 dark:bg-gray-800">
    <h3>Detalhes de: {{ store.selectedServer.title }}</h3>
    <!-- Exibir detalhes do servidor -->
    <div v-if="store.selectedServer.serverCategory === 'FILE_SERVER'">
      <h4>Sites neste Servidor</h4>
      <button @click="openAddSiteModal">Adicionar Site</button>
      <div v-if="store.selectedServer.sites && store.selectedServer.sites.length > 0">
        <SiteRow v-for="site in store.selectedServer.sites" :key="site.id" :site="{ ...site, groupId: store.selectedServer.id, groupName: store.selectedServer.title }" />
      </div>
      <p v-else>Nenhum site neste servidor.</p>
    </div>
    <!-- Outros detalhes -->
  </div>
</template>

<script setup>
import { useDashboardStore } from "@/stores/dashboardStore";
import SiteRow from "@/components/SiteRow.vue";

const store = useDashboardStore();

function openAddSiteModal() {
  // store.openAddSiteModal(store.selectedServer)
  console.log("Open Add Site Modal for server:", store.selectedServer?.id);
}
</script>

