<template>
  <div>
    <h4>Estatísticas</h4>
    <p>File Servers: {{ store.stats?.totalFileServers ?? 0 }}</p>
    <p>Sites: {{ store.stats?.totalSites ?? 0 }}</p>
    <p>BD Servers: {{ store.stats?.totalBdServers ?? 0 }}</p>
    <!-- Adicionar outras estatísticas -->
  </div>
</template>

<script setup>
import { useDashboardStore } from "@/stores/dashboardStore";

const store = useDashboardStore();

// A lógica para calcular stats estará no getter do store
</script>

