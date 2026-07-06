<script setup lang="ts">
useHead({ title: 'Уведомления — Seller Marketplace' })
</script>

<template>
  <UDashboardPanel id="notifications">
    <template #header>
      <UDashboardNavbar title="Уведомления">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard
        title="Уведомления"
        description="Настройки уведомлений недоступны в полигоне."
        variant="subtle"
      >
        <div class="flex flex-col items-center justify-center py-12 gap-3">
          <UIcon name="i-lucide-bell" class="size-12 text-dimmed" />
          <p class="text-muted">
            Скоро будет
          </p>
        </div>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>
