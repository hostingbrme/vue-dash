<template>
  <div>
    <h1>Visão Geral do Dashboard</h1>
    <!-- Conteúdo da view principal, como estatísticas e navegação -->
    <StatsDisplay />
    <CategoryTabs />
    <!-- Pode incluir ServerListView ou SiteListView aqui ou navegar para eles -->
  </div>
</template>

<script setup>
import StatsDisplay from '@/components/StatsDisplay.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
// Lógica da view principal
</script>

