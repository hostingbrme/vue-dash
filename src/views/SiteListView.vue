<template>
  <div>
    <h2>Busca Global de Sites</h2>
    <input type="text" v-model="store.siteSearchQuery" placeholder="Buscar site por domínio, grupo...">
    <!-- Tabela ou lista para exibir SiteRow -->
    <div v-if="store.isLoading">Carregando sites...</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>Domínio</th>
            <th>Grupo (File Server)</th>
            <th>BD</th>
            <th>Proxy Reverso</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <SiteRow v-for="site in filteredSites" :key="site.id" :site="site" />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import SiteRow from "@/components/SiteRow.vue";

const store = useDashboardStore();

// Exemplo: A lógica de filtragem real estaria no store Pinia
const filteredSites = computed(() => {
  if (!store.allSitesFlattened) return []; // Supondo que allSitesFlattened exista no store
  const query = store.siteSearchQuery.toLowerCase().trim();
  if (!query) return store.allSitesFlattened;
  return store.allSitesFlattened.filter(
    (site) =>
      site.domainName?.toLowerCase().includes(query) ||
      site.groupName?.toLowerCase().includes(query)
    // Adicionar mais campos de busca se necessário
  );
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th,
td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
</style>

