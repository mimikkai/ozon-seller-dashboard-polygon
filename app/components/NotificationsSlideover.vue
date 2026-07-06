<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()
</script>

<template>
  <USlideover
    v-model:open="isNotificationsSlideoverOpen"
    title="Уведомления"
  >
    <template #body>
      <div class="flex flex-col items-center justify-center py-12 gap-3">
        <UIcon name="i-lucide-bell-off" class="size-12 text-dimmed" />
        <p class="text-muted">
          В полигоне нет уведомлений.
        </p>
      </div>
    </template>
  </USlideover>
</template>
