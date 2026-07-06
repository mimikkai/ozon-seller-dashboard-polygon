<script setup lang="ts">
useHead({ title: 'Участники — Seller Marketplace' })
</script>

<template>
  <UDashboardPanel id="members">
    <template #header>
      <UDashboardNavbar title="Участники">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard
        title="Участники"
        description="Управление участниками недоступно в полигоне."
        variant="subtle"
      >
        <div class="flex flex-col items-center justify-center py-12 gap-3">
          <UIcon name="i-lucide-users" class="size-12 text-dimmed" />
          <p class="text-muted">
            Скоро будет
          </p>
        </div>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>
