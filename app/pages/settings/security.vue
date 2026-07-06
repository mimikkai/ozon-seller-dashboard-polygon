<script setup lang="ts">
useHead({ title: 'Безопасность — Seller Marketplace' })
</script>

<template>
  <UDashboardPanel id="security">
    <template #header>
      <UDashboardNavbar title="Безопасность">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard
        title="Безопасность"
        description="Настройки безопасности недоступны в полигоне."
        variant="subtle"
      >
        <div class="flex flex-col items-center justify-center py-12 gap-3">
          <UIcon name="i-lucide-shield-check" class="size-12 text-dimmed" />
          <p class="text-muted">
            Скоро будет
          </p>
        </div>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>
